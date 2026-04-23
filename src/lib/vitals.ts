// Backend integration point: replace mock generators with Socket.io client events

export type AlertSeverity = 'critical' | 'warning' | 'normal';

export interface VitalReading {
  id: string;
  timestamp: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  systolic: number;
  diastolic: number;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  metric: string;
  value: string;
  severity: 'critical' | 'warning';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  ward: string;
  condition: string;
  connected: boolean;
  lastReading: VitalReading | null;
  history: VitalReading[];
}

// Threshold definitions
export const THRESHOLDS = {
  heartRate: {
    criticalLow: 40,
    warningLow: 50,
    warningHigh: 110,
    criticalHigh: 130,
  },
  spo2: {
    criticalLow: 90,
    warningLow: 94,
  },
  temperature: {
    criticalLow: 35,
    criticalHigh: 39.5,
    warningLow: 35.5,
    warningHigh: 38.5,
  },
  systolic: {
    warningHigh: 140,
    criticalHigh: 160,
  },
};

export function getHeartRateStatus(value: number): AlertSeverity {
  const t = THRESHOLDS.heartRate;
  if (value < t.criticalLow || value > t.criticalHigh) return 'critical';
  if (value < t.warningLow || value > t.warningHigh) return 'warning';
  return 'normal';
}

export function getSpo2Status(value: number): AlertSeverity {
  const t = THRESHOLDS.spo2;
  if (value < t.criticalLow) return 'critical';
  if (value < t.warningLow) return 'warning';
  return 'normal';
}

export function getTemperatureStatus(value: number): AlertSeverity {
  const t = THRESHOLDS.temperature;
  if (value < t.criticalLow || value > t.criticalHigh) return 'critical';
  if (value < t.warningLow || value > t.warningHigh) return 'warning';
  return 'normal';
}

export function getSystolicStatus(value: number): AlertSeverity {
  const t = THRESHOLDS.systolic;
  if (value > t.criticalHigh) return 'critical';
  if (value > t.warningHigh) return 'warning';
  return 'normal';
}

export function getOverallStatus(reading: VitalReading): AlertSeverity {
  const statuses = [
    getHeartRateStatus(reading.heartRate),
    getSpo2Status(reading.spo2),
    getTemperatureStatus(reading.temperature),
    getSystolicStatus(reading.systolic),
  ];
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'normal';
}

export function generateVitalReading(
  index: number,
  scenario: 'normal' | 'warning' | 'critical' = 'normal'
): VitalReading {
  const base = {
    normal: {
      hr: 72, spo2: 98, temp: 36.8, sys: 118, dia: 76,
    },
    warning: {
      hr: 108, spo2: 93, temp: 38.2, sys: 142, dia: 90,
    },
    critical: {
      hr: 135, spo2: 88, temp: 39.8, sys: 168, dia: 102,
    },
  }[scenario];

  const jitter = (range: number) => (Math.floor(index * 17 + range * 3) % (range * 2 + 1)) - range;

  return {
    id: `reading-${index}-${scenario}`,
    timestamp: Date.now() - (20 - index) * 3000,
    heartRate: Math.max(35, Math.min(180, base.hr + jitter(8))),
    spo2: Math.max(82, Math.min(100, base.spo2 + jitter(2))),
    temperature: Math.max(34, Math.min(42, parseFloat((base.temp + jitter(3) * 0.1).toFixed(1)))),
    systolic: Math.max(80, Math.min(200, base.sys + jitter(10))),
    diastolic: Math.max(50, Math.min(130, base.dia + jitter(6))),
  };
}

export function checkAlerts(
  reading: VitalReading,
  patientId: string,
  patientName: string
): Alert[] {
  const alerts: Alert[] = [];
  const ts = reading.timestamp;

  const hrStatus = getHeartRateStatus(reading.heartRate);
  if (hrStatus !== 'normal') {
    alerts.push({
      id: `alert-hr-${reading.id}`,
      patientId,
      patientName,
      metric: 'Heart Rate',
      value: `${reading.heartRate} BPM`,
      severity: hrStatus as 'critical' | 'warning',
      message:
        reading.heartRate > THRESHOLDS.heartRate.criticalHigh
          ? `Tachycardia: Heart rate critically elevated at ${reading.heartRate} BPM`
          : reading.heartRate < THRESHOLDS.heartRate.criticalLow
          ? `Bradycardia: Heart rate critically low at ${reading.heartRate} BPM`
          : `Heart rate out of normal range: ${reading.heartRate} BPM`,
      timestamp: ts,
      acknowledged: false,
    });
  }

  const spo2Status = getSpo2Status(reading.spo2);
  if (spo2Status !== 'normal') {
    alerts.push({
      id: `alert-spo2-${reading.id}`,
      patientId,
      patientName,
      metric: 'SpO₂',
      value: `${reading.spo2}%`,
      severity: spo2Status as 'critical' | 'warning',
      message: `Oxygen saturation ${spo2Status === 'critical' ? 'critically' : ''} low: ${reading.spo2}%`,
      timestamp: ts,
      acknowledged: false,
    });
  }

  const tempStatus = getTemperatureStatus(reading.temperature);
  if (tempStatus !== 'normal') {
    alerts.push({
      id: `alert-temp-${reading.id}`,
      patientId,
      patientName,
      metric: 'Temperature',
      value: `${reading.temperature}°C`,
      severity: tempStatus as 'critical' | 'warning',
      message:
        reading.temperature > THRESHOLDS.temperature.criticalHigh
          ? `Hyperthermia: Temperature critically elevated at ${reading.temperature}°C`
          : `Temperature out of range: ${reading.temperature}°C`,
      timestamp: ts,
      acknowledged: false,
    });
  }

  const sysStatus = getSystolicStatus(reading.systolic);
  if (sysStatus !== 'normal') {
    alerts.push({
      id: `alert-bp-${reading.id}`,
      patientId,
      patientName,
      metric: 'Blood Pressure',
      value: `${reading.systolic}/${reading.diastolic} mmHg`,
      severity: sysStatus as 'critical' | 'warning',
      message: `Hypertension: BP elevated at ${reading.systolic}/${reading.diastolic} mmHg`,
      timestamp: ts,
      acknowledged: false,
    });
  }

  return alerts;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-001',
    name: 'Margaret Okonkwo',
    age: 67,
    gender: 'F',
    ward: 'Cardiology — 4B',
    condition: 'Hypertensive Heart Disease',
    connected: true,
    lastReading: generateVitalReading(19, 'warning'),
    history: Array.from({ length: 20 }, (_, i) => generateVitalReading(i, 'warning')),
  },
  {
    id: 'patient-002',
    name: 'Rajesh Venkataraman',
    age: 54,
    gender: 'M',
    ward: 'ICU — 2A',
    condition: 'Post-CABG Recovery',
    connected: true,
    lastReading: generateVitalReading(19, 'critical'),
    history: Array.from({ length: 20 }, (_, i) => generateVitalReading(i, 'critical')),
  },
  {
    id: 'patient-003',
    name: 'Amelia Hoffmann',
    age: 42,
    gender: 'F',
    ward: 'General — 6C',
    condition: 'Type 2 Diabetes Monitoring',
    connected: true,
    lastReading: generateVitalReading(19, 'normal'),
    history: Array.from({ length: 20 }, (_, i) => generateVitalReading(i, 'normal')),
  },
  {
    id: 'patient-004',
    name: 'David Osei-Mensah',
    age: 71,
    gender: 'M',
    ward: 'Pulmonology — 3D',
    condition: 'COPD Exacerbation',
    connected: true,
    lastReading: generateVitalReading(19, 'warning'),
    history: Array.from({ length: 20 }, (_, i) => generateVitalReading(i, 'warning')),
  },
  {
    id: 'patient-005',
    name: 'Priya Subramaniam',
    age: 38,
    gender: 'F',
    ward: 'Maternity — 5A',
    condition: 'Gestational Hypertension',
    connected: false,
    lastReading: generateVitalReading(14, 'normal'),
    history: Array.from({ length: 15 }, (_, i) => generateVitalReading(i, 'normal')),
  },
  {
    id: 'patient-006',
    name: 'Thomas Lindqvist',
    age: 59,
    gender: 'M',
    ward: 'Neurology — 7B',
    condition: 'Post-Stroke Monitoring',
    connected: false,
    lastReading: generateVitalReading(10, 'normal'),
    history: Array.from({ length: 10 }, (_, i) => generateVitalReading(i, 'normal')),
  },
];