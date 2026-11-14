import { useState, useEffect } from "react";

/* ── 가로 화면(1024px 이상) 공통 레이아웃 도우미 — 학습 탭·코딩 탭에서 같이 사용 ── */

const WIDE_QUERY = "(min-width: 1024px)";

// 가로 화면 여부 (App.css 데스크톱 브레이크포인트와 같은 기준)
export function useIsWide() {
  const [isWide, setIsWide] = useState(() => typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => setIsWide(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isWide;
}

// 좌우 2단: 열 높이를 같게(stretch) → 각 열의 한 블록이 남는 높이를 채워서 위·아래 끝선이 맞음 (App.css .split-col 참고)
export const splitGrid = { display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 20, alignItems: "stretch" };

// 내용 폭을 최대 1120px로 두고 남는 공간을 좌우 여백으로 → 가운데로 모임
const WIDE_MAX = 1120;
export const wideSide = (isWide, base) => {
  if (!isWide) return {};
  const pad = `calc(${base}px + max(0px, (100% - ${WIDE_MAX}px) / 2))`;
  return { paddingLeft: pad, paddingRight: pad };
};
