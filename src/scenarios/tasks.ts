// scenarios/tasks.ts — 최소 구체 과제 A·B·C·D 정의 (12 §7)

export interface UnitCard {
  id: string;
  text: string;
  kind: 'kw' | 'kwh' | 'h';
}

export const TASK_A_CARDS: UnitCard[] = [
  { id: 'a1', text: '20 kW를 3시간', kind: 'kw' },
  { id: 'a2', text: '60 kWh 저장', kind: 'kwh' },
  { id: 'a3', text: '5 kW 태양광', kind: 'kw' },
  { id: 'a4', text: '12 kWh 방전', kind: 'kwh' },
  { id: 'a5', text: '3 시간', kind: 'h' },
  { id: 'a6', text: '40 kW 방전 한도', kind: 'kw' },
  { id: 'a7', text: '120 kWh 용량', kind: 'kwh' },
  { id: 'a8', text: '1 시간 슬롯', kind: 'h' },
];

export const TASK_A_PAIRS: Array<{ prompt: string; answer: string; explain: string }> = [
  { prompt: '20 kW × 3 h = ?', answer: '60 kWh', explain: '전력(kW)에 시간(h)을 곱해야 에너지(kWh)가 된다.' },
  { prompt: '배터리 용량 120 kWh의 단위는?', answer: 'kWh', explain: '저장량은 시간 동안 이동한 양이므로 kWh.' },
  { prompt: '방전 한도 40 kW의 단위는?', answer: 'kW', explain: '한도는 지금 낼 수 있는 비율이므로 kW.' },
];

export interface HourQuiz {
  genKW: number;
  loadKW: number;
  storedKWh: number;
  eMaxKWh: number;
  pMaxKW: number;
  etaC: number;
  etaD: number;
}

export const TASK_B_QUIZ: HourQuiz = {
  genKW: 10,
  loadKW: 4,
  storedKWh: 0,
  eMaxKWh: 10,
  pMaxKW: 40,
  etaC: 0.8,
  etaD: 0.95,
};

export interface LossCase {
  id: string;
  title: string;
  chargeKWh: number;
  etaC: number;
  dischargeKWh: number;
  etaD: number;
}

export const TASK_D_CASES: LossCase[] = [
  { id: 'd1', title: '사례 1 · 충전 효율 0.95', chargeKWh: 10, etaC: 0.95, dischargeKWh: 8, etaD: 0.95 },
  { id: 'd2', title: '사례 2 · 충전 효율 0.80', chargeKWh: 10, etaC: 0.8, dischargeKWh: 8, etaD: 0.8 },
];

export const LESSON_FLOW = [
  { step: 1, title: 'kW·kWh 예측', desc: '카드 짝짓기로 단위를 구분한다' },
  { step: 2, title: '24시간 표 읽기', desc: '발전·부하 시간표를 읽는다' },
  { step: 3, title: '배터리 설정', desc: '용량·효율·초기량을 정한다' },
  { step: 4, title: '수지 실행', desc: '시간별 충·방전을 계산한다' },
  { step: 5, title: '구간 표시', desc: '부족·충전·손실을 찾는다' },
  { step: 6, title: '조건 수정', desc: '수요 이동·용량 변경 후 비교' },
  { step: 7, title: '한계 설명', desc: '정전 없는 조건의 한계를 말한다' },
] as const;
