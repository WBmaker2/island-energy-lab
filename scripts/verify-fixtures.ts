// scripts/verify-fixtures.ts — 엔진 수치 fixture F01..F07 검증
// 실행: npm run verify (Node 22.6+ 타입 스트립 사용)

import { stepHour } from '../src/engine/dispatch.ts';
import { FIXTURES } from '../src/engine/fixtures.ts';

let fail = 0;
for (const f of FIXTURES) {
  const s = stepHour({
    genKW: f.genKW,
    loadKW: f.loadKW,
    storedKWh: f.startKWh,
    battery: { ...f.battery, initialStoredEnergyKWh: f.startKWh },
    dtH: f.dtH ?? 1,
  });
  const got: Record<string, number> = {
    chargeKWh: s.chargeKWh,
    dischargeKWh: s.dischargeKWh,
    nextStoredKWh: s.nextStoredKWh,
    curtailedKWh: s.curtailedKWh,
    unservedKWh: s.unservedKWh,
  };
  for (const [k, v] of Object.entries(f.expect)) {
    const err = Math.abs((got[k] ?? NaN) - v);
    const ok = err <= 1e-6;
    console.log(`${f.id} ${k}: 기대 ${v}, 실제 ${(got[k] ?? NaN).toFixed(6)} → ${ok ? 'PASS' : 'FAIL'}`);
    if (!ok) fail++;
  }
}
if (fail > 0) {
  console.error(`fixtures FAILED: ${fail}건`);
  process.exit(1);
} else {
  console.log(`fixtures ALL PASS (${FIXTURES.map((f) => f.id).join(',')})`);
}
