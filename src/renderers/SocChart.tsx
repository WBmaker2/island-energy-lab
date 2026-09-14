// renderers/SocChart.tsx — SOC 곡선 + 정전 마커 (SVG, 코드 렌더링)
// 색상만으로 구분하지 않음: 정전=▲+빨강 해칭. 24칸·96칸 공용.

import type { DispatchRow } from '../domain/types.ts';

const W = 640;
const H = 220;
const PAD = { l: 40, r: 12, t: 14, b: 30 };

export function SocChart({ rows }: { rows: DispatchRow[] }) {
  const n = rows.length;
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r);
  const y = (soc: number) => PAD.t + (1 - Math.min(1, Math.max(0, soc))) * (H - PAD.t - PAD.b);
  const at = (slot: number) => rows.findIndex((r) => r.slot === slot);

  const line = rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(r.soc).toFixed(1)}`).join(' ');
  const outages = rows.filter((r) => r.unservedKWh > 1e-9);
  const peakIdx = rows.reduce((a, _b, i) => (rows[i].soc > rows[a].soc ? i : a), 0);
  const peak = rows[peakIdx];
  const ticks = n > 24 ? [0, 12, 24, 36, 48, 60, 72, 84] : [0, 6, 12, 18, 23];

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <figcaption className="mb-2 text-sm font-semibold text-slate-800">
        SOC 곡선 <span className="font-normal text-slate-500">(무차원 0~1 · 정전 칸은 ▲ 표시 · {n}칸)</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${n}칸 SOC 곡선. 정전 ${outages.length}칸.`} className="h-auto w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t === 0 ? '' : '4 4'} />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{t.toFixed(2)}</text>
          </g>
        ))}
        {ticks.map((s) => (
          <text key={s} x={x(s)} y={H - 10} textAnchor="middle" fontSize="11" fill="#64748b">{rows[s]?.label ?? ''}</text>
        ))}
        <path d={line} fill="none" stroke="#0369a1" strokeWidth="2.5" strokeLinejoin="round" />
        {n <= 24 && rows.map((r, i) => (
          <circle key={r.slot} cx={x(i)} cy={y(r.soc)} r="2.4" fill="#0369a1">
            <title>{`${r.label} SOC ${r.soc.toFixed(2)}`}</title>
          </circle>
        ))}
        {outages.map((r) => (
          <g key={`o-${r.slot}`}>
            <line x1={x(at(r.slot))} x2={x(at(r.slot))} y1={PAD.t} y2={H - PAD.b} stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
            <text x={x(at(r.slot))} y={PAD.t + 2} textAnchor="middle" fontSize="13" fill="#dc2626" fontWeight="bold">▲</text>
          </g>
        ))}
        {peak && (
          <text x={x(peakIdx)} y={y(peak.soc) - 8} textAnchor="middle" fontSize="11" fill="#0f172a">
            최대 {peak.soc.toFixed(2)} ({peak.label})
          </text>
        )}
      </svg>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-medium text-sky-800 focus-visible:ring-2">표로 보기 (스크린리더·정확한 수치용)</summary>
        <div className="thin-scroll mt-2 max-h-48">
          <table className="w-full border-collapse text-xs tabular-nums">
            <thead>
              <tr className="bg-slate-100">
                <th className="border px-2 py-1">시간</th>
                <th className="border px-2 py-1">SOC</th>
                <th className="border px-2 py-1">저장 kWh</th>
                <th className="border px-2 py-1">상태</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.slot} className={r.unservedKWh > 1e-9 ? 'pattern-outage' : ''}>
                  <td className="border px-2 py-1">{r.label}</td>
                  <td className="border px-2 py-1">{r.soc.toFixed(3)}</td>
                  <td className="border px-2 py-1">{r.storedEnergyKWh.toFixed(2)}</td>
                  <td className="border px-2 py-1">
                    {r.unservedKWh > 1e-9 ? '▲ 정전' : r.direction === 'charge' ? '■ 충전' : r.direction === 'discharge' ? '● 방전' : '― 대기'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
