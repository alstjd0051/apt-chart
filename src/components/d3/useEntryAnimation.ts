import { useState, useEffect, useRef } from "react";

/**
 * 차트 진입 애니메이션 트리거.
 * - RAF 취소하지 않음: cleanup에서 cancelAnimationFrame 제거 → animated가 true로 설정됨
 * - primitive deps 사용: effect가 매 렌더마다 실행되지 않도록 함
 */
export function useEntryAnimation(dataLength: number, innerWidth: number) {
  const [animated, setAnimated] = useState(false);
  const prevKey = useRef("");

  useEffect(() => {
    const key = `${dataLength}-${innerWidth}`;
    if (key !== prevKey.current) {
      prevKey.current = key;
      setAnimated(false);
      // 이중 RAF: 브라우저가 DOM을 그린 뒤 애니메이션 시작
      // cleanup에서 cancel 절대 금지 — setAnimated(true)가 실행되지 않으면 차트가 안 보임
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimated(true));
      });
    }
  }, [dataLength, innerWidth]);

  return animated;
}
