// domain/types.ts — 상태·단위·엔티티·허용 입력 (00 §6 domain 경계)
// AC 조류 해석 제외. 단일 버스, Δt = 1 h 또는 0.25 h (12 §8·후속1).

export const DELTA_T_H = 1 as const;

export type IntervalMin = 60 | 15;
export const DT_H: Record<IntervalMin, number> = { 60: 1, 15: 0.25 };
export const SLOT_COUNT: Record<IntervalMin, number> = { 60: 24, 15: 96 };

/** 슬롯 시계열. kW는 슬롯 시작 시점의 출력이며 슬롯 안에서는 일정하다고 가정한다. */
export interface SlotPoint {
  slot: number; // 0..23 또는 0..95
  startMinute: number; // 0, 60, … 또는 0, 15, 30, …
  solarKW: number;
  windKW: number;
  loadKW: number;
  sourceId: string;
}

export function slotLabel(startMinute: number): string {
  const h = Math.floor(startMinute / 60);
  const m = startMinute % 60;
  return m === 0 ? `${h}시` : `${h}:${String(m).padStart(2, '0')}`;
}

export interface BatteryConfig {
  eMaxKWh: number; // Emax > 0
  pMaxKW: number; // Pmax >= 0
  initialStoredEnergyKWh: number; // 0..Emax
  etaCharge: number; // 0 < ηc ≤ 1
  etaDischarge: number; // 0 < ηd ≤ 1
  selfDischargePerHour: number; // 0 ≤ σ < 1
}

export interface DispatchRow {
  slot: number;
  startMinute: number;
  label: string; // "6시" 또는 "6:15"
  genKWh: number;
  loadKWh: number;
  netKWh: number;
  chargeKWh: number; // 버스에서 배터리로 들어간 kWh
  dischargeKWh: number; // 부하에 전달된 kWh
  storedEnergyKWh: number; // 슬롯 종료 시점 저장량
  soc: number; // 0..1 무차원
  curtailedKWh: number; // 버려진 에너지
  unservedKWh: number; // 미공급 에너지
  lossKWh: number; // chargeLoss + dischargeLoss + selfLoss
  chargeLossKWh: number;
  dischargeLossKWh: number;
  selfLossKWh: number;
  direction: 'charge' | 'discharge' | 'idle';
}

export interface DispatchSummary {
  rows: DispatchRow[];
  totalGenKWh: number;
  totalLoadKWh: number;
  totalUnservedKWh: number;
  outageSlots: number[];
  outageLabels: string[];
  totalCurtailedKWh: number;
  totalLossKWh: number;
  endStoredKWh: number;
  sustainable: boolean; // 말기 ≥ 초기 (반복 운영 조건)
  busCheckMaxErr: number;
  totalCheckErr: number;
}

export interface Scenario {
  id: string;
  label: string;
  intervalMin: IntervalMin;
  timeZone: string; // 표시용 기준 (합성 시계열은 실제 관측이 아님)
  points: SlotPoint[];
  battery: BatteryConfig;
  assumptions: string[];
  sourceIds: string[];
}

export type ValidationError = { field: string; message: string };
