// components/UpdateHistory.tsx — 작은 업데이트 내역 버튼 (00 §5)
// 학습 활동을 가리지 않는 하단 작은 버튼.

import { useState } from 'react';

const HISTORY = [
  { date: '2026-09-10', note: '설계 초안 v0.1 — 24시간 수지·SOC 경계 정의' },
  { date: '2026-09-14', note: '후속1 — 15분 간격(96칸) 모드, kW×0.25 h 표시' },
  { date: '2026-09-14', note: '후속2 — 배터리 두 안 비교, 용량·전력한도 분리 실험' },
  { date: '2026-09-15', note: '맥락 일러스트 교체 — 가상 섬 낮·밤 생성 이미지와 시간별 전환' },
];

export function UpdateHistory() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-500 hover:bg-slate-100 focus-visible:ring-2"
      >
        업데이트 내역 {open ? '▲' : '▼'}
      </button>
      {open && (
        <ul className="mx-auto mt-2 max-w-md rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-600">
          {HISTORY.map((h) => (
            <li key={`${h.date}-${h.note}`} className="py-1"><strong>{h.date}</strong> — {h.note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
