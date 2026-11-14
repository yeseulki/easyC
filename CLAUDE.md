# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**easyC** is a Korean-language C programming learning web app built with React + Vite. It teaches C concepts through interactive flashcard-style lessons with slot-filling code exercises.

The actual app lives in `vite-project/`. The root directory also contains standalone HTML presentation files (`발표자료_강은효, 기예슬.html`, `발표자료수정.html`) and image assets — these are separate from the app.

## Development Commands

All commands run from `vite-project/`:

```bash
cd vite-project
npm run dev       # start dev server with HMR
npm run build     # production build
npm run preview   # preview production build
npm run lint      # ESLint
```

## Architecture

### State Management (`src/App.jsx`)

All shared state lives in `App.jsx` and is passed down as props. There is no external state library. User progress is persisted to `localStorage` with these keys:

| Key | Contents |
|-----|----------|
| `easycProgress` | Array of completed stage IDs |
| `easycBadges` | Array of earned badge strings |
| `easycCardAnswers` | Object mapping `"stageId-cardIdx"` → user's answer |
| `easycViewedTips` | Object mapping `"stageIdx-cardIdx"` → boolean |
| `easycLastPos` | `{stageIdx, cardIdx}` for resuming |
| `easycOnboarded` | `"true"` if onboarding completed |
| `easycNickname` | User's chosen nickname (ProfilePage 프로필 카드에도 표시, 없으면 "코딩 학생") |
| `easycSavedItems` | 저장한 학습 카드 배열 `{title, type, stageIdx, cardIdx}` — 새로고침해도 유지 (2026-11-14 추가). 카드 객체 전체는 함수 필드 때문에 저장 불가라 이 4개만 저장 |
| `easycCodeSolved` | 코딩탭에서 맞힌 문제 title 배열 |

Navigation between tabs is handled by `handleNavigate(targetTab, {stageIdx, cardIdx})` — this allows deep-linking into a specific card from other pages (e.g., HomePage continues where the user left off).

### Curriculum Data (`src/data/curriculum.js`)

Single source of truth: an array of 8 `stages`, each with `cards`. Three card types:

- **`concept`** — explanation with metaphor, tip, and optional `visualization` (`"memory"`, `"array"`, `"pointer"`)
- **`code`** — slot-filling exercise; `slots[]` define options, the correct answer index, and whether the slot is `fixed` (pre-filled/hidden from user)
- **`project`** — mini-project with free-text input slots (no options array, just `answer`)

### Pages

- **`LearnPage`** — swipeable card-by-card learning flow through stages. Renders `ConceptCard`, `SlotCodePicker`, or a project card based on `card.type`. Calls `onComplete(stageId)` when all cards in a stage are finished to award a badge.
- **`CodePage`** — practice mode: flattens all `type: "code"` cards across all stages into `CHALLENGES` and lets users type answers into inline inputs rendered within syntax-highlighted code.
- **`ProfilePage`** — 순서: 프로필 카드(닉네임·칭호·다음 칭호 진행 막대) → 저장된 학습 → 뱃지 → 스테이지 → 도움말 → 응원 문구. 칸 제목은 `.ios-section-title`(20px/800, App.css). 통계 4칸(획득 뱃지 등)은 2026-11-14 삭제.
  - 칭호 `LEVELS`(뱃지 수 기준): 씨앗 0 / 새싹 1 / 나무 2 / 마법사 3 / 해커 4 / 마스터 5
- **`HomePage`** — landing dashboard showing progress and a "continue" button. "핵심 기능" 영역·설명 팝업, 상단 분류 배너(전체/기초/조건·반복…)는 2026-11-14 삭제. 가로 화면에선 위 학습 시작 카드 / 아래 스테이지(항상 가로 4 × 세로 2), 내용 폭 최대 1120px 가운데, 위 여백 32px. 스테이지 카드엔 "카드 N개"/"이전 단계를 완료하세요" 문구 없음.

### Components

- **`SlotCodePicker`** — 슬롯(드럼) 선택 UI. 코딩탭 토큰 문제와 `CodeCard`에서 사용 (LearnPage 실습 카드는 자체 `InlineSlot` 사용)
- **`CodeCard`** — used in the saved items display
- **`ConceptCard`** — renders concept-type cards with metaphor/tip panels
- **`MemoryVisualizer`** — interactive RAM visualization used in the `"memory"` visualization variant
- **`ReelsContainer`** — slot-machine style UI element
- **`OnboardingOverlay`** — first-launch nickname setup modal
- **`DrumTutorialOverlay`** — code 카드 첫 진입 튜토리얼 (3슬라이드: 토큰탭 / 자연어해석 / 저장). localStorage: `easycDrumTutorialSeen`
- **`ConceptTutorialOverlay`** — concept 카드 첫 진입 튜토리얼 (1슬라이드: 팁 탭 체험). localStorage: `easycTutorialConcept`
- **`ProjectTutorialOverlay`** — project 카드 첫 진입 튜토리얼 (1슬라이드: 타이핑 안내). localStorage: `easycTutorialProject`

### Hooks (`src/hooks/`, 2026-11-14 추가)

- **`useIsWide.js`** — `useIsWide()`: 가로 화면(`min-width: 1024px`, App.css 데스크톱 기준과 동일) 여부. `splitGrid`: 좌우 2단 grid 스타일. `wideSide(isWide, base)`: 내용 최대 폭 1120px 가운데 정렬용 좌우 padding.
- **`useKeydown.js`** — `useKeydown(handler)`: window keydown 등록(항상 최신 handler 호출). `isTypingTarget(e)` / `isButtonTarget(e)`: 입력칸·버튼 포커스일 때 키 처리 건너뛰기용.

### 카드 전환 애니메이션 (2026-11-05 추가 / 2026-11-07 개선)

LearnPage와 CodePage 모두 동일한 방식으로 동작. `index.css`에 4개 키프레임 정의:
- `cardSlideInUp` / `cardSlideInDown` — 진입 (48px 이동, 0.22s, cubic-bezier(0.2,0,0,1))
- `cardSlideOutUp` / `cardSlideOutDown` — 퇴장 (48px 이동, 0.12s)

**LearnPage**: `exiting` state + `exitDir` ref로 120ms exit 후 카드 교체. `navDirection.current`(1=앞/−1=뒤)로 방향 결정.
**CodePage**: `QuizView`의 content div에 exit 애니메이션, 외부 컨테이너에 enter 애니메이션. 정답 후 위로 스와이프/스크롤로 다음 문제 이동 (버튼 없음). 아래로 스와이프하면 전 문제(아래 "코딩탭" 참고) — `qs.dir`/`exitDir`로 방향 결정.

### codeExample 필드 (concept 카드, 2026-11-07 추가)

`curriculum.js`의 concept 카드에 선택적으로 추가. `LearnPage`의 `ConceptLearnCard`에서 `←` 기준으로 코드/주석 분리해 렌더링:
- 흰 배경 박스, 빨/노/초 점(8px), "코드 예시" 레이블
- 코드: `SyntaxLine`으로 구문 색상, `← ✏️ 내가 쓰는 줄`은 챕터 색+굵게, `← 틀`은 검정

### 토스트 (App.jsx)

- `showToast(msg, correct)` — 2초 후 자동 페이드아웃 (0.18s)
- `dismissToast()` — 카드 이동/뱃지 페이지 전환 시 즉시 페이드아웃
- `onCardChange` prop으로 LearnPage → App에 카드 이동 이벤트 전달

### 미니프로젝트 셀 검사 (2026-11-05 추가)

`ProjectLearnCard`의 `getCellStatuses(arr)` 함수가 각 입력 칸별 "ok"/"err" 배열을 반환. `CellsDisplay`에 `cellStatuses` prop으로 전달해 맞은 칸은 초록, 틀린 칸은 빨간 테두리/배경으로 표시. 타이핑 시 `setCellStatuses([])` 로 초기화.

### 코드 카드 정답 흐름 (2026-11-05 변경)

정답 후 자동 넘김 없음 — `check()`에서 `status === "ok"` 이면 그냥 return. 사용자가 직접 스와이프/스크롤로 넘겨야 함. 미니프로젝트도 동일.

### dynamicOutput / dynamicHints (2026-11-07 추가)

`curriculum.js` code/project 카드에 선택적으로 추가 가능한 함수 필드:

- **`dynamicOutput(groupValues)`** — `groupId`로 묶인 슬롯의 현재 선택값을 받아 출력 결과를 반환. 정답이면 `string`, 오답이면 `Array<{output: string|null, note: string}>`. `LearnPage`의 오답 해설 카드("🔍 뭐가 틀렸나 봐봐")에서 배열/문자열을 구분해 렌더링.
- **`dynamicHints(cellStatuses)`** — 미니프로젝트 전용. 셀별 "ok"/"err" 배열을 받아 틀린 범주에 해당하는 힌트 문자열 배열만 반환. `ProjectLearnCard`에서 오답 후 별도 카드로 표시, 타이핑 시 사라짐.

### 코딩탭 (CodePage) 주요 구조 (2026-11-07 정비)

- **문제 형식**: 토큰(슬롯 선택) / 타이핑(직접 입력) 랜덤 출제. `card.tokenOnly: true`면 항상 토큰 모드.
- **상태 묶음**: `qs = { mode, current, combo, history, forward, dir }` — 하나의 객체로 atomic 업데이트해 흰 화면 버그 방지.
- **전 문제로 돌아가기 (2026-11-14)**: `history`(지나온 문제) / `forward`(돌아갔다가 다시 갈 문제). `handlePrev(curSolved)`는 history에서 꺼내고 지금 문제를 forward에 넣음, `handleNext`는 forward가 있으면 그걸 먼저 꺼냄. 각 항목의 `wasSolved`로 이미 푼 문제는 다시 안 풀어도 넘어갈 수 있음(콤보 중복 증가 없음). 나가기/새 시작 시 초기화.
- **상단 바 없음 (2026-11-14)**: 단원 뱃지 · 🔥N연속 · 형식(⌨️/🎰) · 오른쪽 끝 작은 "나가기 ✕"가 문제 맨 위 한 줄에 있음.
- **`startQuiz`**: `solved` 초기화가 필요한지 판단 후 `effectiveSolved`로 후보 풀 계산. `pickRandom`을 쓰지 않고 직접 선택.
- **`QuizView`**: `const { card, stage, format } = current`를 함수 최상단에 선언 (useEffect deps에서 `format` 참조 전에 반드시 선언되어야 TDZ 오류 없음).
- **콤보**: 연속 정답 시 `combo` 증가, 오답 시 0 초기화. 마일스톤(2/3/5/10)에 토스트 팝업.
  - 토스트는 "성공!" 토스트와 같은 시간(2초 + 페이드)만큼 표시. 위치 `top`: 세로 32% / 가로 26%.
  - `mountCombo` ref: 다음 문제로 넘어가 QuizView가 새로 그려질 땐 토스트·뱃지 pop을 다시 띄우지 않음.
  - 가운데 정렬은 바깥 flex div, pop 애니메이션은 안쪽 div — `transform`이 겹쳐 오른쪽에서 나타나던 문제 방지.
- **오답 해석 문구**: `SlotCodePicker` 오답 시 `translateLine` 결과가 기본값 "👉 코드 실행"이면 표시 안 함.
- **칸별 색상**: `CodeTypingChallenge`의 `inputStatuses` / `SlotCodePicker`의 `slotStatuses` — 확인 후 맞은 칸 초록, 틀린 칸 빨간 색상.

### 가로 화면 레이아웃 (1024px 이상, 2026-11-14 추가)

세로 화면은 기존 그대로. 가로 화면에서만 아래처럼 동작.

- **공통 2단 규칙** (App.css `.split-col`):
  - `grid alignItems: stretch`로 좌우 열 높이를 같게 하고, `grow-first`/`grow-last` 클래스가 붙은 블록이 남는 높이를 채워 위·아래 끝선을 맞춤.
  - 늘어난 블록 안 내용은 세로 가운데(글자는 왼쪽 정렬). `.code-window` 박스는 빨/노/초 점 줄은 위에 두고 코드만 가운데.
  - `.split-col > *` margin 초기화 → 블록 간격은 gap 12px 하나로 통일.
  - 내용 폭 최대 1120px, 남는 공간은 좌우 여백 (`wideSide`). 홈 · 학습 · 코딩(시작 화면·문제 화면) · 내 정보 탭 모두 같은 여백.
- **학습 탭** (`LearnPage`):
  - 실습 카드: 왼쪽 코드 / 오른쪽 설명 → 🔍 오답 해설 → 학습 완료. 확인 버튼은 하단 고정(카드 폭과 같게 `ctaFullWidth`, 세로 화면도 동일).
  - 개념 카드: 왼쪽 메모리 그림·비유·코드 예시 / 오른쪽 본문·핵심 팁.
  - 미니프로젝트: 왼쪽 입력 / 오른쪽 설명·힌트. 가로 화면에선 정답 확인 버튼 하단 고정.
  - 실습·미니프로젝트는 `.split-text`로 글자·줄간격 조금 크게.
- **코딩 탭** (`CodePage`, `SlotCodePicker`의 `wide`/`asideTop`/`asideBottom` props):
  - 타이핑: 왼쪽 코드 / 오른쪽 출력 결과 → 버튼.
  - 토큰: 왼쪽 출력 결과 / 오른쪽 슬롯(흰 박스), 버튼은 2단 아래 전체 폭.
  - 정답·오답·힌트 문구는 2단 아래 전체 폭(`.wide-msgs`), 스와이프 안내는 맨 아래 가운데.
  - `SIZE.wide`로 글자·칸 크기 조금 크게 (세로는 `SIZE.normal` = 기존 값).
- **탭 배너** (App.css): 3칸 grid(로고·제목 | 탭 | 빈칸)로 좁은 폭에서 "학습하기" 글자와 탭 겹침 방지. 높이 62px (세로 화면 하단 탭 바는 50px).
- **학습 탭 스테이지 배너**: `.learn-stage-bar` 위아래 10px, 왼쪽 20px 여백 (세로·가로 공통). 카드 안 "1 / N" 표시는 삭제 → 세로 화면 `ios-nav`에만 있음(가로 화면엔 `ios-nav`가 숨겨져 숫자 표시 없음).
- **핵심 팁**: 팁 내용이 항상 자리를 차지(닫혀 있을 땐 `visibility: hidden`) → 처음부터 펼친 크기.

### 키보드 조작 (2026-11-14 추가)

- **↑ / ↓**: 학습 탭 이전/다음 카드(`go(-1)`/`go(1)`, 스와이프와 동일하게 스크롤·잠금 규칙 적용, 첫/마지막 카드에서 막힘). 코딩 탭 전 문제 / 다음 문제(맞힌 뒤).
- **Enter**: 학습 탭 실습 카드 확인하기, 미니프로젝트 정답 확인. 코딩 탭 토큰 확인(`enterToCheck` prop, 코딩 탭에서만 켬), 타이핑은 입력칸 밖에서 확인하기.
- 입력칸에 포커스가 있으면 ↑/↓ 무시, 버튼에 포커스가 있으면 Enter 무시(버튼 자체 클릭과 중복 방지), `e.repeat` 무시.

### Deployment

Uses `@vercel/analytics` (auto-injected via `<Analytics />` in `App.jsx`). Deployed to Vercel.

## 작업 규칙
-작업 한 후에는 수정사항을 하단에 정리해서 알려준다. (코드 변경으로 글이 길어져서 위쪽으로 스크롤 해서 보기 힘들기 때문에)
- 기존 디자인과 구조는 요청한 부분 외에는 바꾸지 않는다.
- 사용자에게 보이는 설명 문구는 중학생이 친구에게 설명하듯 자연스러운 말투로 쓴다. 'AI 같은' 딱딱하고 과장된 표현은 피한다.
- 요청한 내용 이외의 것은 수정하지 않는다.