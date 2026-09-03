import { formatTime } from "../utils/formatTime";

export default function ProgressBar({
  progress,
  duration,
  onChange,
}) {
  const progressPercent =
    duration > 0
      ? (progress / duration) * 100
      : 0;

  return (
    <div className="progress-section w-full grid grid-cols-[42px_1fr_42px] items-center gap-2.5 text-xs text-[rgba(255,255,255,0.7)]">
      <span>
        {formatTime(progress)}
      </span>

      <div className="range-wrapper relative h-5 flex items-center before:content-[''] before:absolute before:w-full before:h-1 before:rounded-[10px] before:bg-white/20">
        <div
          className="range-fill absolute left-0 h-1 rounded-[10px] bg-white pointer-events-none"
          style={{
            width: `${progressPercent}%`,
          }}
        />

        <input
        
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={onChange}
          className="relative w-full m-0 appearance-none bg-transparent cursor-pointer     
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:border-0
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white"
        />
      </div>

      <span>
        {formatTime(duration)}
      </span>
    </div>
  );
}