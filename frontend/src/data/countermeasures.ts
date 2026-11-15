/**
 * ASTRA HEALTH — Countermeasure Matrix
 *
 * DISCLAIMER: These are decision-support orientations, not validated medical prescriptions.
 * Final protocols must be defined and approved by mission flight surgeons.
 */
import type { Countermeasure } from '../types';

function createCountermeasure(data: Countermeasure): Countermeasure {
  return data;
}

export const COUNTERMEASURES: Record<string, Countermeasure> = {
  cm_fatigue: createCountermeasure({
    id: 'cm_fatigue',
    title: 'Protocolo de Gestión de Fatiga',
    priority: 'yellow',
    reason: 'El nivel de fatiga supera el umbral de advertencia configurado.',
    steps: [
      { order: 1, action: 'Reducir actividades físicas exigentes hasta recuperación.' },
      { order: 2, action: 'Revisar la planificación de tareas con el Control de Misión.' },
      { order: 3, action: 'Programar un período de descanso conforme al protocolo de recuperación.' },
      { order: 4, action: 'Registrar el seguimiento en el sistema de monitorización.' },
      { order: 5, action: 'Repetir la evaluación de fatiga tras el descanso.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_fatigue_critical: createCountermeasure({
    id: 'cm_fatigue_critical',
    title: 'Alerta de Fatiga Crítica',
    priority: 'red',
    reason: 'El nivel de fatiga ha alcanzado el umbral crítico configurado.',
    steps: [
      { order: 1, action: 'Detener inmediatamente cualquier actividad EVA o de alto riesgo.' },
      { order: 2, action: 'Notificar al comandante y al médico de misión.' },
      { order: 3, action: 'Iniciar protocolo de descanso de emergencia.' },
      { order: 4, action: 'Monitorización continua hasta recuperación documentada.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_sleep: createCountermeasure({
    id: 'cm_sleep',
    title: 'Sueño Insuficiente — Seguimiento',
    priority: 'yellow',
    reason: 'Las horas de sueño registradas están por debajo del umbral de advertencia.',
    steps: [
      { order: 1, action: 'Revisar el horario de sueño con el equipo médico.' },
      { order: 2, action: 'Evaluar posibles factores ambientales: ruido, luz, temperatura.' },
      { order: 3, action: 'Ajustar la carga de trabajo del siguiente turno.' },
      { order: 4, action: 'Registrar la observación en el historial de salud.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_sleep_critical: createCountermeasure({
    id: 'cm_sleep_critical',
    title: 'Privación de Sueño Crítica',
    priority: 'red',
    reason: 'Las horas de sueño están por debajo del umbral crítico configurado.',
    steps: [
      { order: 1, action: 'Priorizar descanso inmediato. Reasignar tareas críticas.' },
      { order: 2, action: 'Evaluar el rendimiento cognitivo antes de tareas de alto riesgo.' },
      { order: 3, action: 'Consultar con el médico de misión.' },
      { order: 4, action: 'Monitorizar frecuencia cardíaca y fatiga de forma continua.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_hr_high: createCountermeasure({
    id: 'cm_hr_high',
    title: 'Frecuencia Cardíaca Elevada',
    priority: 'yellow',
    reason: 'La frecuencia cardíaca supera el umbral de advertencia configurado.',
    steps: [
      { order: 1, action: 'Detener la actividad física en curso y descansar.' },
      { order: 2, action: 'Registrar la lectura y verificar si es coherente con la actividad reciente.' },
      { order: 3, action: 'Monitorizar la frecuencia durante 5 minutos.' },
      { order: 4, action: 'Seguir el procedimiento de evaluación de la misión si persiste.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_hr_critical: createCountermeasure({
    id: 'cm_hr_critical',
    title: 'Frecuencia Cardíaca Crítica',
    priority: 'red',
    reason: 'La frecuencia cardíaca ha superado el umbral crítico configurado.',
    steps: [
      { order: 1, action: 'Detener toda actividad inmediatamente y adoptar posición de reposo.' },
      { order: 2, action: 'Notificar al médico de misión y al Control de Misión.' },
      { order: 3, action: 'Iniciar el protocolo de evaluación cardiovascular.' },
      { order: 4, action: 'Preparar acceso a la dotación médica de emergencia.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_hr_low: createCountermeasure({
    id: 'cm_hr_low',
    title: 'Frecuencia Cardíaca Baja',
    priority: 'yellow',
    reason: 'La frecuencia cardíaca está por debajo del umbral de advertencia.',
    steps: [
      { order: 1, action: 'Verificar que el astronauta está consciente y orientado.' },
      { order: 2, action: 'Registrar la lectura y contexto (sueño, reposo profundo).' },
      { order: 3, action: 'Monitorizar continuamente los próximos 10 minutos.' },
      { order: 4, action: 'Seguir el procedimiento de evaluación si no se justifica por reposo.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_spo2: createCountermeasure({
    id: 'cm_spo2',
    title: 'SpO₂ Reducida — Verificar y Monitorizar',
    priority: 'yellow',
    reason: 'La saturación de oxígeno está por debajo del umbral de advertencia configurado.',
    steps: [
      { order: 1, action: 'Verificar la colocación correcta del sensor y repetir la lectura.' },
      { order: 2, action: 'Revisar la presión de oxígeno de la cabina con el sistema ambiental.' },
      { order: 3, action: 'Monitorizar frecuencia cardíaca y respiratoria de forma continua.' },
      { order: 4, action: 'Seguir el protocolo de oxigenación de la misión si la lectura persiste.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_spo2_critical: createCountermeasure({
    id: 'cm_spo2_critical',
    title: 'SpO₂ Crítica — Protocolo de Emergencia',
    priority: 'red',
    reason: 'La saturación de oxígeno ha alcanzado el umbral crítico configurado.',
    steps: [
      { order: 1, action: 'Iniciar protocolo de emergencia de oxigenación de la misión.' },
      { order: 2, action: 'Notificar al médico de misión y al Control de Misión de inmediato.' },
      { order: 3, action: 'Verificar el sistema de suministro de oxígeno de la nave.' },
      { order: 4, action: 'Preparar acceso a suministro suplementario de oxígeno.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. Seguir el protocolo oficial de misión.',
  }),
  cm_radiation: createCountermeasure({
    id: 'cm_radiation',
    title: 'Protección Radiológica — Advertencia',
    priority: 'yellow',
    reason: 'La tasa de dosis de radiación supera el umbral de advertencia configurado.',
    steps: [
      { order: 1, action: 'Registrar el incremento y notificar al responsable de seguridad radiológica.' },
      { order: 2, action: 'Revisar la trayectoria y posición en la nave respecto a blindaje disponible.' },
      { order: 3, action: 'Consultar las directrices de dosis de la misión con el Control de Misión.' },
      { order: 4, action: 'Monitorizar la dosis acumulada de forma continua.' },
    ],
    disclaimer: 'Los umbrales son de demostración. Los límites oficiales provienen de los protocolos de la misión.',
  }),
  cm_radiation_critical: createCountermeasure({
    id: 'cm_radiation_critical',
    title: 'Tormenta Solar — Protocolo de Protección',
    priority: 'red',
    reason: 'La tasa de dosis de radiación ha superado el umbral crítico. Posible evento de partículas energéticas.',
    steps: [
      { order: 1, action: 'Seguir el protocolo de tormenta solar de la misión de inmediato.' },
      { order: 2, action: 'Desplazarse a la zona de mayor blindaje disponible en la nave.' },
      { order: 3, action: 'Notificar a toda la tripulación y al Control de Misión.' },
      { order: 4, action: 'Minimizar las actividades extravehiculares hasta que cese el evento.' },
      { order: 5, action: 'Registrar la dosis acumulada cada 30 minutos.' },
    ],
    disclaimer: 'Los refugios y protocolos reales deben estar definidos en el plan de misión. Esta es una orientación de demostración.',
  }),
  cm_co2: createCountermeasure({
    id: 'cm_co2',
    title: 'CO₂ Elevado — Verificación Ambiental',
    priority: 'yellow',
    reason: 'La concentración de CO₂ en cabina supera el umbral de advertencia configurado.',
    steps: [
      { order: 1, action: 'Verificar el sistema de eliminación de CO₂ (CDRA o equivalente).' },
      { order: 2, action: 'Comprobar los filtros y el cartucho absorbente.' },
      { order: 3, action: 'Seguir el protocolo ambiental de la misión.' },
      { order: 4, action: 'Registrar el evento y notificar al Control de Misión.' },
    ],
    disclaimer: 'Los límites operativos reales proceden de los protocolos ambientales de la misión.',
  }),
  cm_co2_critical: createCountermeasure({
    id: 'cm_co2_critical',
    title: 'CO₂ Crítico — Emergencia Ambiental',
    priority: 'red',
    reason: 'La concentración de CO₂ ha superado el umbral crítico configurado.',
    steps: [
      { order: 1, action: 'Activar el protocolo de emergencia ambiental de la misión.' },
      { order: 2, action: 'Iniciar el procedimiento de reducción de CO₂ de emergencia.' },
      { order: 3, action: 'Notificar al comandante y al Control de Misión de inmediato.' },
      { order: 4, action: 'Evaluar el uso de mascarillas si están disponibles.' },
      { order: 5, action: 'Monitorizar síntomas en toda la tripulación.' },
    ],
    disclaimer: 'Los límites operativos reales proceden de los protocolos ambientales de la misión.',
  }),
  cm_fatigue_stress: createCountermeasure({
    id: 'cm_fatigue_stress',
    title: 'Combinación Fatiga + Estrés',
    priority: 'yellow',
    reason: 'Se han detectado simultáneamente fatiga y estrés elevados.',
    steps: [
      { order: 1, action: 'Realizar una evaluación de bienestar breve.' },
      { order: 2, action: 'Revisar la carga de trabajo y redistribuir tareas si es posible.' },
      { order: 3, action: 'Programar tiempo de descanso y recuperación.' },
      { order: 4, action: 'Monitorizar la evolución de los indicadores en las próximas horas.' },
      { order: 5, action: 'Consultar con el equipo médico si persiste la combinación.' },
    ],
    disclaimer: 'Orientación de apoyo a la decisión. No constituye diagnóstico psicológico.',
  }),
};