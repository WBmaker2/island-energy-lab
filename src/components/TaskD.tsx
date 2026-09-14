// components/TaskD.tsx — 과제 D: 손실 설명 (12 §7D)
// 효율 손실을 발전량에서 두 번 빼지 않고 배터리 수지에만 반영.

import { useState } from 'react';
import { TASK_D_CASES } from '../scenarios/tasks.ts';
import { Badge, Button, Card } from './ui.tsx';

const OPTIONS = [
  { id: 'bat', label: '배터리 충·방전 + 자기방전 (수지에만 반영)', correct: true },
  { id: 'double', label: '발전량에서 빼고 배터리에서 또 뺀다', correct: false },
  { id: 'none', label: '손실은 없고 SOC만 보면 된다', correct: false },
] as const;

export function TaskD({ onPass }: { onPass: () => void }) {
  const [sel, setSel] = useState<string>('');
  const [msg, setMsg] = useState<string | null>(null);

  const check = () => {
    if (sel === 'bat') {
      setMsg('✓ 통과 — 손실은 E_charge−ηc·E_charge, discharge/ηd−discharge, 자기방전 3항목으로 한 번씩만 계산합니다.');
      onPass();
    } else if (!sel) {
      setMsg('손실이 발생한 위치를 하나 선택하세요.');
    } else {
      setMsg('✗ 단일 수지식 원칙 위반 — 손실을 두 번 빼면 버스가 맞지 않습니다. 손실 막대와 SOC 곡선이 함께 바뀌는지 확인하세요.');
    }
  };

  return (
    <Card title="과제 D · 손실은 어디에서 났나" sub="두 시나리오의 왕복효율을 비교하고 손실 위치를 선택하세요.">
      <div className="grid gap-2 sm:grid-cols-2">
        {TASK_D_CASES.map((c) => {
          const cl = c.chargeKWh * (1 - c.etaC);
          const dl = c.dischargeKWh / c.etaD - c.dischargeKWh;
          return (
            <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-bold">{c.title}</p>
              <p className="mt-1">충전 손실: {c.chargeKWh}×(1−{c.etaC}) = <strong>{cl.toFixed(2)} kWh</strong></p>
              <p>방전 손실: {c.dischargeKWh}/{c.etaD}−{c.dischargeKWh} = <strong>{dl.toFixed(2)} kWh</strong></p>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={`${c.title} 손실 막대 ${(cl + dl).toFixed(2)} kWh`}>
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, (cl + dl) * 12)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 space-y-2" role="radiogroup" aria-label="손실 원인 선택">
        {OPTIONS.map((o) => (
          <label key={o.id} className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${sel === o.id ? 'border-sky-700 bg-sky-50' : 'border-slate-300 bg-white'}`}>
            <input type="radio" name="loss-cause" value={o.id} checked={sel === o.id} onChange={() => setSel(o.id)} className="h-4 w-4 accent-sky-700" />
            {o.label}
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button type="button" onClick={check}>설명 확인</Button>
        {msg?.startsWith('✓') && <Badge kind="ok">✓ 통과</Badge>}
      </div>
      {msg && <p role={msg.startsWith('✓') ? 'status' : 'alert'} className="mt-2 text-sm font-medium text-slate-800">{msg}</p>}
    </Card>
  );
}
