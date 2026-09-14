// renderers/IslandSchematic.tsx — 섬 맥락 SVG (수치 없음, 분위기·위치만)
// 숫자·축·전력값은 그리지 않는다 (12 §12). 상태는 기호+라벨 병기.

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
  return (
    <figure className="rounded-xl border border-slate-200 bg-white p-3">
      <figcaption className="mb-1 text-sm font-semibold text-slate-800">
        가상 섬 배치도 <span className="font-normal text-slate-500">(교육용 일러스트 · 실제 설비도 아님 · {night ? '밤' : '낮'} {timeLabel})</span>
      </figcaption>
      <svg viewBox="0 0 400 220" role="img" aria-label={`가상 섬 배치도. 현재 ${meta.label}: ${meta.desc}`} className="h-auto w-full rounded-lg bg-sky-50">
        <ellipse cx="200" cy="130" rx="170" ry="75" fill={night ? '#1e3a5f' : '#d9f0e3'} stroke="#94a3b8" />
        {/* 태양광 지붕 */}
        <g>
          <rect x="70" y="95" width="60" height="34" rx="3" fill="#fff" stroke="#475569" />
          <polygon points="70,95 100,78 130,95" fill={night ? '#334155' : '#f59e0b'} stroke="#475569" />
          <text x="100" y="150" textAnchor="middle" fontSize="10" fill={night ? '#e2e8f0' : '#334155'}>태양광 지붕</text>
        </g>
        {/* 풍력 터빈 */}
        <g>
          <line x1="180" y1="140" x2="180" y2="85" stroke="#475569" strokeWidth="3" />
          <circle cx="180" cy="80" r="4" fill="#475569" />
          <line x1="180" y1="80" x2="165" y2="68" stroke="#475569" strokeWidth="2" />
          <line x1="180" y1="80" x2="195" y2="68" stroke="#475569" strokeWidth="2" />
          <line x1="180" y1="80" x2="180" y2="98" stroke="#475569" strokeWidth="2" />
          <text x="180" y="150" textAnchor="middle" fontSize="10" fill={night ? '#e2e8f0' : '#334155'}>풍력 터빈</text>
        </g>
        {/* 배터리 건물 */}
        <g>
          <rect x="245" y="100" width="52" height="36" rx="3" fill="#fff" stroke="#0369a1" strokeWidth="2" />
          <rect x="251" y="108" width="10" height="20" fill="#0369a1" />
          <rect x="264" y="108" width="10" height="20" fill="none" stroke="#0369a1" />
          <rect x="277" y="108" width="10" height="20" fill="none" stroke="#0369a1" />
          <text x="271" y="150" textAnchor="middle" fontSize="10" fill={night ? '#e2e8f0' : '#334155'}>배터리</text>
        </g>
        {/* 학교·담수화 */}
        <g>
          <rect x="120" y="60" width="40" height="26" fill="#fff" stroke="#475569" />
          <text x="140" y="100" textAnchor="middle" fontSize="10" fill={night ? '#e2e8f0' : '#334155'}>학교</text>
          <rect x="310" y="70" width="36" height="24" fill="#fff" stroke="#475569" />
          <text x="328" y="106" textAnchor="middle" fontSize="9" fill={night ? '#e2e8f0' : '#334155'}>담수화</text>
        </g>
        {/* 상태 배지 */}
        <g>
          <rect x="12" y="12" width="150" height="30" rx="15" fill="#fff" stroke="#0f172a" />
          <text x="24" y="32" fontSize="14" fontWeight="bold" fill="#0f172a">{meta.symbol} {meta.label}</text>
        </g>
      </svg>
      <p className="mt-1 text-xs text-slate-600">{meta.symbol} {meta.label} — {meta.desc}. 수치·판정은 아래 표와 그래프에서 확인.</p>
    </figure>
  );
}
