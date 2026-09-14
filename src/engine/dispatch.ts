// engine/dispatch.ts — 슬롯 수지 엔진 (12 §8·§9, 후속1 Δt 일반화)
// 렌더링과 독립: React/Three.js 없이 검증 가능 (00 §6).

import { DELTA_T_H, slotLabel } from '../domain/types.ts';
import type { BatteryConfig, DispatchRow, DispatchSummary, SlotPoint } from '../domain/types.ts';

export interface StepInput {
  genKW: number;
  loadKW: number;
  storedKWh: number;
  battery: BatteryConfig;
  dtH?: number;
}

export interface StepOutput {
  netKWh: number;
  chargeKWh: number;
  dischargeKWh: number;
  nextStoredKWh: number;
  curtailedKWh: number;
  unservedKWh: number;
  chargeLossKWh: number;
  dischargeLossKWh: number;
  selfLossKWh: number;
  direction: DispatchRow['direction'];
}

/** 단일 슬롯 수지 — 과제 B와 전체 실행이 같은 함수를 공유한다. */
export function stepHour(input: StepInput): StepOutput {
  const dt = input.dtH ?? DELTA_T_H;
  const { battery } = input;
  const eGen = input.genKW * dt;
  const eLoad = input.loadKW * dt;
  const net = eGen - eLoad;

  const eAfterSelf = input.storedKWh * Math.pow(1 - battery.selfDischargePerHour, dt);
  const selfLoss = input.storedKWh - eAfterSelf;

  if (net >= 0) {
    const room = (battery.eMaxKWh - eAfterSelf) / battery.etaCharge;
    const charge = Math.max(0, Math.min(net, battery.pMaxKW * dt, room));
    // 부동소수점 음수 방지
    const safeCharge = Number.isFinite(charge) ? charge : 0;
    const next = Math.min(battery.eMaxKWh, eAfterSelf + battery.etaCharge * safeCharge);
    const chargeLoss = safeCharge - battery.etaCharge * safeCharge;
    return {
      netKWh: net,
      chargeKWh: safeCharge,
      dischargeKWh: 0,
      nextStoredKWh: next,
      curtailedKWh: net - safeCharge,
      unservedKWh: 0,
      chargeLossKWh: chargeLoss,
      dischargeLossKWh: 0,
      selfLossKWh: selfLoss,
      direction: safeCharge > 1e-9 ? 'charge' : 'idle',
    };
  }
  const request = -net;
  const deliverable = Math.min(request, battery.pMaxKW * dt, eAfterSelf * battery.etaDischarge);
  const safeDis = Number.isFinite(deliverable) ? Math.max(0, deliverable) : 0;
  const taken = battery.etaDischarge > 0 ? safeDis / battery.etaDischarge : 0;
  const next = Math.max(0, eAfterSelf - taken);
  return {
    netKWh: net,
    chargeKWh: 0,
    dischargeKWh: safeDis,
    nextStoredKWh: next,
    curtailedKWh: 0,
    unservedKWh: request - safeDis,
    chargeLossKWh: 0,
    dischargeLossKWh: taken - safeDis,
    selfLossKWh: selfLoss,
    direction: safeDis > 1e-9 ? 'discharge' : 'idle',
  };
}

export function runDispatch(
  points: SlotPoint[],
  battery: BatteryConfig,
  dtH: number = DELTA_T_H,
): DispatchSummary {
  let stored = battery.initialStoredEnergyKWh;
  const rows: DispatchRow[] = [];
  let totalGen = 0;
  let totalLoad = 0;
  let totalUnserved = 0;
  let totalCurtailed = 0;
  let totalLoss = 0;
  let busCheckMaxErr = 0;
  let totalCheckErr = 0;
  const outageSlots: number[] = [];
  const outageLabels: string[] = [];

  points.forEach((p) => {
    const genKW = p.solarKW + p.windKW;
    const start = stored;
    const s = stepHour({ genKW, loadKW: p.loadKW, storedKWh: start, battery, dtH });
    stored = s.nextStoredKWh;
    const genKWh = genKW * dtH;
    const loadKWh = p.loadKW * dtH;
    const loss = s.chargeLossKWh + s.dischargeLossKWh + s.selfLossKWh;

    // 버스 수지 검사: E_gen + discharge = (E_load - unserved) + E_charge + curtailed
    const busL = genKWh + s.dischargeKWh;
    const busR = loadKWh - s.unservedKWh + s.chargeKWh + s.curtailedKWh;
    busCheckMaxErr = Math.max(busCheckMaxErr, Math.abs(busL - busR));

    // 전체 수지 검사
    const totL = genKWh + start;
    const totR = loadKWh - s.unservedKWh + stored + s.curtailedKWh + loss;
    totalCheckErr = Math.max(totalCheckErr, Math.abs(totL - totR));

    totalGen += genKWh;
    totalLoad += loadKWh;
    totalUnserved += s.unservedKWh;
    totalCurtailed += s.curtailedKWh;
    totalLoss += loss;
    if (s.unservedKWh > 1e-9) {
      outageSlots.push(p.slot);
      outageLabels.push(slotLabel(p.startMinute));
    }

    rows.push({
      slot: p.slot,
      startMinute: p.startMinute,
      label: slotLabel(p.startMinute),
      genKWh,
      loadKWh,
      netKWh: s.netKWh,
      chargeKWh: s.chargeKWh,
      dischargeKWh: s.dischargeKWh,
      storedEnergyKWh: stored,
      soc: battery.eMaxKWh > 0 ? stored / battery.eMaxKWh : 0,
      curtailedKWh: s.curtailedKWh,
      unservedKWh: s.unservedKWh,
      lossKWh: loss,
      chargeLossKWh: s.chargeLossKWh,
      dischargeLossKWh: s.dischargeLossKWh,
      selfLossKWh: s.selfLossKWh,
      direction: s.direction,
    });
  });

  return {
    rows,
    totalGenKWh: totalGen,
    totalLoadKWh: totalLoad,
    totalUnservedKWh: totalUnserved,
    outageSlots,
    outageLabels,
    totalCurtailedKWh: totalCurtailed,
    totalLossKWh: totalLoss,
    endStoredKWh: stored,
    sustainable: stored + 1e-9 >= battery.initialStoredEnergyKWh,
    busCheckMaxErr,
    totalCheckErr,
  };
}
