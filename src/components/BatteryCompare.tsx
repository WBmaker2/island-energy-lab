// components/BatteryCompare.tsx — 후속2: 배터리 두 안 비교 (12 §16)
// 같은 프로필·Δt에서 A(조작판 현재 설정) vs B(대안) 실행.
// 한 점수로 우열을 매기지 않고 지표별로 비교한다 (00 §1).

import { useEffect, useState } from 'react';
import { validateBattery } from '../domain/validation.ts';
import type { BatteryConfig, DispatchRow, DispatchSummary, SlotPoint, ValidationError } from '../domain/types.ts';
import { runDispatch } from '../engine/dispatch.ts';
import { Badge, Button, Card, Field, NumberInput } from './ui.tsx';

interface Props {
  points: SlotPoint[];
  dtH: number;
  batteryA: BatteryConfig;
  batteryB: BatteryConfig;
  onBatteryB: (b: BatteryConfig) => void;
}

function errFor(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

function spec(b: BatteryConfig): string {
  return `Emax ${b.eMaxKWh} kWh · Pmax ${b.pMaxKW} kW · ηc ${b.etaCharge} · ηd ${b.etaDischarge} · 초기 ${b.initialStoredEnergyKWh} kWh`;
}

function CompareChart({ a, b }: { a: DispatchRow[]; b: DispatchRow[] }) {
  const W = 640;
  const H = 200;
  const PAD = { l: 40, r: 12, t: 14, b: 26 };
  const n = a.length;
  const x = (i: number) => PAD.l + (i / Math.max(1, n - 1)) * (W - PAD.l - PAD.r);
  const y = (soc: number) => PAD.t + (1 - Math.min(1, Math.max(0, soc))) * (H - PAD.t - PAD.b);
  const line = (rows: DispatchRow[]) =>
    rows.map((r, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(r.soc).toFixed(1)}`).join(' ');
  const ticks = n > 24 ? [0, 24, 48, 72] : [0, 6, 12, 18];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="두 배터리의 SOC 곡선 겹쳐보기. A안은 실선, B안은 점선." className="h-auto w-full">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="4 4" />
          <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">{t.toFixed(1)}</text>
        </g>
      ))}
      {ticks.map((s) => (
        <text key={s} x={x(s)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">{a[s]?.label ?? ''}</text>
      ))}
      <path d={line(a)} fill="none" stroke="#0369a1" strokeWidth="2.5" />
      <path d={line(b)} fill="none" stroke="#b45309" strokeWidth="2.5" strokeDasharray="7 4" />
      <g fontSize="12" fontWeight="bold">
        <line x1={W - 190} y1={20} x2={W - 160} y2={20} stroke="#0369a1" strokeWidth="3" />
        <text x={W - 154} y={24} fill="#0f172a">A안 실선</text>
        <line x1={W - 190} y1={38} x2={W - 160} y2={38} stroke="#b45309" strokeWidth="3" strokeDasharray="6 3" />
        <text x={W - 154} y={42} fill="#0f172a">B안 점선</text>
      </g>
    </svg>
  );
}

export function BatteryCompare(p: Props) {
  const [result, setResult] = useState<{ a: DispatchSummary; b: DispatchSummary } | null>(null);
  const [runs, setRuns] = useState(0);
  useEffect(() => { setResult(null); }, [p.points, p.dtH, p.batteryA, p.batteryB.eMaxKWh, p.batteryB.pMaxKW, p.batteryB.etaCharge, p.batteryB.etaDischarge, p.batteryB.initialStoredEnergyKWh, p.batteryB.selfDischargePerHour]);

  const errs = validateBattery(p.batteryB);
  const setB = (patch: Partial<BatteryConfig>) => p.onBatteryB({ ...p.batteryB, ...patch });
  const preset = (kind: 'halfCap' | 'quarterPower' | 'lowEff') => {
    if (kind === 'halfCap') setB({ eMaxKWh: Math.max(1, Math.round(p.batteryA.eMaxKWh / 2)) });
    if (kind === 'quarterPower') setB({ pMaxKW: Math.max(0, Math.round(p.batteryA.pMaxKW / 4)) });
    if (kind === 'lowEff') setB({ etaCharge: 0.8, etaDischarge: 0.8 });
  };

  const onRun = () => {
    if (errs.length > 0) return;
    setResult({ a: runDispatch(p.points, p.batteryA, p.dtH), b: runDispatch(p.points, p.batteryB, p.dtH) });
    setRuns((n) => n + 1);
  };

  const b = p.batteryB;
  const rows: Array<{ k: string; get: (s: DispatchSummary) => string }> = [
    { k: '미공급 합계', get: (s) => `${s.totalUnservedKWh.toFixed(2)} kWh` },
    { k: '정전 칸 수', get: (s) => `${s.outageSlots.length}칸` },
    { k: '손실 합계', get: (s) => `${s.totalLossKWh.toFixed(2)} kWh` },
    { k: '잉여 합계', get: (s) => `${s.totalCurtailedKWh.toFixed(2)} kWh` },
    { k: '말기 저장량', get: (s) => `${s.endStoredKWh.toFixed(1)} kWh` },
    { k: '지속 가능', get: (s) => (s.sustainable ? '↻ 예' : '⚠ 아니오') },
  ];

  return (
    <Card
      title="과제 C+ · 배터리 두 안 비교"
      sub={`같은 하루·같은 Δt(${p.dtH} h)에서 배터리만 바꿔 실행합니다. 용량(Emax)과 전력 한도(Pmax)의 역할을 분리해서 보세요.`}
    >
      <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700">
        A안(현재 조작판 설정): {spec(p.batteryA)}
      </p>
      <fieldset className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-bold text-slate-800">B안 설정</legend>
        <Field label="용량 Emax (kWh)" htmlFor="b2-emax" error={errFor(errs, 'eMaxKWh')}>
          <NumberInput id="b2-emax" value={b.eMaxKWh} min={1} onChange={(v) => setB({ eMaxKWh: v })} error={errFor(errs, 'eMaxKWh')} />
        </Field>
        <Field label="전력 한도 Pmax (kW)" htmlFor="b2-pmax" error={errFor(errs, 'pMaxKW')}>
          <NumberInput id="b2-pmax" value={b.pMaxKW} min={0} onChange={(v) => setB({ pMaxKW: v })} error={errFor(errs, 'pMaxKW')} />
        </Field>
        <Field label="초기 저장량 (kWh)" htmlFor="b2-init" error={errFor(errs, 'initialStoredEnergyKWh')}>
          <NumberInput id="b2-init" value={b.initialStoredEnergyKWh} min={0} onChange={(v) => setB({ initialStoredEnergyKWh: v })} error={errFor(errs, 'initialStoredEnergyKWh')} />
        </Field>
        <Field label="충전 효율 ηc" htmlFor="b2-etac" error={errFor(errs, 'etaCharge')}>
          <NumberInput id="b2-etac" value={b.etaCharge} min={0.1} max={1} step="0.01" onChange={(v) => setB({ etaCharge: v })} error={errFor(errs, 'etaCharge')} />
        </Field>
        <Field label="방전 효율 ηd" htmlFor="b2-etad" error={errFor(errs, 'etaDischarge')}>
          <NumberInput id="b2-etad" value={b.etaDischarge} min={0.1} max={1} step="0.01" onChange={(v) => setB({ etaDischarge: v })} error={errFor(errs, 'etaDischarge')} />
        </Field>
        <Field label="자기방전 σ (/h)" htmlFor="b2-sigma" error={errFor(errs, 'selfDischargePerHour')}>
          <NumberInput id="b2-sigma" value={b.selfDischargePerHour} min={0} max={0.1} step="0.001" onChange={(v) => setB({ selfDischargePerHour: v })} error={errFor(errs, 'selfDischargePerHour')} />
        </Field>
      </fieldset>
      <div className="mt-2 flex flex-wrap gap-2" aria-label="B안 프리셋">
        <Button type="button" onClick={() => preset('halfCap')}>B안=용량 절반</Button>
        <Button type="button" onClick={() => preset('quarterPower')}>B안=전력한도 1/4</Button>
        <Button type="button" onClick={() => preset('lowEff')}>B안=효율 0.8</Button>
      </div>
      {errs.length > 0 && (
        <div role="alert" className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2 text-xs text-red-800">
          ⚠ B안 입력 {errs.length}개를 수정해야 실행됩니다: {errs[0].message}
        </div>
      )}
      <div className="mt-3">
        <Button type="button" onClick={onRun} disabled={errs.length > 0}>⇄ 두 안 비교 실행{runs > 0 ? ` (${runs}회)` : ''}</Button>
      </div>
      {result && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2" aria-live="polite">
            <Badge kind={result.a.totalUnservedKWh < 1e-9 ? 'ok' : 'bad'}>A안 미공급 {result.a.totalUnservedKWh.toFixed(2)} kWh</Badge>
            <Badge kind={result.b.totalUnservedKWh < 1e-9 ? 'ok' : 'bad'}>B안 미공급 {result.b.totalUnservedKWh.toFixed(2)} kWh</Badge>
          </div>
          <div className="thin-scroll">
            <table className="w-full min-w-[420px] border-collapse text-xs tabular-nums">
              <thead>
                <tr className="bg-slate-100">
                  <th scope="col" className="border border-slate-200 px-2 py-1.5 text-left">지표(낮을수록 좋음·지속 가능 제외)</th>
                  <th scope="col" className="border border-slate-200 px-2 py-1.5 text-right">A안 실선</th>
                  <th scope="col" className="border border-slate-200 px-2 py-1.5 text-right">B안 점선</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k}>
                    <th scope="row" className="border border-slate-200 px-2 py-1 text-left font-medium">{r.k}</th>
                    <td className="border border-slate-200 px-2 py-1 text-right">{r.get(result.a)}</td>
                    <td className="border border-slate-200 px-2 py-1 text-right">{r.get(result.b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figure className="rounded-xl border border-slate-200 bg-white p-3">
            <figcaption className="mb-1 text-sm font-semibold text-slate-800">SOC 겹쳐보기 <span className="font-normal text-slate-500">(A 실선 · B 점선)</span></figcaption>
            <CompareChart a={result.a.rows} b={result.b.rows} />
          </figure>
          <p className="text-xs text-slate-600" aria-live="polite">
            미공급 차이 (B−A): {(result.b.totalUnservedKWh - result.a.totalUnservedKWh).toFixed(2)} kWh ·
            정전 칸: A {result.a.outageLabels.join(', ') || '없음'} / B {result.b.outageLabels.join(', ') || '없음'}
          </p>
        </div>
      )}
    </Card>
  );
}
