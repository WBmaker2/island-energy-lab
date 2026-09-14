// components/ControlPanel.tsx — 간격·배터리 설정 + 수요 이동 (12 §10 검증)

import type { BatteryConfig, IntervalMin, ValidationError } from '../domain/types.ts';
import { Badge, Button, Field, NumberInput } from './ui.tsx';

interface Props {
  battery: BatteryConfig;
  onBattery: (b: BatteryConfig) => void;
  errors: ValidationError[];
  intervalMin: IntervalMin;
  onInterval: (m: IntervalMin) => void;
  dtH: number;
  loadShiftKWh: number;
  onShiftChange: (v: number) => void;
  onApplyShift: () => void;
  shiftNote: string;
  onRun: () => void;
  canRun: boolean;
}

function errFor(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

export function ControlPanel(p: Props) {
  const b = p.battery;
  const set = (patch: Partial<BatteryConfig>) => p.onBattery({ ...b, ...patch });

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-800">시간 간격 <span className="font-normal text-slate-500">(Δt)</span></legend>
        <div className="flex gap-2" role="radiogroup" aria-label="시간 간격 선택">
          {([60, 15] as IntervalMin[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={p.intervalMin === m}
              onClick={() => p.onInterval(m)}
              className={`min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-all duration-150 focus-visible:ring-2 active:scale-[0.98] motion-reduce:transition-none ${p.intervalMin === m ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              {m === 60 ? '1시간 × 24칸' : '15분 × 96칸'}
            </button>
          ))}
        </div>
        <p className="mt-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs text-sky-900" aria-live="polite">
          예: 발전 10 kW × {p.dtH} h = {(10 * p.dtH).toFixed(2)} kWh — 15분 모드에서는 kW와 kWh 수치가 다릅니다
        </p>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-2 text-sm font-bold text-slate-800">배터리 설정 <span className="font-normal text-slate-500">(제안값에서 시작)</span></legend>
        <Field label="용량 Emax (kWh)" htmlFor="b-emax" hint="저장량은 kWh — kW 값을 넣으려면 '몇 시간 동안인지'를 곱하세요" error={errFor(p.errors, 'eMaxKWh')}>
          <NumberInput id="b-emax" value={b.eMaxKWh} min={1} onChange={(v) => set({ eMaxKWh: v })} error={errFor(p.errors, 'eMaxKWh')} />
        </Field>
        <Field label="전력 한도 Pmax (kW)" htmlFor="b-pmax" hint={`슬롯당 에너지 한도 = Pmax×${p.dtH}h`} error={errFor(p.errors, 'pMaxKW')}>
          <NumberInput id="b-pmax" value={b.pMaxKW} min={0} onChange={(v) => set({ pMaxKW: v })} error={errFor(p.errors, 'pMaxKW')} />
        </Field>
        <Field label="초기 저장량 (kWh)" htmlFor="b-init" hint="0 ~ Emax" error={errFor(p.errors, 'initialStoredEnergyKWh')}>
          <NumberInput id="b-init" value={b.initialStoredEnergyKWh} min={0} onChange={(v) => set({ initialStoredEnergyKWh: v })} error={errFor(p.errors, 'initialStoredEnergyKWh')} />
        </Field>
        <Field label="충전 효율 ηc" htmlFor="b-etac" hint="0 초과 ~ 1" error={errFor(p.errors, 'etaCharge')}>
          <NumberInput id="b-etac" value={b.etaCharge} min={0.1} max={1} step="0.01" onChange={(v) => set({ etaCharge: v })} error={errFor(p.errors, 'etaCharge')} />
        </Field>
        <Field label="방전 효율 ηd" htmlFor="b-etad" error={errFor(p.errors, 'etaDischarge')}>
          <NumberInput id="b-etad" value={b.etaDischarge} min={0.1} max={1} step="0.01" onChange={(v) => set({ etaDischarge: v })} error={errFor(p.errors, 'etaDischarge')} />
        </Field>
        <Field label="자기방전 σ (/h)" htmlFor="b-sigma" hint="기본 0.001" error={errFor(p.errors, 'selfDischargePerHour')}>
          <NumberInput id="b-sigma" value={b.selfDischargePerHour} min={0} max={0.1} step="0.001" onChange={(v) => set({ selfDischargePerHour: v })} error={errFor(p.errors, 'selfDischargePerHour')} />
        </Field>
      </fieldset>

      {p.errors.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-bold">⚠ 실행할 수 없습니다 ({p.errors.length}개)</p>
          <ul className="mt-1 list-disc pl-5">
            {p.errors.slice(0, 6).map((e) => <li key={e.field}>{e.message}</li>)}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-bold text-slate-800">수요 이동 <Badge kind="info">총량 보존</Badge></h3>
        <p className="mt-1 text-xs text-slate-600">저녁 피크(18·19·20시) → 낮(13·14·15시). 필수 부하 8 kW는 남긴다.</p>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="shift" className="text-sm font-medium">이동량</label>
          <input
            id="shift"
            type="range"
            min={0}
            max={12}
            step={1}
            value={p.loadShiftKWh}
            onChange={(e) => p.onShiftChange(Number(e.target.value))}
            className="w-full accent-sky-700"
            aria-valuetext={`${p.loadShiftKWh} kWh`}
          />
          <span className="w-16 shrink-0 text-right text-sm font-bold" aria-live="polite">{p.loadShiftKWh} kWh</span>
        </div>
        <div className="mt-2 flex gap-2">
          <Button type="button" onClick={p.onApplyShift}>수요 이동 적용</Button>
        </div>
        {p.shiftNote && <p className="mt-2 text-xs text-slate-600" aria-live="polite">↔ {p.shiftNote}</p>}
      </div>

      <Button type="button" variant="primary" pulse={p.canRun} onClick={p.onRun} disabled={!p.canRun} className="w-full" aria-describedby="run-hint">
        {p.canRun ? '▶ 슬롯 수지 실행 (다음 필수 행동)' : '⚠ 입력을 수정해야 실행됩니다'}
      </Button>
      <p id="run-hint" className="text-center text-xs text-slate-500">kW×{p.dtH} h = kWh · 한 슬롯은 충전·방전 중 하나만</p>
    </div>
  );
}
