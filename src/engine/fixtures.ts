// engine/fixtures.ts — 수치 fixture F01..F07 (12 §10-1)
// 기대값은 설계 문서의 제안값. 허용오차 1e-6.

import type { BatteryConfig } from '../domain/types.ts';

export interface Fixture {
  id: string;
  desc: string;
  battery: BatteryConfig;
  startKWh: number;
  genKW: number;
  loadKW: number;
  dtH?: number; // 기본 1
  expect: Record<string, number>;
}

const base: BatteryConfig = {
  eMaxKWh: 100,
  pMaxKW: 100,
  initialStoredEnergyKWh: 0,
  etaCharge: 1,
  etaDischarge: 1,
  selfDischargePerHour: 0,
};

export const FIXTURES: Fixture[] = [
  {
    id: 'F01',
    desc: '1시간 충전: 발전 10·부하 4·빈 배터리·ηc 0.8 → 충전 6, 저장 4.8',
    battery: { ...base, eMaxKWh: 10, pMaxKW: 100, etaCharge: 0.8 },
    startKWh: 0,
    genKW: 10,
    loadKW: 4,
    expect: { chargeKWh: 6, nextStoredKWh: 4.8 },
  },
  {
    id: 'F02',
    desc: '다음 1시간 방전: 저장 4.8·ηd 0.75 → 전달 3, 저장 0.8',
    battery: { ...base, eMaxKWh: 10, pMaxKW: 100, etaDischarge: 0.75 },
    startKWh: 4.8,
    genKW: 0,
    loadKW: 3,
    expect: { dischargeKWh: 3, nextStoredKWh: 0.8 },
  },
  {
    id: 'F03',
    desc: '용량 초과: Estart 9.5·Emax 10·ηc .8·net 2 → 충전 .625, 저장 10, 잉여 1.375',
    battery: { ...base, eMaxKWh: 10, pMaxKW: 100, etaCharge: 0.8 },
    startKWh: 9.5,
    genKW: 5,
    loadKW: 3,
    expect: { chargeKWh: 0.625, nextStoredKWh: 10, curtailedKWh: 1.375 },
  },
  {
    id: 'F04',
    desc: '빈 배터리 부족: Estart 0·G 2·L 5 → 방전 0, unserved 3',
    battery: { ...base, eMaxKWh: 100, pMaxKW: 100 },
    startKWh: 0,
    genKW: 2,
    loadKW: 5,
    expect: { dischargeKWh: 0, unservedKWh: 3 },
  },
  {
    id: 'F05',
    desc: '전력 한도: Estart 10·ηd 1·L 5·Pmax 2 → 전달 2, 저장 8, unserved 3',
    battery: { ...base, eMaxKWh: 100, pMaxKW: 2, etaDischarge: 1 },
    startKWh: 10,
    genKW: 0,
    loadKW: 5,
    expect: { dischargeKWh: 2, nextStoredKWh: 8, unservedKWh: 3 },
  },
  {
    id: 'F06',
    desc: '15분 충전: 발전 10·부하 4·ηc 0.8·Δt 0.25 → net 1.5, 충전 1.5, 저장 1.2',
    battery: { ...base, eMaxKWh: 10, pMaxKW: 100, etaCharge: 0.8 },
    startKWh: 0,
    genKW: 10,
    loadKW: 4,
    dtH: 0.25,
    expect: { chargeKWh: 1.5, nextStoredKWh: 1.2 },
  },
  {
    id: 'F07',
    desc: '15분 전력 한도: L 5·Pmax 2·Δt 0.25 → 한도 0.5, 전달 0.5, 저장 9.5, unserved 0.75',
    battery: { ...base, eMaxKWh: 100, pMaxKW: 2, etaDischarge: 1 },
    startKWh: 10,
    genKW: 0,
    loadKW: 5,
    dtH: 0.25,
    expect: { dischargeKWh: 0.5, nextStoredKWh: 9.5, unservedKWh: 0.75 },
  },
];
