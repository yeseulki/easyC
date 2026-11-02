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

### Deployment

Uses `@vercel/analytics` (auto-injected via `<Analytics />` in `App.jsx`). Deployed to Vercel.

## 작업 규칙
- 기존 디자인과 구조는 요청한 부분 외에는 바꾸지 않는다.
- 사용자에게 보이는 설명 문구는 중학생이 친구에게 설명하듯 자연스러운 말투로 쓴다. 'AI 같은' 딱딱하고 과장된 표현은 피한다.
- 요청한 내용 이외의 것은 수정하지 않는다.