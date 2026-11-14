import { useRef, useEffect } from "react";

/* ── 키보드 조작 공통 도우미 (학습 탭·코딩 탭) ──
   ↑/↓ = 이전/다음 카드(스와이프와 같음), Enter = 정답 확인 */

// window keydown을 등록하되, 항상 최신 handler를 부름 (등록은 한 번만)
export function useKeydown(handler) {
  const ref = useRef(handler);
  useEffect(() => { ref.current = handler; });
  useEffect(() => {
    const h = e => ref.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
}

// 글자 입력 중인지 (입력칸에선 ↑/↓를 카드 이동에 쓰지 않음)
export const isTypingTarget = e =>
  ["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName) || e.target?.isContentEditable;

// 버튼에 포커스가 있으면 Enter가 그 버튼을 누르므로, 정답 확인과 겹치지 않게 건너뜀
export const isButtonTarget = e => e.target?.tagName === "BUTTON";
