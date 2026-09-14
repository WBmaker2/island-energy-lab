// components/TaskA.tsx — 과제 A: 전력과 에너지 카드 짝짓기 (12 §7A)
// kW × h = kWh 단위가 맞아야 통과.

import { useState } from 'react';
import { TASK_A_CARDS, TASK_A_PAIRS } from '../scenarios/tasks.ts';
import { Badge, Button, Card } from './ui.tsx';

export function TaskA({ onPass }: { onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);
  const score = TASK_A_PAIRS.filter((q, i) => (answers[i] ?? '').trim() === q.answer).length;

  return (
    <Card title="과제 A · 전력(kW)과 에너지(kWh) 짝짓기" sub="8개 카드를 읽고 3개 물음에 답하세요. 단위가 맞아야 통과.">
      <div className="flex flex-wrap gap-2" role="list" aria-label="단위 카드 8개">
        {TASK_A_CARDS.map((c) => (
          <span
            key={c.id}
            role="listitem"
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
              c.kind === 'kw' ? 'border-sky-300 bg-sky-50 text-sky-900' : c.kind === 'kwh' ? 'border-green-300 bg-green-50 text-green-900' : 'border-slate-300 bg-slate-100 text-slate-700'
            }`}
          >
            {c.kind === 'kw' ? '⚡ ' : c.kind === 'kwh' ? '🔋 ' : '◷ '}{c.text}
          </span>
        ))}
      </div>
      <ol className="mt-3 space-y-3">
        {TASK_A_PAIRS.map((q, i) => {
          const ok = (answers[i] ?? '').trim() === q.answer;
          return (
            <li key={i} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold">{i + 1}. {q.prompt}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <input
                  aria-label={`${q.prompt} 답`}
                  className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  placeholder="예: 60 kWh"
                  value={answers[i] ?? ''}
                  onChange={(e) => { setAnswers({ ...answers, [i]: e.target.value }); setDone(false); }}
                />
                {done && (ok ? <Badge kind="ok">✓ 정답</Badge> : <Badge kind="bad">✗ 다시 — {q.explain}</Badge>)}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          variant={score === 3 ? 'primary' : 'secondary'}
          pulse={false}
          onClick={() => { setDone(true); if (score === 3) onPass(); }}
        >
          확인하기 ({score}/3)
        </Button>
        {done && score === 3 && <Badge kind="ok">✓ 통과 — “얼마 동안인지”를 곱했습니다</Badge>}
      </div>
    </Card>
  );
}
