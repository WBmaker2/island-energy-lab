// scenarios/profiles.ts — 합성 24시간 시계열 (12 §5·§15, 후속1 15분 간격)
// MVP 프로필은 합성 시계열이며 실제 섬 운영 권고가 아니다.
// 15분 칸은 시간 대표값을 슬롯 안에 그대로 두는(시간 내 일정) 방식으로 만든다.

import { DT_H, SLOT_COUNT } from '../domain/types.ts';
import type { BatteryConfig, IntervalMin, Scenario, SlotPoint } from '../domain/types.ts';

const SRC = 'synthetic-mvp-v0.1';
const TIME_ZONE = 'Asia/Seoul(표시용·합성)';
const ESSENTIAL_KW = 8; // 이동 불가 필수 부하

// 태양광: 낮에 높고 밤에 0. 6시~18시 종형.
function solarAt(h: number): number {
  if (h < 6 || h > 18) return 0;
  const peak = 38;
  const t = (h - 6) / 12; // 0..1
  return Math.round(peak * Math.sin(Math.PI * t) * 10) / 10;
}

// 바람: 밤에도 일부, 시간별 변동.
const WIND = [6, 7, 5.5, 8, 6.5, 5, 4, 3.5, 4.5, 5, 6, 7, 6, 5.5, 4.5, 5, 7, 8.5, 9, 8, 7.5, 7, 6.5, 6];

// 부하: 냉장·담수화·주거·학교 합계. 아침·저녁 피크, 심야 담수화.
const LOAD = [9, 8, 8, 8.5, 9, 11, 14, 16, 15, 13, 12, 12.5, 13, 12.5, 12, 13, 15, 18, 20, 19, 16, 13, 11, 10];

export function pointsFor(intervalMin: IntervalMin): SlotPoint[] {
  const perHour = SLOT_COUNT[intervalMin] / 24;
  const step = 60 / perHour;
  const pts: SlotPoint[] = [];
  for (let h = 0; h < 24; h++) {
    for (let q = 0; q < perHour; q++) {
      pts.push({
        slot: h * perHour + q,
        startMinute: h * 60 + q * step,
        solarKW: solarAt(h),
        windKW: WIND[h],
        loadKW: LOAD[h],
        sourceId: intervalMin === 60 ? SRC : `${SRC}+quarter`,
      });
    }
  }
  return pts;
}

export function defaultPoints(): SlotPoint[] {
  return pointsFor(60);
}

export const DEFAULT_BATTERY: BatteryConfig = {
  eMaxKWh: 120,
  pMaxKW: 40,
  // 초기 20 kWh: 평균 발전(≈18 kW) > 평균 부하(≈13 kW)인데도
  // 새벽 시간대(6·7시)에 정전이 나도록 — 오개념 6 교정용.
  initialStoredEnergyKWh: 20,
  etaCharge: 0.95,
  etaDischarge: 0.95,
  selfDischargePerHour: 0.001,
};

export function assumptionsFor(intervalMin: IntervalMin): string[] {
  const base = [
    `단일 버스, Δt = ${DT_H[intervalMin]} h, AC 조류 해석 제외`,
    '합성 시계열 — 실제 발전 예측이 아님',
    '한 슬롯은 충전 또는 방전 중 한 방향만 허용',
  ];
  if (intervalMin === 15) base.push('15분 칸은 시간 대표값을 그대로 둠(시간 내 일정 가정)');
  return base;
}

export function defaultScenario(intervalMin: IntervalMin = 60): Scenario {
  return {
    id: intervalMin === 60 ? 'island-mvp-01' : 'island-q15-01',
    label: intervalMin === 60 ? '가상 섬 · 기본 하루' : '가상 섬 · 15분 하루',
    intervalMin,
    timeZone: TIME_ZONE,
    points: pointsFor(intervalMin),
    battery: { ...DEFAULT_BATTERY },
    assumptions: assumptionsFor(intervalMin),
    sourceIds: [SRC],
  };
}

/** 수요 이동: 허용 시간대 내에서만, 총 kWh 보존, 필수 부하는 이동 불가.
 *  기본: 18~20시 저녁 피크에서 13~15시 낮 시간대로 kWh 이동. */
export function shiftLoad(
  points: SlotPoint[],
  amountKWh: number,
  dtH: number,
  fromHours: number[] = [18, 19, 20],
  toHours: number[] = [13, 14, 15],
): { points: SlotPoint[]; moved: number; note: string } {
  const inHours = (p: SlotPoint, hs: number[]) => hs.includes(Math.floor(p.startMinute / 60));
  const from = points.map((p, i) => i).filter((i) => inHours(points[i], fromHours));
  const to = points.map((p, i) => i).filter((i) => inHours(points[i], toHours));
  const next = points.map((p) => ({ ...p }));
  const round2 = (v: number) => Math.round(v * 100) / 100;
  let moved = 0;
  const per = from.length > 0 ? amountKWh / from.length : 0;
  for (const i of from) {
    const reducibleKWh = Math.max(0, (next[i].loadKW - ESSENTIAL_KW) * dtH);
    const take = Math.min(per, reducibleKWh);
    next[i] = { ...next[i], loadKW: round2(next[i].loadKW - take / dtH) };
    moved += take;
  }
  const add = to.length > 0 ? moved / to.length : 0;
  for (const i of to) {
    next[i] = { ...next[i], loadKW: round2(next[i].loadKW + add / dtH) };
  }
  return {
    points: next,
    moved: Math.round(moved * 100) / 100,
    note: `저녁(${fromHours.join(',')}시)→낮(${toHours.join(',')}시) ${moved.toFixed(1)} kWh 이동 · 총량 보존`,
  };
}
