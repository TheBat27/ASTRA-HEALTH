import { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Play, Zap, CheckCircle, BarChart2, Clock, Info } from 'lucide-react';
import { useApp } from '../store/AppContext';
import Panel from '../components/ui/Panel';
import type { CognitiveTestPhase, ReactionTrial, WellnessAnswers, CognitiveTestResult } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

// Config
const TEST_DURATION_MS = 120_000; // 2 minutes
const MIN_WAIT_MS = 1500;
const MAX_WAIT_MS = 4000;
const STIMULUS_TIMEOUT_MS = 2000;
const TRIALS_MAX = 30;

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

const WELLNESS_QUESTIONS = [
  { key: 'mood' as const,   label: '¿Cómo te sientes emocionalmente ahora?', low: 'Muy mal', high: 'Excelente' },
  { key: 'stress' as const, label: '¿Qué nivel de estrés sientes actualmente?', low: 'Sin estrés', high: 'Estrés máximo' },
  { key: 'fatigue' as const,label: '¿Qué nivel de fatiga experimentas?', low: 'Sin fatiga', high: 'Agotado' },
];

export default function CognitiveTest() {
  const { state, addCognitiveResult } = useApp();
  const [phase, setPhase] = useState<CognitiveTestPhase>('idle');
  const [trials, setTrials] = useState<ReactionTrial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimulusVisible, setStimulusVisible] = useState(false);
  const [stimulusShownAt, setStimulusShownAt] = useState<number | null>(null);
  const [responded, setResponded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MS);
  const [result, setResult] = useState<CognitiveTestResult | null>(null);
  const [wellness, setWellness] = useState<Partial<WellnessAnswers>>({});
  const [showHistory, setShowHistory] = useState(false);

  const startTimeRef = useRef<number>(0);
  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trialCountRef = useRef(0);
  const trialsRef = useRef<ReactionTrial[]>([]);

  const clearTimers = () => {
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    if (stimTimerRef.current) clearTimeout(stimTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const finishTest = useCallback((finalTrials: ReactionTrial[]) => {
    clearTimers();
    setStimulusVisible(false);

    const correct = finalTrials.filter(t => t.outcome === 'correct');
    const rts = correct.map(t => t.reactionTime!);

    const r: CognitiveTestResult = {
      id: `cog_${Date.now()}`,
      completedAt: Date.now(),
      durationMs: TEST_DURATION_MS,
      trials: finalTrials,
      medianRT: rts.length > 0 ? median(rts) : null,
      meanRT: rts.length > 0 ? parseFloat(mean(rts).toFixed(1)) : null,
      correct: correct.length,
      anticipations: finalTrials.filter(t => t.outcome === 'anticipation').length,
      omissions: finalTrials.filter(t => t.outcome === 'omission').length,
      variabilityRT: rts.length >= 2 ? parseFloat(stddev(rts).toFixed(1)) : null,
      wellness: null,
    };
    setResult(r);
    setPhase('completed');
  }, []);

  const scheduleTrial = useCallback(() => {
    if (trialCountRef.current >= TRIALS_MAX) {
      finishTest(trialsRef.current);
      return;
    }
    const wait = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    setResponded(false);
    setStimulusVisible(false);
    setCurrentTrial(trialCountRef.current);

    waitTimerRef.current = setTimeout(() => {
      const shownAt = performance.now();
      setStimulusShownAt(shownAt);
      setStimulusVisible(true);
      setResponded(false);

      // Omission timeout
      stimTimerRef.current = setTimeout(() => {
        const trial: ReactionTrial = {
          trialIndex: trialCountRef.current,
          stimulusShownAt: shownAt,
          respondedAt: null,
          reactionTime: null,
          outcome: 'omission',
        };
        trialsRef.current = [...trialsRef.current, trial];
        setTrials([...trialsRef.current]);
        trialCountRef.current++;
        setStimulusVisible(false);
        scheduleTrial();
      }, STIMULUS_TIMEOUT_MS);
    }, wait);
  }, [finishTest]);

  function startTest() {
    clearTimers();
    trialCountRef.current = 0;
    trialsRef.current = [];
    setTrials([]);
    setResult(null);
    setWellness({});
    startTimeRef.current = Date.now();
    setTimeLeft(TEST_DURATION_MS);
    setPhase('waiting');

    // Global countdown
    countdownRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const left = Math.max(0, TEST_DURATION_MS - elapsed);
      setTimeLeft(left);
      if (left === 0) {
        finishTest(trialsRef.current);
      }
    }, 500);

    scheduleTrial();
  }

  function handleResponse() {
    if (phase !== 'waiting') return;

    const now = performance.now();

    if (!stimulusVisible || stimulusShownAt === null) {
      // Anticipation
      const trial: ReactionTrial = {
        trialIndex: trialCountRef.current,
        stimulusShownAt: now,
        respondedAt: now,
        reactionTime: null,
        outcome: 'anticipation',
      };
      trialsRef.current = [...trialsRef.current, trial];
      setTrials([...trialsRef.current]);
      trialCountRef.current++;
      return;
    }

    if (responded) return; // Don't double-count

    // Correct response
    if (stimTimerRef.current) clearTimeout(stimTimerRef.current);
    const rt = parseFloat((now - stimulusShownAt).toFixed(1));
    const trial: ReactionTrial = {
      trialIndex: trialCountRef.current,
      stimulusShownAt,
      respondedAt: now,
      reactionTime: rt,
      outcome: 'correct',
    };
    trialsRef.current = [...trialsRef.current, trial];
    setTrials([...trialsRef.current]);
    trialCountRef.current++;
    setResponded(true);
    setStimulusVisible(false);

    setTimeout(scheduleTrial, 400);
  }

  function saveWellness() {
    if (!result) return;
    const w = wellness as WellnessAnswers;
    if (!w.mood || !w.stress || !w.fatigue) return;
    const finalResult = { ...result, wellness: w };
    setResult(finalResult);
    addCognitiveResult(finalResult);
    setPhase('idle');
  }

  useEffect(() => () => clearTimers(), []);

  const prevResults = state.cognitiveResults;
  const baseline = prevResults.length >= 3
    ? parseFloat(mean(prevResults.slice(0, 5).map(r => r.medianRT ?? 0).filter(v => v > 0)).toFixed(1))
    : null;

  const pct = ((TEST_DURATION_MS - timeLeft) / TEST_DURATION_MS) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain size={24} className="text-purple-400" /> Test Cognitivo
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Evaluación de tiempo de reacción · 2 minutos · Resultados guardados localmente</p>
      </div>

      {/* Disclaimer */}
      <Panel className="border-purple-500/20 bg-purple-500/5">
        <div className="flex gap-3">
          <Info size={15} className="text-purple-400 mt-0.5 shrink-0" />
          <p className="text-purple-200 text-sm">
            Los resultados miden el tiempo de reacción como indicador de rendimiento cognitivo.
            Las variaciones pueden generar advertencias de seguimiento, pero <strong>no constituyen diagnóstico neurológico o psicológico</strong>.
          </p>
        </div>
      </Panel>

      {/* IDLE — Instructions */}
      {phase === 'idle' && (
        <Panel>
          <h2 className="text-lg font-semibold text-white mb-4">Instrucciones</h2>
          <ol className="space-y-2 text-sm text-slate-300 mb-6">
            <li className="flex gap-2"><span className="text-electric-400 font-mono">1.</span> La pantalla estará en espera con el fondo oscuro.</li>
            <li className="flex gap-2"><span className="text-electric-400 font-mono">2.</span> Cuando aparezca el estímulo <span className="text-green-400 font-bold">VERDE</span>, pulsa el botón lo más rápido posible.</li>
            <li className="flex gap-2"><span className="text-electric-400 font-mono">3.</span> No pulses antes de que aparezca (anticipación = error).</li>
            <li className="flex gap-2"><span className="text-electric-400 font-mono">4.</span> Si no respondes en 2 s, se registra como omisión.</li>
            <li className="flex gap-2"><span className="text-electric-400 font-mono">5.</span> La prueba dura 2 minutos.</li>
          </ol>
          {baseline && (
            <div className="bg-space-700/50 rounded-lg p-3 mb-4 text-sm">
              <p className="text-slate-400">Tu línea base actual (últimas pruebas):</p>
              <p className="text-white font-mono text-lg">{baseline} ms <span className="text-slate-400 text-sm font-sans">tiempo de reacción mediano</span></p>
            </div>
          )}
          {!baseline && prevResults.length < 3 && (
            <p className="text-slate-500 text-sm mb-4">
              Necesitas al menos 3 pruebas para establecer tu línea base personal.
              Pruebas realizadas: <span className="text-white font-mono">{prevResults.length}</span>
            </p>
          )}
          <button onClick={startTest} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-lg hover:bg-purple-500/30 transition-all">
            <Play size={20} /> Comenzar Prueba
          </button>
        </Panel>
      )}

      {/* WAITING / STIMULUS — Active test */}
      {phase === 'waiting' && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-space-800 rounded-lg p-3">
            <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
              <span>Tiempo restante</span>
              <span>{Math.ceil(timeLeft / 1000)}s</span>
            </div>
            <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Intentos: {trials.length}</span>
              <span>Correctos: {trials.filter(t => t.outcome === 'correct').length}</span>
              <span>Errores: {trials.filter(t => t.outcome !== 'correct').length}</span>
            </div>
          </div>

          {/* Stimulus area */}
          <div
            onClick={handleResponse}
            className={clsx(
              'flex items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-100',
              stimulusVisible
                ? 'bg-green-500/30 border-2 border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.4)]'
                : 'bg-space-800 border-2 border-white/10',
            )}
            style={{ height: 280 }}
          >
            {stimulusVisible ? (
              <div className="text-center">
                <div className="text-green-300 text-6xl mb-3 font-bold animate-pulse">●</div>
                <p className="text-green-400 font-bold text-lg">¡PULSA AHORA!</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-slate-700 text-5xl mb-3">●</div>
                <p className="text-slate-600">Espera el estímulo…</p>
              </div>
            )}
          </div>
          <p className="text-center text-slate-500 text-sm">Haz clic en cualquier lugar de la pantalla cuando veas el estímulo verde</p>
        </div>
      )}

      {/* COMPLETED — Results */}
      {phase === 'completed' && result && (
        <div className="space-y-4">
          <Panel glow="blue">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle size={20} className="text-green-400" />
              <h2 className="text-lg font-semibold text-white">Resultados de la Prueba</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'TR Mediano', value: result.medianRT ? `${result.medianRT.toFixed(0)} ms` : 'N/A', sub: baseline ? `Línea base: ${baseline} ms` : 'Sin línea base aún' },
                { label: 'TR Promedio', value: result.meanRT ? `${result.meanRT.toFixed(0)} ms` : 'N/A', sub: 'Tiempo medio de reacción' },
                { label: 'Correctas', value: result.correct, sub: `de ${result.trials.length} estímulos` },
                { label: 'Anticipaciones', value: result.anticipations, sub: 'Respuestas prematuras' },
                { label: 'Omisiones', value: result.omissions, sub: 'Sin respuesta' },
                { label: 'Variabilidad', value: result.variabilityRT ? `${result.variabilityRT} ms` : 'N/A', sub: 'Desviación estándar del TR' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-space-700/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">{label}</div>
                  <div className="text-xl font-bold font-mono text-white">{value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {baseline && result.medianRT && (
              <div className={clsx(
                'rounded-lg p-3 text-sm border',
                result.medianRT > baseline * 1.3
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                  : 'bg-green-500/10 border-green-500/20 text-green-300'
              )}>
                {result.medianRT > baseline * 1.3
                  ? `⚠ Tu tiempo de reacción mediano (${result.medianRT.toFixed(0)} ms) es un ${(((result.medianRT - baseline) / baseline) * 100).toFixed(0)}% más alto que tu línea base. Se recomienda seguimiento.`
                  : `✓ Tu tiempo de reacción está dentro del rango habitual respecto a tu línea base.`
                }
              </div>
            )}
          </Panel>

          {/* Wellness questionnaire — EXACTLY 3 QUESTIONS */}
          <Panel>
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Brain size={16} className="text-purple-400" /> Cuestionario de Bienestar
            </h3>
            <div className="space-y-5">
              {WELLNESS_QUESTIONS.map(q => (
                <div key={q.key}>
                  <p className="text-slate-200 text-sm font-medium mb-2">{q.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-20 text-right">{q.low}</span>
                    <div className="flex gap-2 flex-1 justify-center">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button
                          key={v}
                          onClick={() => setWellness(prev => ({ ...prev, [q.key]: v }))}
                          className={clsx(
                            'w-10 h-10 rounded-full border-2 font-mono text-sm font-bold transition-all',
                            wellness[q.key] === v
                              ? 'bg-purple-500/30 border-purple-400 text-purple-300 scale-110'
                              : 'border-white/20 text-slate-400 hover:border-purple-500/50 hover:text-purple-300'
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 w-20">{q.high}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={saveWellness}
                disabled={!wellness.mood || !wellness.stress || !wellness.fatigue}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold hover:bg-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} /> Guardar Resultados
              </button>
              <button
                onClick={startTest}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-space-700 border border-white/10 text-slate-300 hover:border-white/20 transition-all"
              >
                <Zap size={16} /> Repetir
              </button>
            </div>
          </Panel>
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <BarChart2 size={15} />
          {showHistory ? 'Ocultar historial' : `Ver historial (${prevResults.length} prueba${prevResults.length !== 1 ? 's' : ''})`}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2">
            {prevResults.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay pruebas anteriores guardadas.</p>
            ) : (
              prevResults.slice(0, 10).map(r => (
                <div key={r.id} className="border border-white/5 rounded-lg px-4 py-3 bg-space-800/50 text-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-slate-400 font-mono text-xs">
                        {format(new Date(r.completedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>
                    <div className="flex gap-4 font-mono text-xs">
                      <span className="text-white">{r.medianRT ? `${r.medianRT.toFixed(0)} ms` : 'N/A'}</span>
                      <span className="text-green-400">✓ {r.correct}</span>
                      <span className="text-red-400">✗ {r.anticipations + r.omissions}</span>
                      {r.wellness && (
                        <span className="text-purple-400">
                          😊{r.wellness.mood} 😰{r.wellness.stress} 😴{r.wellness.fatigue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
