// renderers/EnergyChart.tsx — 슬롯별 발전·부하 막대 + 충/방전·정전 기호
// 기호 병기: 충전 ■ / 방전 ● / 정전 ▲ / 잉여 ◆. 24칸·96칸 공용.

import type { DispatchRow } from '../domain/types.ts';

const W = 640;
const H = 240;
const PAD = { l: 44, r: 12, t: 16, b: 34 };

export function EnergyChart({ rows, dtH }: { rows: DispatchRow[]; dtH: number }) {
  const n = rows.length;
  const maxV = Math.max(...rows.map((r) => Math.max(r.genKWh, r.loadKWh)), 1);
  const bw = (W - PAD.l - PAD.r) / n;
  const y = (v: number) => PAD.t + (1 - v / (maxV * 1.1)) * (H - PAD.t - PAD.b);
  const showTick = (r: DispatchRow) => (n > 24 ? r.startMinute % 180 === 0 : r.slot % 3 === 0);
  const tickText = (r: DispatchRow) => (n > 24 ? `${Math.floor(r.startMinute / 60)}` : `${r.slot}`);

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <figcaption className="mb-2 text-sm font-semibold text-slate-800">
        슬롯별 수지 막대{' '}
        <span className="font-normal text-slate-500">
          ■발전(파랑) · □부하(주황 테두리) · ▲정전 · ◆잉여 · ↓방전
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`슬롯별 발전과 부하 막대 그래프, ${n}칸`} className="h-auto w-full">
        {[0, 0.5, 1].map((f) => {
          const v = maxV * 1.1 * f;
          return (
            <g key={f}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#e2e8f0" />
              <text x={PAD.l - 5} y={y(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">{v.toFixed(1)}</text>
            </g>
          );
        })}
        {rows.map((r, i) => {
          const cx = PAD.l + i * bw;
          const genH = y(0) - y(r.genKWh);
          const loadH = y(0) - y(r.loadKWh);
          const outage = r.unservedKWh > 1e-9;
          const half = Math.max(1, bw / 2 - 1);
          return (
            <g key={r.slot}>
              {outage && <rect x={cx} y={PAD.t} width={bw} height={H - PAD.t - PAD.b} fill="rgba(220,38,38,.10)" />}
              <rect x={cx + 0.5} y={y(r.genKWh)} width={half} height={genH} fill="#0284c7" rx="1">
                <title>{`${r.label} 발전 ${r.genKWh.toFixed(2)} kWh`}</title>
              </rect>
              <rect x={cx + bw / 2} y={y(r.loadKWh)} width={half} height={loadH} fill="#fff7ed" stroke="#ea580c" strokeWidth="1" rx="1">
                <title>{`${r.label} 부하 ${r.loadKWh.toFixed(2)} kWh`}</title>
              </rect>
              {r.direction === 'discharge' && (
                <text x={cx + bw / 2} y={H - 20} textAnchor="middle" fontSize="9" fill="#0369a1">↓</text>
              )}
              {r.curtailedKWh > 1e-9 && r.direction !== 'discharge' && (
                <text x={cx + bw / 2} y={H - 20} textAnchor="middle" fontSize="9" fill="#15803d">◆</text>
              )}
              {outage && (
                <text x={cx + bw / 2} y={PAD.t + 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#dc2626">▲</text>
              )}
              {showTick(r) && (
                <text x={cx + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#64748b">{tickText(r)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-xs text-slate-500">단위: kWh (kW × {dtH} h로 환산 — 15분 모드에서는 kW 수치와 다릅니다)</p>
    </figure>
  );
}
