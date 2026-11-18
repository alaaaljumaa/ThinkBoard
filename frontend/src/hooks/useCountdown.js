import { useEffect, useState, useCallback } from "react";

const useCountdown = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(initialSeconds > 0);

  // إعادة التشغيل عند تغيير القيمة الأولية
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsActive(initialSeconds > 0);
  }, [initialSeconds]);

  // العدّاد التنازلي
  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const start = useCallback((seconds) => {
    setSecondsLeft(seconds);
    setIsActive(seconds > 0);
  }, []);

  const reset = useCallback(() => {
    setSecondsLeft(0);
    setIsActive(false);
  }, []);

  // تنسيق الوقت بصيغة MM:SS
  const formatted = (() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  return { secondsLeft, formatted, isActive, start, reset };
};

export default useCountdown;