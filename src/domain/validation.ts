// domain/validation.ts — 허용 입력 검사 (12 §10)
// 범위를 벗어나면 조용히 보정하지 않고 이유 표시 (00 §3).

import { SLOT_COUNT } from './types.ts';
import type { BatteryConfig, IntervalMin, SlotPoint, ValidationError } from './types.ts';

export function validateBattery(b: BatteryConfig): ValidationError[] {
  const errs: ValidationError[] = [];
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);
  if (!num(b.eMaxKWh) || b.eMaxKWh <= 0)
    errs.push({ field: 'eMaxKWh', message: '배터리 용량(Emax)은 0보다 커야 합니다.' });
  if (!num(b.pMaxKW) || b.pMaxKW < 0)
    errs.push({ field: 'pMaxKW', message: '충·방전 전력 한도(Pmax)는 0 이상이어야 합니다.' });
  if (!num(b.initialStoredEnergyKWh) || b.initialStoredEnergyKWh < 0)
    errs.push({ field: 'initialStoredEnergyKWh', message: '초기 저장량은 0 이상이어야 합니다.' });
  else if (num(b.eMaxKWh) && b.initialStoredEnergyKWh > b.eMaxKWh)
    errs.push({ field: 'initialStoredEnergyKWh', message: '초기 저장량은 용량(Emax)을 넘을 수 없습니다.' });
  if (!num(b.etaCharge) || b.etaCharge <= 0 || b.etaCharge > 1)
    errs.push({ field: 'etaCharge', message: '충전 효율(ηc)은 0 초과 1 이하여야 합니다.' });
  if (!num(b.etaDischarge) || b.etaDischarge <= 0 || b.etaDischarge > 1)
    errs.push({ field: 'etaDischarge', message: '방전 효율(ηd)은 0 초과 1 이하여야 합니다.' });
  if (!num(b.selfDischargePerHour) || b.selfDischargePerHour < 0 || b.selfDischargePerHour >= 1)
    errs.push({ field: 'selfDischargePerHour', message: '시간당 자기방전율(σ)은 0 이상 1 미만이어야 합니다.' });
  return errs;
}

export function validateProfiles(points: SlotPoint[], intervalMin: IntervalMin): ValidationError[] {
  const errs: ValidationError[] = [];
  const step = 60 / (SLOT_COUNT[intervalMin] / 24);
  if (points.length !== SLOT_COUNT[intervalMin])
    errs.push({ field: 'profiles', message: `${SLOT_COUNT[intervalMin]}개 슬롯이 필요합니다(Δt=${intervalMin}분).` });
  points.forEach((p, i) => {
    if (p.slot !== i) errs.push({ field: `slot-${i}`, message: `${i}번 슬롯의 slot 값이 ${p.slot}입니다.` });
    if (p.startMinute !== i * step)
      errs.push({ field: `start-${i}`, message: `${i}번 슬롯의 시작 시각이 ${p.startMinute}분입니다.` });
    for (const [k, v] of [['solarKW', p.solarKW], ['windKW', p.windKW], ['loadKW', p.loadKW]] as const) {
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0)
        errs.push({ field: `${k}-${p.slot}`, message: `${i}번 슬롯 ${k}는 0 이상의 숫자여야 합니다.` });
    }
  });
  return errs;
}

export function formatKW(v: number): string {
  return `${v.toFixed(1)} kW`;
}

export function formatKWh(v: number): string {
  return `${v.toFixed(2)} kWh`;
}
