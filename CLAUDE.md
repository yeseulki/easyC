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
| `easycNickname` | User's chosen nickname |

Navigation between tabs is handled by `handleNavigate(targetTab, {stageIdx, cardIdx})` — this allows deep-linking into a specific card from other pages (e.g., HomePage continues where the user left off).

### Curriculum Data (`src/data/curriculum.js`)

Single source of truth: an array of 8 `stages`, each with `cards`. Three card types:

- **`concept`** — explanation with metaphor, tip, and optional `visualization` (`"memory"`, `"array"`, `"pointer"`)
- **`code`** — slot-filling exercise; `slots[]` define options, the correct answer index, and whether the slot is `fixed` (pre-filled/hidden from user)
- **`project`** — mini-project with free-text input slots (no options array, just `answer`)

### Pages

- **`LearnPage`** — swipeable card-by-card learning flow through stages. Renders `ConceptCard`, `SlotCodePicker`, or a project card based on `card.type`. Calls `onComplete(stageId)` when all cards in a stage are finished to award a badge.
- **`CodePage`** — practice mode: flattens all `type: "code"` cards across all stages into `CHALLENGES` and lets users type answers into inline inputs rendered within syntax-highlighted code.
- **`ProfilePage`** — displays earned badges, stage completion stats, and saved cards.
- **`HomePage`** — landing dashboard showing progress and a "continue" button.

### Components

- **`SlotCodePicker`** — renders multiple-choice slot buttons for `code`-type cards in LearnPage
- **`CodeCard`** — used in the saved items display
- **`ConceptCard`** — renders concept-type cards with metaphor/tip panels
- **`MemoryVisualizer`** — interactive RAM visualization used in the `"memory"` visualization variant
- **`ReelsContainer`** — slot-machine style UI element
- **`OnboardingOverlay`** — first-launch nickname setup modal
- **`DrumTutorialOverlay`** — code 카드 첫 진입 튜토리얼 (3슬라이드: 토큰탭 / 자연어해석 / 저장). localStorage: `easycDrumTutorialSeen`
- **`ConceptTutorialOverlay`** — concept 카드 첫 진입 튜토리얼 (1슬라이드: 팁 탭 체험). localStorage: `easycTutorialConcept`
- **`ProjectTutorialOverlay`** — project 카드 첫 진입 튜토리얼 (1슬라이드: 타이핑 안내). localStorage: `easycTutorialProject`

### 카드 전환 애니메이션 (2026-11-05 추가)

`LearnPage`의 카드 전환은 `navDirection.current`(1=앞/−1=뒤)에 따라 `cardSlideInUp` / `cardSlideInDown` 키프레임으로 방향감 있게 슬라이드된다. 키프레임은 `index.css`에 정의. 클리핑 컨테이너(`overflow:hidden`)로 감싸서 배너 위로 잔상이 넘치지 않도록 처리.

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
- **상태 묶음**: `qs = { mode, current, combo }` — 세 값을 하나의 객체로 atomic 업데이트해 흰 화면 버그 방지.
- **`startQuiz`**: `solved` 초기화가 필요한지 판단 후 `effectiveSolved`로 후보 풀 계산. `pickRandom`을 쓰지 않고 직접 선택.
- **`QuizView`**: `const { card, stage, format } = current`를 함수 최상단에 선언 (useEffect deps에서 `format` 참조 전에 반드시 선언되어야 TDZ 오류 없음).
- **콤보**: 연속 정답 시 `combo` 증가, 오답 시 0 초기화. 마일스톤(2/3/5/10)에 토스트 팝업.
- **칸별 색상**: `CodeTypingChallenge`의 `inputStatuses` / `SlotCodePicker`의 `slotStatuses` — 확인 후 맞은 칸 초록, 틀린 칸 빨간 색상.

### Deployment

Uses `@vercel/analytics` (auto-injected via `<Analytics />` in `App.jsx`). Deployed to Vercel.

## 작업 규칙
-작업 한 후에는 수정사항을 하단에 정리해서 알려준다. (코드 변경으로 글이 길어져서 위쪽으로 스크롤 해서 보기 힘들기 때문에)
- 기존 디자인과 구조는 요청한 부분 외에는 바꾸지 않는다.
- 사용자에게 보이는 설명 문구는 중학생이 친구에게 설명하듯 자연스러운 말투로 쓴다. 'AI 같은' 딱딱하고 과장된 표현은 피한다.
- 요청한 내용 이외의 것은 수정하지 않는다.