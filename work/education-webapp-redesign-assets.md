# 이미지 자산 교체 기록

작성일: 2026-09-15

## 판정

기존 `src/renderers/IslandSchematic.tsx`의 SVG는 수치·도식·사실 자료가 아닌 가상 섬 맥락 장식입니다. 따라서 생성 교체 후보로 판정했습니다. 그래프와 표(`EnergyChart`, `SocChart`, `BatteryCompare`, `ResultsTable`)는 수치·판정 근거이므로 유지했습니다.

| 원본 | 새 파일 | 역할·이유 | 접근성 | 상태 | 롤백 |
|---|---|---|---|---|---|
| `src/renderers/IslandSchematic.tsx` 내부 SVG | `public/assets/island-day-v2.webp` | 낮 시간 가상 섬 개념 일러스트. 1672×941, WebP 약 164 KB | 정보성 alt: “태양광·풍력·배터리·학교·담수화 시설이 배치된 가상 섬” | 생성·참조 갱신·빌드 확인 | 보존본 `work/originals/IslandSchematic.tsx.svg-original` 복원 |
| 동일 SVG의 밤 상태 | `public/assets/island-night-v2.webp` | 동일 구도 밤 시간 변형. 1672×941, WebP 약 145 KB | 동일 alt, 조명은 판정과 무관하다는 설명 병기 | 생성·참조 갱신·빌드 확인 | `IslandSchematic.tsx`에서 원본 SVG 복원 |

생성 PNG 중간 산출물은 `work/originals/generated/`에 보존했고 배포 자산에는 최적화 WebP만 포함했습니다. 두 이미지에는 텍스트·수치·로고·실제 장소·실존 인물이 없습니다. 이미지의 조명과 시설 모습은 분위기와 위치 이해를 위한 것이며 정전 판정은 기존 계산 엔진·표·그래프가 담당합니다.

## 생성 프롬프트

사용 도구: built-in `image_gen` (일반 생성 1회, 기존 생성 결과를 참조한 lighting-weather 편집 1회)

### 낮 생성

```text
Use case: stylized-concept
Asset type: educational web app island energy scene, wide 16:9 raster illustration
Primary request: Create a clean, friendly isometric diorama of a fictional island energy learning lab for Korean middle and high school students. Show a small green island surrounded by calm blue water with a compact school building, a rooftop solar array, one simple wind turbine, a battery storage building, and a small desalination plant. This is a conceptual teaching illustration that supports the learner's understanding of where energy assets are located.
Scene/backdrop: fictional island with softly layered hills, shoreline, water, and simple connecting paths
Subject: solar roof, wind turbine, battery building, school, desalination building arranged clearly with generous spacing
Style/medium: polished soft 3D paper-and-clay diorama, approachable classroom illustration, crisp edges, subtle depth, no photorealism
Composition/framing: wide horizontal composition, island centered, all facilities visible, balanced negative space around the edges, readable at a small card size
Lighting/mood: bright daytime, soft sunlight, calm and curious
Color palette: sky blue, sea blue, fresh greens, warm sand, restrained orange solar accents
Materials/textures: matte clay and paper textures, gentle ambient occlusion, simple shapes
Text (verbatim): ""
Constraints: fictional conceptual scene only; no measurements, no data visualizations, no arrows, no legends, no labels, no letters, no numbers, no logos, no brands, no flags, no real identifiable location, no people, no watermark
Avoid: readable text or pseudo-text, extra equipment, dense wiring, technical diagram styling, gloomy lighting, clutter
```

### 밤 편집

```text
Use case: lighting-weather
Asset type: educational web app island energy scene, wide 16:9 raster illustration
Primary request: Edit the provided daytime fictional island energy diorama into a night version for the same educational app. Change only time of day, sky, water reflections, and scene lighting.
Input images: Image 1: edit target; preserve the exact island layout, school, rooftop solar array, single wind turbine, battery storage building, desalination plant, paths, shoreline, and framing.
Scene/backdrop: same fictional island and calm surrounding sea
Subject: same facilities and arrangement as the input image
Style/medium: preserve the polished soft 3D paper-and-clay diorama style and clean classroom illustration finish
Composition/framing: preserve the exact wide horizontal composition and all facility positions
Lighting/mood: clear blue hour into night, deep navy sky, gentle moonlight, subtle warm window lights only, restrained cool shadows; keep every facility readable
Color palette: deep navy, indigo, muted teal water, soft moonlit greens, small warm amber window accents
Materials/textures: preserve matte clay and paper textures, gentle depth and ambient occlusion
Text (verbatim): ""
Constraints: change only lighting and time of day; no measurements, no data visualizations, no arrows, no legends, no labels, no letters, no numbers, no logos, no brands, no flags, no real identifiable location, no people, no watermark; keep the solar panels, turbine, battery building, school, and desalination plant in the same positions and recognizable
Avoid: rearranging or adding equipment, extra turbines, dense wiring, technical diagram styling, unreadable pseudo-text, overly dark silhouettes, storm clouds
```

## 코드 참조·검증

- `IslandSchematic` now selects `island-day-v2.webp` / `island-night-v2.webp` using `import.meta.env.BASE_URL`, preserving subpath deployment support.
- `npm run verify`: PASS (F01–F07 fixtures).
- `npm run build`: PASS (`tsc --noEmit` and `vite build`).
- `img` intrinsic ratio is 1672×941; `width`/`height`, `loading="lazy"`, and `decoding="async"` reserve the image space.
- Manual image inspection: both generated files viewed locally; no readable labels, measurements, logos, or watermarks observed. Browser width sweep remains parent agent's final QA item.
