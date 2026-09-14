// renderers/IslandSchematic.tsx — 생성 이미지 기반 섬 맥락 일러스트

export type IslandStatus = 'charge' | 'discharge' | 'outage' | 'surplus' | 'idle';

const STATUS_META: Record<IslandStatus, { label: string; symbol: string; desc: string }> = {
  charge: { label: '충전 중', symbol: '■', desc: '남는 에너지가 배터리로 들어갑니다' },
  discharge: { label: '방전 중', symbol: '●', desc: '배터리가 부족분을 메웁니다' },
  outage: { label: '정전', symbol: '▲', desc: '배터리로도 메울 수 없는 부족 시간' },
  surplus: { label: '잉여', symbol: '◆', desc: '배터리에 다 못 담아 버려지는 에너지' },
  idle: { label: '균형', symbol: '―', desc: '발전과 부하가 맞거나 대기 상태' },
};

export function IslandSchematic({ status, hour }: { status: IslandStatus; hour: number }) {
  const meta = STATUS_META[status];
  const night = hour < 6 || hour >= 19;
  const hh = Math.floor(hour);
  const mm = Math.round((hour - hh) * 60);
  const timeLabel = mm === 0 ? `${hh}시` : `${hh}:${String(mm).padStart(2, '0')}`;
  const base = import.meta.env.BASE_URL;
  const image = `${base}assets/island-${night ? 'night' : 'day'}-v2.webp`;

  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <figcaption className="mb-1 text-sm font-semibold text-slate-800">
        가상 섬 배치도 <span className="font-normal text-slate-500">(교육용 생성 일러스트 · 실제 설비도 아님 · {night ? '밤' : '낮'} {timeLabel})</span>
      </figcaption>
      <div className="relative overflow-hidden rounded-lg bg-sky-50">
        <img src={image} alt="태양광·풍력·배터리·학교·담수화 시설이 배치된 가상 섬" className="block h-auto w-full" width={1672} height={941} loading="lazy" decoding="async" />
        <div className="absolute left-3 top-3 rounded-full border border-slate-900/20 bg-white/95 px-3 py-1.5 text-sm font-bold text-slate-900 shadow-sm" aria-label={`현재 상태: ${meta.label}`}>
          {meta.symbol} {meta.label}
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">왼쪽 풍력 · 가운데 태양광 학교 · 오른쪽 위 배터리 · 오른쪽 아래 담수화</p>
      <p className="text-[11px] leading-relaxed text-slate-400">조명은 분위기 표현이며 정전 판정과 무관합니다.</p>
      <p className="mt-1 text-xs text-slate-600">{meta.symbol} {meta.label} — {meta.desc}. 수치·판정은 아래 표와 그래프에서 확인.</p>
    </figure>
  );
}
