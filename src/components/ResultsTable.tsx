// components/ResultsTable.tsx — 슬롯별 수지표 (12 §10 출력)
// 평균만으로 판단하지 않도록 매 슬롯 unserved를 행별로 표시.

import type { DispatchRow } from '../domain/types.ts';

export function ResultsTable({ rows, dtH }: { rows: DispatchRow[]; dtH: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-bold text-slate-800">
        슬롯별 수지표 <span className="font-normal text-slate-500">(kWh · SOC 무차원 · Δt {dtH} h · {rows.length}칸)</span>
      </h2>
      <div className="thin-scroll mt-2 max-h-96">
        <table className="w-full min-w-[640px] border-collapse text-xs tabular-nums">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              {['시간', '발전', '부하', '충전■', '방전●', 'SOC', '저장', '잉여◆', '미공급▲', '손실'].map((h) => (
                <th key={h} scope="col" className="border border-slate-200 px-2 py-1.5 text-right font-bold first:text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const outage = r.unservedKWh > 1e-9;
              return (
                <tr key={r.slot} className={outage ? 'pattern-outage bg-red-50' : r.direction === 'charge' ? 'bg-green-50/40' : ''}>
                  <th scope="row" className="border border-slate-200 px-2 py-1 text-center">{r.label}</th>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.genKWh.toFixed(2)}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.loadKWh.toFixed(2)}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.chargeKWh > 1e-9 ? r.chargeKWh.toFixed(2) : '—'}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.dischargeKWh > 1e-9 ? r.dischargeKWh.toFixed(2) : '—'}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-semibold">{r.soc.toFixed(2)}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.storedEnergyKWh.toFixed(2)}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.curtailedKWh > 1e-9 ? r.curtailedKWh.toFixed(2) : '—'}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right font-bold text-red-800">{outage ? `▲ ${r.unservedKWh.toFixed(2)}` : '0'}</td>
                  <td className="border border-slate-200 px-2 py-1 text-right">{r.lossKWh.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-slate-500">버스 검사식: 발전+방전 = (부하−미공급)+충전+잉여 · 한 행도 충전·방전 동시 발생 없음</p>
    </div>
  );
}
