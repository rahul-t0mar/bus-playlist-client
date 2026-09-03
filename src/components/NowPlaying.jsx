import { Music2 } from "lucide-react";

import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
// import Volume from "./Volume";

export default function NowPlaying({
  song,
  isPlaying,
  // isShuffled,
  isRepeating,
  progress,
  duration,
  // volume,
  onPlayPause,
  onPrevious,
  onNext,
  // onShuffle,
  onRepeat,
  onProgressChange,
  // onVolumeChange,
  // onToggleMute,
}) {
  return (
    <section className="player-card w-155 mx-auto mb-6 py-5.5 px-6.5 border border-[rgba(255,255,255,0.25)] rounded-4xl bg-[rgba(25,25,25,0.36)] backdrop-blur-[5px] shadow-[0_20px_80px_rgba(0,0,0,0.35),inset_0_1px_rgba(255,255,255,0.12)] ">
      <div className="song-info flex items-center gap-4.5">
        <div className="album-art w-20 h-20 shrink-0 overflow-hidden grid items-center rounded-full bg-[rgba(255,255,255,0.14)] border-2 border-[rgba(255,255,255,0.25)] shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          {song.artwork ? (
            <img
              src={song.artwork}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music2 size={34} />
          )}
        </div>

        <div className="song-text min-w-0 w-full">
          <h2 className="m-0  text-4.5 font-bold truncate">{song.title}</h2>
          <ProgressBar
            progress={progress}
            duration={duration}
            onChange={onProgressChange}
          />
        </div>
      </div>

      <Controls
        isPlaying={isPlaying}
        // isShuffled={isShuffled}
        isRepeating={isRepeating}
        onPlayPause={onPlayPause}
        onPrevious={onPrevious}
        onNext={onNext}
        // onShuffle={onShuffle}
        // onRepeat={onRepeat}
      />

      {/* <Volume
        volume={volume}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      /> */}
    </section>
  );
}
