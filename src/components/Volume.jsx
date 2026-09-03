import {
  Volume2,
  VolumeX,
} from "lucide-react";

export default function Volume({
  volume,
  onVolumeChange,
  onToggleMute,
}) {
  return (
    <div className="volume-section flex items-center justify-center gap-2.5 mt-4">
      <button
        className="volume-icon h-8 w-8"
        onClick={onToggleMute}
        aria-label="Toggle mute"
      >
        {volume === 0 ? (
          <VolumeX size={18} />
        ) : (
          <Volume2 size={18} />
        )}
      </button>

      <input
        className="volume-slider w-27.5 accent-white"
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={onVolumeChange}
      />
    </div>
  );
}