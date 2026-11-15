/**
 * ASTRA HEALTH — Countermeasure Matrix
 *
 * DISCLAIMER: These are decision-support orientations, not validated medical
 * prescriptions. Final protocols must be defined and approved by mission
 * flight surgeons.
 *
 * NOTA DE ARQUITECTURA (Sakuga Team - NASA Space Apps Challenge 2026):
 * Archivo adaptado para mantener la matriz de contramedidas del sistema
 * autónomo 100% local, sin requerir bases de datos externas.
 */
import type { Countermeasure } from '../types';

type Priority = Countermeasure['priority'];

const DISCLAIMER =
  'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.';

interface CountermeasureInput {
  id: string;
  priority: Priority;
  title: string;
  reason: string;
  /** Acciones en orden; el campo `order` se genera automáticamente (1, 2, 3…). */
  actions: string[];
}

function createCountermeasure({
  id,
  priority,
  title,
  reason,
  actions,
}: CountermeasureInput): Countermeasure {
  return {
    id,
    title,
    priority,
    reason,
    steps: actions.map((action, index) => ({ order: index + 1, action })),
    disclaimer: DISCLAIMER,
  };
}

const COUNTERMEASURE_LIST: Countermeasure[] = [
  // ── Fatiga ────────────────────────────────────────────────────────────────
  createCountermeasure({
    id: 'cm_fatigue',
    priority: 'yellow',
    title: 'Protocolo de Gestión de Fatiga',
    reason: 'El nivel de fatiga supera el umbral de advertencia configurado.',
    actions: [
      'Reducir actividades físicas exigentes hasta recuperación.',
      'Revisar la planificación de tareas con el Control de Misión.',
      'Programar un período de descanso conforme al protocolo de recuperación.',
      'Registrar el seguimiento en el sistema de monitorización.',
      'Repetir la evaluación de fatiga tras el descanso.',
    ],
  }),
  createCountermeasure({
    id: 'cm_fatigue_critical',
    priority: 'red',
    title: 'Alerta de Fatiga Crítica',
    reason: 'El nivel de fatiga ha alcanzado el umbral crítico configurado.',
    actions: [
      'Detener inmediatamente cualquier actividad EVA o de alto riesgo.',
      'Notificar al comandante y al médico de misión.',
      'Iniciar protocolo de descanso de emergencia.',
      'Monitorización continua hasta recuperación documentada.',
    ],
  }),

  // ── Sueño ─────────────────────────────────────────────────────────────────
  createCountermeasure({
    id: 'cm_sleep',
    priority: 'yellow',
    title: 'Sueño Insuficiente — Seguimiento',
    reason: 'Las horas de sueño registradas están por debajo del umbral de advertencia.',
    actions: [
      'Revisar el horario de sueño con el equipo médico.',
      'Evaluar posibles factores ambientales: ruido, luz, temperatura.',
      'Ajustar la carga de trabajo del siguiente turno.',
      'Registrar la observación en el historial de salud.',
    ],
  }),
  createCountermeasure({
    id: 'cm_sleep_critical',
    priority: 'red',
    title: 'Privación de Sueño Crítica',
    reason: 'Las horas de sueño están por debajo del umbral crítico configurado.',
    actions: [
      'Priorizar descanso inmediato. Reasignar tareas críticas.',
      'Evaluar el rendimiento cognitivo antes de tareas de alto riesgo.',
      'Consultar con el médico de misión.',
      'Monitorizar frecuencia cardíaca y fatiga de forma continua.',
    ],
  }),

  // ── Frecuencia cardíaca ───────────────────────────────────────────────────
  createCountermeasure({
    id: 'cm_hr_high',
    priority: 'yellow',
    title: 'Frecuencia Cardíaca Elevada',
    reason: 'La frecuencia cardíaca supera el umbral de advertencia configurado.',
    actions: [
      'Detener la actividad física en curso y descansar.',
      'Registrar la lectura y verificar si es coherente con la actividad reciente.',
      'Monitorizar la frecuencia durante 5 minutos.',
      'Seguir el procedimiento de evaluación de la misión si persiste.',
    ],
  }),
  createCountermeasure({
    id: 'cm_hr_critical',
    priority: 'red',
    title: 'Frecuencia Cardíaca Crítica',
    reason: 'La frecuencia cardíaca ha superado el umbral crítico configurado.',
    actions: [
      'Detener toda actividad inmediatamente y adoptar posición de reposo.',
      'Notificar al médico de misión y al Control de Misión.',
      'Iniciar el protocolo de evaluación cardiovascular.',
      'Preparar acceso a la dotación médica de emergencia.',
    ],
  }),

  // TODO: pegar aquí cm_hr_low y el resto de contramedidas (el archivo original
  // llegó cortado a partir de cm_hr_low).
];

/** Matriz indexada por id, para búsqueda O(1) desde el motor de reglas. */
export const COUNTERMEASURES: Record<string, Countermeasure> = Object.fromEntries(
  COUNTERMEASURE_LIST.map((countermeasure) => [countermeasure.id, countermeasure]),
);