import { io } from "socket.io-client";

import TopBar from "./components/TopBar.jsx";
import PlaylistUI from "./components/PlaylistUI.jsx";
import NowPlaying from "./components/NowPlaying.jsx";
import YouTubePlayer from "./components/YoutubePlayer.jsx";
import useMusicPlayer from "./hooks/useMusicPlayer.js";

const socket = io(import.meta.env.VITE_API_URL);

export default function App() {
  const player = useMusicPlayer();

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-20 bg-[url('/bus-background.png')] bg-cover bg-center scale-105" />

      {/* Overlay */}
      <div className="fixed inset-0 -z-10 bg-black/20 " />

      {/* Top */}
      <div className="relative z-10">
        <TopBar listeners={socket} />
      </div>

      {/* CENTER PLAYLIST */}
      <div className="fixed z-10 left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <PlaylistUI />
      </div>

      {/* NOW PLAYING - 25px above footer */}
      <div className="fixed z-20 bottom-18 left-1/2 -translate-x-1/2">
        <NowPlaying
          song={player.song}
          isPlaying={player.isPlaying}
          isRepeating={player.isRepeating}
          progress={player.progress}
          duration={player.duration}
          volume={player.volume}
          onPlayPause={player.togglePlay}
          onPrevious={player.previousSong}
          onNext={player.nextSong}
          onRepeat={player.toggleRepeat}
          onProgressChange={player.changeProgress}
          onVolumeChange={player.changeVolume}
          onToggleMute={player.toggleMute}
        />
      </div>

      <YouTubePlayer
        onReady={player.onReady}
        onStateChange={player.onStateChange}
      />

      {/* Footer */}
      <footer className="fixed z-30 bottom-0 left-0 w-full h-12.5 flex items-center justify-center text-[rgba(255,255,255,0.45)]">
        Made with <span className="mx-1 text-[#ff5a5a]">♥</span> by Rahul
      </footer>

    </main>
  );
}