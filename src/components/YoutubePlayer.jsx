import YouTube from "react-youtube";

export default function YouTubePlayer({ onReady, onStateChange }) {
  const youtubeOptions = {
    width: "1",
    height: "1",

    playerVars: {
      autoplay: 0,
      controls: 0,
      playsinline: 1,
      rel: 0,
    },
  };

  return (
    <div
      className="absolute w-px h-px overflow-hidden opacity-0 pointer-events-none -z-10"
      aria-hidden="true"
    >
      <YouTube
        videoId=""
        opts={youtubeOptions}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
}
