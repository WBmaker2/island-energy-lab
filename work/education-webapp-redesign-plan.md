# 가상 섬 이미지 교체 계획

작성: 2026-09-15. 사용자 요청은 기존 이미지의 생성 이미지 교체로 한정한다.

## 근거와 범위
- 시작 git status는 깨끗함. 루트 AGENTS.md, EDUCATION_DESIGN.md, design-system/MASTER.md는 없음. 대화의 AGENTS 규칙과 00-shared-design-principles.md, 12-island-energy-lab.md를 적용.
- React/TypeScript/Vite. 과제 A/B → 과제 C 실행 → 시간별 상태/그래프/표 → 비교·손실 탐구 흐름 보존.
- IslandSchematic의 SVG는 명시적으로 수치 없는 가상 맥락 그림. 생성 교체 가능. EnergyChart, SocChart, BatteryCompare 그래프와 상태 패턴은 정확성 자산으로 보존.
- 중·고등 대상의 밝고 절제된 섬 디오라마 낮/밤 이미지. 태양광, 풍력, 배터리, 학교, 담수화 맥락. 텍스트·수치·로고·실제 지형 금지. 낮/밤 시설 배치 유지.
- 원본 컴포넌트를 work/originals에 보존. 새 자산은 public/assets/island-day-v2.webp, island-night-v2.webp. 코드의 시간·상태와 한국어 설명 유지. BASE_URL 경로 사용. 업데이트 내역 추가.
- 엔진, 데이터, 과제, 전체 스타일, 배포/HVC/커밋은 범위 밖.

## 수용·위험·롤백
- 그림에 허위 텍스트/수치 없음, 생성 개념 그림임을 명시. 정전 판정은 코드 설명만 담당.
- 이미지 공간 예약, 모바일 가로 넘침 없음, 낮/밤 전환 및 로딩 확인. 기존 버튼/키보드/모션 감소 유지.
- npm run verify, npm run build. 브라우저 320/375/768/1280px, 실행→시간 전환→결과 확인. VoiceOver 제외.
- 롤백: 보존 컴포넌트 복원, 이번 업데이트 내역과 새 이미지 참조만 제거.

## 스킬 실행
- 2026-09-15 사전 로드: impeccable, ui-ux-pro-max, redesign-existing-projects는 /Users/kimhongnyeon/.agents/skills/<name>/SKILL.md, imagegen은 /Users/kimhongnyeon/.codex/skills/.system/imagegen/SKILL.md. 모두 available. Stage0 exit 0.
- impeccable context는 로컬 캐시 권한으로 실패, 직접 코드/문서 감사로 대체하고 정식 도구 감사 통과라 주장하지 않는다.
- UIUX runtime-cli success / MASTER 존재. 검색의 아동용 폰트·인디고·마케팅 레이아웃은 중고등 시뮬레이션 및 좁은 요청과 맞지 않아 미채택. 기존 sky/slate 한국어 시스템 글꼴과 라이트 UI 유지. 이미지의 부드러운 입체 표현만 참고.
- 구현·생성·검증은 gpt-5.6-luna에 위임. 상위는 계획과 결과 리뷰.
