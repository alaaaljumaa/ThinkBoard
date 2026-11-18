import { ClockIcon, RefreshCwIcon, XIcon } from "lucide-react";
import useCountdown from "../hooks/useCountdown";

const RateLimitBanner = ({ resetSeconds = 60, onRetry, onDismiss }) => {
  const { formatted, isActive, secondsLeft } = useCountdown(resetSeconds);

  const isCoolingDown = isActive && secondsLeft > 0;

  return (
    <div
      role="alert"
      className="relative mx-4 mt-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-lg transition-all duration-300
                 bg-amber-50 border-amber-200/70 shadow-amber-200/20
                 dark:bg-amber-950/40 dark:border-amber-800/60 dark:shadow-amber-900/20
                 sm:flex-row sm:items-center sm:justify-between"
    >
      {/* الجزء الأيسر: الأيقونة + النص */}
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                        bg-amber-100 text-amber-600
                        dark:bg-amber-900/60 dark:text-amber-400">
          <ClockIcon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {isCoolingDown
              ? "You've hit the rate limit"
              : "Rate limit lifted"}
          </p>
          <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/70">
            {isCoolingDown
              ? `You can try again in ${formatted}.`
              : "You can retry your request now."}
          </p>
        </div>
      </div>

      {/* الجزء الأيمن: الزر + إغلاق */}
      <div className="flex items-center gap-2 sm:shrink-0">
        <button
          onClick={onRetry}
          disabled={isCoolingDown}
          className={`btn btn-sm gap-1.5 rounded-lg border-0 font-semibold shadow-sm transition-all
            ${
              isCoolingDown
                ? "btn-disabled cursor-not-allowed bg-amber-200/60 text-amber-600/50 dark:bg-amber-900/30 dark:text-amber-500/40"
                : "bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5 hover:shadow-md dark:bg-amber-600 dark:hover:bg-amber-500"
            }`}
        >
          <RefreshCwIcon size={14} className={isCoolingDown ? "animate-spin" : ""} />
          {isCoolingDown ? formatted : "Retry now"}
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="grid h-8 w-8 place-items-center rounded-lg text-amber-600/60
                       transition hover:bg-amber-100 hover:text-amber-800
                       dark:text-amber-400/50 dark:hover:bg-amber-900/50 dark:hover:text-amber-200"
          >
            <XIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default RateLimitBanner;