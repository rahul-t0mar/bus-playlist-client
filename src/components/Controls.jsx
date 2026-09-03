import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  // Shuffle,
  // Repeat,
} from "lucide-react";
import { useEffect } from "react";

export default function Controls({
  isPlaying,
  // isShuffled,
  // isRepeating,
  onPlayPause,
  onPrevious,
  onNext,
  // onShuffle,
  // onRepeat,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger while typing
      const target = event.target;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Spacebar → Play/Pause
      if (event.code === "Space") {
        event.preventDefault();
        onPlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPlayPause]);
  return (
    <div className="flex justify-center items-center gap-3.5 mt-2 mb-1">
      {/* <button
        className={`cursor-pointer grid place-items-center bg-transparent transition-[transform,background,color] duration-200 ease-in w-11.5 h-11.5 rounded-full bg-[rgba(255, 255, 255, 0.14)] border border-solid border-[rgba(255, 255, 255, 0.2)] hover:scale-[1.08] hover:bg-white/24 ${isShuffled ? "active" : ""}`}
        onClick={onShuffle}
        aria-label="Shuffle"
      >
        <Shuffle size={18} />
      </button> */}

      <button
        className="control-button cursor-pointer grid place-items-center bg-transparent transition-[transform,background,color] duration-200 ease-in w-11.5 h-11.5 rounded-full bg-[rgba(255, 255, 255, 0.14)] border border-solid border-[rgba(255, 255, 255, 0.2)] hover:scale-[1.08] hover:bg-white/24"
        onClick={onPrevious}
        aria-label="Previous song"
      >
        <SkipBack size={20} fill="currentColor" />
      </button>

      <button
        className="play-button cursor-pointer grid place-items-center bg-transparent transition-[transform,background,color] duration-200 ease-in w-14 h-14 rounded-full bg-[rgba(255, 255, 255, 0.14)] border border-solid border-[rgba(255, 255, 255, 0.2)] text-[#222] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-[1.08]"
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={24} fill="currentColor" />
        ) : (
          <Play size={24} fill="currentColor" />
        )}
      </button>

      <button
        className="control-button cursor-pointer grid place-items-center bg-transparent transition-[transform,background,color] duration-200 ease-in w-11.5 h-11.5 rounded-full bg-[rgba(255, 255, 255, 0.14)] border border-solid border-[rgba(255, 255, 255, 0.2)] hover:scale-[1.08] hover:bg-white/24"
        onClick={onNext}
        aria-label="Next song"
      >
        <SkipForward size={20} fill="currentColor" />
      </button>

      {/* <button
        className={`icon-button cursor-pointer grid place-items-center bg-transparent transition-[transform,background,color] duration-200 ease-in w-9 h-9 rounded-full text-[rgba(255, 255, 255, 0.55)] hover:text-white hover:bg-[rgba(255, 255, 255, 0.14)] ${isRepeating ? "text-[rgba(255,255,255, 0.55)] bg-rgba[255, 255, 255, 0.14]" : ""}`}
        onClick={onRepeat}
        aria-label="Repeat"
      >
        <Repeat size={18} />
      </button> */}
    </div>
  );
}
