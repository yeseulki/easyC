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

### Deployment

Uses `@vercel/analytics` (auto-injected via `<Analytics />` in `App.jsx`). Deployed to Vercel.

## 작업 규칙
-작업 한 후에는 수정사항을 하단에 정리해서 알려준다. (코드 변경으로 글이 길어져서 위쪽으로 스크롤 해서 보기 힘들기 때문에)
- 기존 디자인과 구조는 요청한 부분 외에는 바꾸지 않는다.
- 사용자에게 보이는 설명 문구는 중학생이 친구에게 설명하듯 자연스러운 말투로 쓴다. 'AI 같은' 딱딱하고 과장된 표현은 피한다.
- 요청한 내용 이외의 것은 수정하지 않는다.