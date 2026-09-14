// components/TaskB.tsx — 과제 B: 한 시간 수지 예측 (12 §7B)
// 방향 + 단일 효율식, 오차 0.1 kWh 이내. 충전·방전 동시 선택 금지.

import { useState } from 'react';
import { stepHour } from '../engine/dispatch.ts';
import { TASK_B_QUIZ } from '../scenarios/tasks.ts';
import { DEFAULT_BATTERY } from '../scenarios/profiles.ts';
import { Badge, Button, Card } from './ui.tsx';

export function TaskB({ onPass }: { onPass: () => void }) {
  const q = TASK_B_QUIZ;
  const [dir, setDir] = useState<'charge' | 'discharge' | 'shortage' | ''>('');
  const [socGuess, setSocGuess] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const check = () => {
    if (!dir) { setResult('충전·방전·부족 중 하나를 먼저 선택하세요.'); setOk(false); return; }
    const truth = stepHour({
      genKW: q.genKW, loadKW: q.loadKW, storedKWh: q.storedKWh,
      battery: { ...DEFAULT_BATTERY, eMaxKWh: q.eMaxKWh, pMaxKW: q.pMaxKW, etaCharge: q.etaC, etaDischarge: q.etaD },
    });
    const truthDir = truth.netKWh >= 0 ? 'charge' : truth.unservedKWh > 1e-9 && truth.dischargeKWh < 1e-9 ? 'shortage' : 'discharge';
    // 이 문제: net=+6 → charge가 정답 방향
    const dirOk = dir === truthDir || (dir === 'charge' && truth.netKWh >= 0);
    const guess = Number(socGuess);
    const truthSoc = truth.nextStoredKWh / q.eMaxKWh;
    const socOk = Number.isFinite(guess) && Math.abs(truth.nextStoredKWh - guess * q.eMaxKWh) <= 0.1 + 1e-9;
    if (dirOk && socOk) {
      setResult(`✓ 통과 — 충전 6.00 kWh → 저장 ${(truth.nextStoredKWh).toFixed(1)} kWh (SOC ${truthSoc.toFixed(2)}). 손실 ${(6 - truth.nextStoredKWh).toFixed(1)} kWh.`);
      setOk(true);
      onPass();
    } else {
      const hints = [];
      if (!dirOk) hints.push('방향이 다릅니다. 발전 10 kW − 부하 4 kW = +6 kWh 남습니다.');
      if (!socOk) hints.push(`예상 SOC가 0.1 kWh 오차를 넘었습니다. 힌트: 충전은 ηc를 한 번만 곱합니다 (6×0.8=4.8).`);
      setResult(`✗ ${hints.join(' ')}`);
      setOk(false);
    }
  };

  return (
    <Card title="과제 B · 한 시간 수지 예측" sub={`발전 ${q.genKW} kW · 부하 ${q.loadKW} kW · 빈 배터리 · 용량 ${q.eMaxKWh} kWh · ηc ${q.etaC}`}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="충전·방전·부족 중 예측">
        {([['charge', '■ 충전'], ['discharge', '● 방전'], ['shortage', '▲ 부족']] as const).map(([v, label]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={dir === v}
            onClick={() => setDir(v)}
            className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 active:scale-[0.98] motion-reduce:transition-none ${dir === v ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="b-soc" className="text-sm font-medium">예상 SOC (0~1)</label>
        <input id="b-soc" inputMode="decimal" className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" placeholder="예: 0.48" value={socGuess} onChange={(e) => setSocGuess(e.target.value)} />
        <Button type="button" onClick={check}>예측 확인</Button>
        {ok && <Badge kind="ok">✓ 통과</Badge>}
      </div>
      {result && <p role={ok ? 'status' : 'alert'} className={`mt-2 text-sm font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>{result}</p>}
      <p className="mt-2 text-xs text-slate-500">판정: 방향 일치 + 단일 효율식 결과와 0.1 kWh 이내. 충전·방전 동시 선택은 허용하지 않음.</p>
    </Card>
  );
}
