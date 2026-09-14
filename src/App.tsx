// App.tsx — 정전 없는 섬 (12 §6 한 차시 흐름 · 후속1 15분 간격)
// 데스크톱: 탐구+조작 나란히 / 좁은 화면: 세로 재배치 (00 §5)

import { useMemo, useState } from 'react';
import { validateBattery, validateProfiles } from './domain/validation.ts';
import { DT_H, slotLabel } from './domain/types.ts';
import type { BatteryConfig, DispatchSummary, IntervalMin, SlotPoint, ValidationError } from './domain/types.ts';
import { runDispatch } from './engine/dispatch.ts';
import { DEFAULT_BATTERY, assumptionsFor, defaultScenario, pointsFor, shiftLoad } from './scenarios/profiles.ts';
import { LESSON_FLOW } from './scenarios/tasks.ts';
import { SocChart } from './renderers/SocChart.tsx';
import { EnergyChart } from './renderers/EnergyChart.tsx';
import { IslandSchematic, type IslandStatus } from './renderers/IslandSchematic.tsx';
import { ControlPanel } from './components/ControlPanel.tsx';
import { TaskA } from './components/TaskA.tsx';
import { TaskB } from './components/TaskB.tsx';
import { TaskD } from './components/TaskD.tsx';
import { ResultsTable } from './components/ResultsTable.tsx';
import { BatteryCompare } from './components/BatteryCompare.tsx';
import { UpdateHistory } from './components/UpdateHistory.tsx';
import { Badge, Card } from './components/ui.tsx';

const base = defaultScenario(60);

function statusAt(rows: DispatchSummary['rows'], slot: number): IslandStatus {
  const r = rows.find((x) => x.slot === slot);
  if (!r) return 'idle';
  if (r.unservedKWh > 1e-9) return 'outage';
  if (r.direction === 'charge') return r.curtailedKWh > 1e-9 ? 'surplus' : 'charge';
  if (r.direction === 'discharge') return 'discharge';
  return 'idle';
}

export default function App() {
  const [intervalMin, setIntervalMin] = useState<IntervalMin>(60);
  const [points, setPoints] = useState<SlotPoint[]>(base.points);
  const [battery, setBattery] = useState<BatteryConfig>({ ...base.battery });
  const [batteryB, setBatteryB] = useState<BatteryConfig>({ ...DEFAULT_BATTERY, eMaxKWh: 60 });
  const [shift, setShift] = useState(4);
  const [shiftNote, setShiftNote] = useState('');
  const [result, setResult] = useState<DispatchSummary | null>(null);
  const [slot, setSlot] = useState(12);
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [runs, setRuns] = useState(0);

  const dtH = DT_H[intervalMin];
  const errors: ValidationError[] = useMemo(
    () => [...validateBattery(battery), ...validateProfiles(points, intervalMin)],
    [battery, points, intervalMin],
  );
  const canRun = errors.length === 0;
  const pass = (id: string) => setPassed((s) => new Set(s).add(id));

  const onRun = () => {
    if (!canRun) return;
    setResult(runDispatch(points, battery, dtH));
    setRuns((n) => n + 1);
  };

  const changeInterval = (m: IntervalMin) => {
    setIntervalMin(m);
    setPoints(pointsFor(m));
    setResult(null);
    setShiftNote('');
    setSlot(m === 60 ? 12 : 48);
  };

  const onApplyShift = () => {
    const r = shiftLoad(points, shift, dtH);
    setPoints(r.points);
    setShiftNote(`${r.note} · 실제 적용 ${r.moved.toFixed(1)} kWh`);
    setResult(null);
  };

  const ok = result && result.totalUnservedKWh < 1e-9;
  const viewList = result ? result.rows : points;
  const viewMinute = viewList[Math.min(slot, viewList.length - 1)]?.startMinute ?? 0;

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold">
        본문으로 건너뛰기
      </a>
      <header className="border-b border-slate-200 bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Island Energy Lab · 가상 섬 합성 시계열</p>
          <h1 className="mt-1 text-balance text-2xl font-black tracking-tight text-slate-900 md:text-3xl">정전 없는 섬</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            kW(전력)와 kWh(에너지)를 구분하고, 남는 에너지를 배터리에 담았다가 부족할 때 꺼내 쓰며 24시간 정전 0을 목표로 실험합니다.
            중·고등 심화, 50분 모둠 운영 권장. <strong>실제 섬 운영 권고가 아닙니다.</strong>
          </p>
          <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="한 차시 흐름 7단계">
            {LESSON_FLOW.map((s) => (
              <li key={s.step} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700" title={s.desc}>
                <strong>{s.step}</strong> {s.title}
              </li>
            ))}
          </ol>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <TaskA onPass={() => pass('A')} />
          <TaskB onPass={() => pass('B')} />
        </div>

        <Card
          title={`과제 C · 24시간 정전 없는 섬 ${result ? (ok ? '— ✓ 성공' : `— ▲ 정전 ${result.outageSlots.length}칸`) : '— 아직 실행 전'}`}
          sub={`발전·배터리·수요를 바꾸고 실행하세요. 평균이 아닌 매 칸의 근거로 판단합니다 (Δt ${dtH} h · ${points.length}칸).`}
        >
          <div className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
            <ControlPanel
              battery={battery}
              onBattery={(b) => { setBattery(b); setResult(null); }}
              errors={errors}
              intervalMin={intervalMin}
              onInterval={changeInterval}
              dtH={dtH}
              loadShiftKWh={shift}
              onShiftChange={setShift}
              onApplyShift={onApplyShift}
              shiftNote={shiftNote}
              onRun={onRun}
              canRun={canRun}
            />
            <div className="min-w-0 space-y-3">
              {result ? (
                <>
                  <div className="flex flex-wrap gap-2" aria-live="polite">
                    {ok ? <Badge kind="ok">✓ 미공급 0 kWh — 24시간 성공</Badge> : <Badge kind="bad">▲ 정전 {result.outageLabels.join(', ')}</Badge>}
                    <Badge kind="info">손실 합계 {result.totalLossKWh.toFixed(1)} kWh</Badge>
                    <Badge kind="info">잉여 {result.totalCurtailedKWh.toFixed(1)} kWh</Badge>
                    <Badge kind={result.sustainable ? 'ok' : 'warn'}>{result.sustainable ? '↻ 말기≥초기 · 지속 가능' : '⚠ 말기<초기 · 내일은 부족'}</Badge>
                    {passed.has('A') && passed.has('B') ? <Badge kind="ok">성취 A·B ✓</Badge> : <Badge kind="warn">성취 A·B {passed.size}/2</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <label htmlFor="hour" className="font-semibold">살펴볼 시간</label>
                    <input id="hour" type="range" min={0} max={points.length - 1} step={1} value={Math.min(slot, points.length - 1)} onChange={(e) => setSlot(Number(e.target.value))} className="w-48 accent-sky-700" aria-valuetext={slotLabel(viewMinute)} />
                    <span className="font-bold" aria-live="polite">{slotLabel(viewMinute)}</span>
                    <span className="text-xs text-slate-500">실행 {runs}회 · 버스 오차 {result.busCheckMaxErr.toExponential(1)}</span>
                  </div>
                  <IslandSchematic status={statusAt(result.rows, slot)} hour={viewMinute / 60} />
                  <EnergyChart rows={result.rows} dtH={dtH} />
                  <SocChart rows={result.rows} />
                  <ResultsTable rows={result.rows} dtH={dtH} />
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  <p className="font-bold text-slate-800">아직 실행 결과가 없습니다</p>
                  <p className="mt-1">왼쪽에서 간격·배터리 값을 확인하고 <strong>“슬롯 수지 실행”</strong>을 누르세요. 예측 → 첫 실행 → 다른 결과 → 수정의 순서로 진행합니다.</p>
                  <IslandSchematic status="idle" hour={viewMinute / 60} />
                </div>
              )}
            </div>
          </div>
        </Card>

        <BatteryCompare points={points} dtH={dtH} batteryA={battery} batteryB={batteryB} onBatteryB={setBatteryB} />

        <TaskD onPass={() => pass('D')} />

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-slate-800 focus-visible:ring-2">교사용 한 차시 안내 · 예시 질문 · 성취 증거</summary>
          <div className="mt-2 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
            <div><h3 className="font-bold">흐름 (50분)</h3><p className="mt-1 text-xs leading-relaxed">도입 5분(단위 예측) → 표 읽기 10분 → 배터리 설정 10분 → 실행·수정 15분 → 한계 설명 10분.</p></div>
            <div><h3 className="font-bold">예시 질문</h3><ul className="mt-1 list-disc pl-4 text-xs leading-relaxed"><li>평균 발전이 평균 부하보다 큰데 왜 정전이 났을까?</li><li>효율을 1로 두면 어떤 구간이 달라지나?</li><li>수요 이동 전후 총 kWh는 어떻게 되었나?</li><li>용량을 키우는 것과 전력 한도를 키우는 것은 언제 효과가 다른가?</li><li>15분 모드에서 kW와 kWh 수치가 다른 칸을 찾아보자.</li></ul></div>
            <div><h3 className="font-bold">성취 증거</h3><p className="mt-1 text-xs leading-relaxed">단위 과제 4개 중 3개, 24시간 실행 1회, 손실·잔여분 설명 1개. 평균값만으로 성공 판정하지 않은 기록.</p></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">가정: {assumptionsFor(intervalMin).join(' · ')} · 자료: 합성 시계열(synthetic-mvp-v0.1). 단위 참고: <a className="underline" href="https://www.energy.gov/sites/prod/files/wv_appendix_final.pdf">DOE 용어 자료</a>, <a className="underline" href="https://www1.eere.energy.gov/education/pdfs/basics_intermediateenergyinfobook.pdf">DOE Infobook</a> (2026-09-10 열람).</p>
        </details>

        <UpdateHistory />
      </main>
    </div>
  );
}
