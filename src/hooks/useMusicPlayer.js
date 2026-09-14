import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/playlist`;
const PROGRESS_INTERVAL = 500;

const QUEUE_SIZE = 10;
const PREVIOUS_COUNT = 3;
const NEXT_COUNT = 6;

export default function useMusicPlayer() {
 
  // REFS
 

  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const playerReadyRef = useRef(false);

  /*
   * Queue layout:
   *
   * index 0 = previous - 3
   * index 1 = previous - 2
   * index 2 = previous - 1
   * index 3 = CURRENT
   * index 4 = next 1
   * index 5 = next 2
   * index 6 = next 3
   * index 7 = next 4
   * index 8 = next 5
   * index 9 = next 6
   */
  const queueRef = useRef([]);

  // Prevent multiple prefetch requests
  const isPrefetchingRef = useRef(false);

  // Used to invalidate old async requests
  const requestIdRef = useRef(0);

 
  // STATE
 

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(70);
  const [previousVolume, setPreviousVolume] = useState(70);

  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [song, setSong] = useState({
    videoId: null,
    title: "Select a song",
    artist: "YouTube Music",
    artwork: null,
  });

  // This exposes the complete 10-song window to the UI
  const [queue, setQueue] = useState([]);

 
  // HELPERS
 

  const normalizeSong = useCallback((data) => {
    if (!data?.videoId) return null;

    return {
      videoId: data.videoId,
      title: data.title || "Unknown title",
      artist: data.artist || "YouTube Music",
      artwork:
        data.artwork ||
        `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
    };
  }, []);

  const setCurrentSong = useCallback(
    (data) => {
      const normalized = normalizeSong(data);

      if (!normalized) return null;

      setSong(normalized);

      return normalized;
    },
    [normalizeSong],
  );

  /*
   * Sync React state with the ref.
   */
  const syncQueueState = useCallback(() => {
    setQueue([...queueRef.current]);
  }, []);

  /*
   * Check if a song is already in our local queue.
   */
  const queueHasSong = useCallback((videoId) => {
    return queueRef.current.some(
      (item) => item.videoId === videoId,
    );
  }, []);

 
  // PROGRESS TIMER
 

  const stopProgressTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    const player = playerRef.current;

    if (!player) return;

    const current = player.getCurrentTime?.() || 0;
    const total = player.getDuration?.() || 0;

    setProgress(current);
    setDuration(total);
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();

    updateProgress();

    timerRef.current = setInterval(() => {
      updateProgress();
    }, PROGRESS_INTERVAL);
  }, [stopProgressTimer, updateProgress]);

 
  // LOAD SONG
 

  const loadSongIntoPlayer = useCallback(
    (songData, autoplay = true) => {
      const normalized = normalizeSong(songData);

      if (!normalized) return;

      setSong(normalized);

      setProgress(0);
      setDuration(0);

      const player = playerRef.current;

      if (!player) return;

      if (autoplay) {
        player.loadVideoById(normalized.videoId);
      } else {
        player.cueVideoById(normalized.videoId);
      }
    },
    [normalizeSong],
  );

 
  // PREFETCH NEXT SONGS
 

  /*
   * Make sure we have 6 songs AFTER the current song.
   *
   * queue:
   *
   * [previous x3, current, next x6]
   */
  const prefetchQueue = useCallback(async () => {
    if (isPrefetchingRef.current) return;

    isPrefetchingRef.current = true;

    try {
      while (queueRef.current.length < QUEUE_SIZE) {
        const requestId = ++requestIdRef.current;

        const response = await fetch(`${API_BASE}/next`);

        if (!response.ok) {
          throw new Error("Failed to fetch next song");
        }

        const data = await response.json();

        const normalized = normalizeSong(data);

        if (!normalized) break;

        /*
         * Ignore duplicates.
         *
         * This is especially important if the backend returns
         * the current song again.
         *
         * IMPORTANT: if the backend gives us back a song we
         * already have (e.g. the playlist ran out and it's
         * repeating from the top, or it's echoing the current
         * song), stop here instead of looping forever. Without
         * this the while loop never reaches QUEUE_SIZE and spins
         * hitting /next indefinitely.
         */
        if (!queueHasSong(normalized.videoId)) {
          queueRef.current.push(normalized);
          syncQueueState();
        } else {
          break;
        }

        /*
         * A newer operation happened.
         * Stop this prefetch operation.
         */
        if (requestId !== requestIdRef.current) {
          break;
        }
      }
    } catch (err) {
      console.error("Failed to prefetch queue:", err);
    } finally {
      isPrefetchingRef.current = false;
    }
  }, [
    normalizeSong,
    queueHasSong,
    syncQueueState,
  ]);

 
  // INITIAL LOAD
 

  useEffect(() => {
    let cancelled = false;

    const loadInitialSong = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/current`);

        if (!response.ok) {
          throw new Error("Failed to load current song");
        }

        const data = await response.json();

        if (cancelled) return;

        const normalized = setCurrentSong(data);

        if (!normalized) {
          setError("No songs available in playlist");
          return;
        }

        /*
         * IMPORTANT:
         *
         * Start the queue with:
         *
         * [current]
         *
         * Prefetch will then make it:
         *
         * [current, next1, next2, ..., next6]
         *
         * Previous slots will be filled as the user moves forward.
         */
        queueRef.current = [normalized];

        syncQueueState();

        if (playerReadyRef.current && playerRef.current) {
          playerRef.current.cueVideoById(normalized.videoId);
        }

        prefetchQueue();
      } catch (err) {
        if (!cancelled) {
          console.error("Playlist error:", err);
          setError("Unable to load playlist");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitialSong();

    return () => {
      cancelled = true;
    };
  }, [
    setCurrentSong,
    prefetchQueue,
    syncQueueState,
  ]);

 
  // CLEANUP
 

  useEffect(() => {
    return () => {
      stopProgressTimer();
    };
  }, [stopProgressTimer]);

 
  // YOUTUBE READY
 

  const onReady = useCallback(
    (event) => {
      const player = event.target;

      playerRef.current = player;
      playerReadyRef.current = true;

      player.setVolume(volume);

      if (song?.videoId) {
        player.cueVideoById(song.videoId);
      }
    },
    [volume, song],
  );

 
  // PLAY / PAUSE
 

  const togglePlay = useCallback(() => {
    const player = playerRef.current;

    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying]);

 
  // NEXT SONG
 

  const nextSong = useCallback(() => {
    /*
     * We need:
     *
     * [P3, P2, P1, CURRENT, N1, N2, N3, N4, N5, N6]
     *
     * After next:
     *
     * [P2, P1, CURRENT, N1, N2, N3, N4, N5, N6, N7]
     *
     * Therefore simply remove index 0.
     */

    if (queueRef.current.length === 0) {
      /*
       * Emergency fallback.
       */
      fetch(`${API_BASE}/next`)
        .then((res) => res.json())
        .then((data) => {
          const normalized = normalizeSong(data);

          if (!normalized) return;

          queueRef.current = [normalized];

          syncQueueState();

          loadSongIntoPlayer(normalized, true);

          prefetchQueue();
        })
        .catch((err) => {
          console.error("Failed to load next song:", err);
        });

      return;
    }

    /*
     * Remove the oldest song.
     */
    queueRef.current.shift();

    /*
     * The new current song is always index 3,
     * unless we don't have 3 previous songs yet.
     */
    const newCurrent =
      queueRef.current[PREVIOUS_COUNT];

    /*
     * FIX: previously this fell back to
     * queueRef.current[Math.min(PREVIOUS_COUNT, length - 1)],
     * which — right after the shift() above — is always the
     * LAST item in the array. When no next song was buffered
     * yet, that last item is the song that was just playing,
     * so it reloaded itself and looped forever once you hit
     * the end of the playlist.
     *
     * Instead: if there's no buffered next song, go fetch one
     * directly and bail out of this call. Never fall back to
     * replaying the current/previous song.
     */
    if (!newCurrent) {
      fetch(`${API_BASE}/next`)
        .then((res) => res.json())
        .then((data) => {
          const normalized = normalizeSong(data);

          if (!normalized) return;

          queueRef.current.push(normalized);

          syncQueueState();

          loadSongIntoPlayer(normalized, true);

          prefetchQueue();
        })
        .catch((err) => {
          console.error("Failed to load next song:", err);
        });

      syncQueueState();

      return;
    }

    /*
     * Load immediately from memory.
     */
    loadSongIntoPlayer(newCurrent, true);

    syncQueueState();

    /*
     * Fill the queue back to 10.
     */
    prefetchQueue();
  }, [
    normalizeSong,
    loadSongIntoPlayer,
    syncQueueState,
    prefetchQueue,
  ]);

 
  // PREVIOUS SONG
 

  const previousSong = useCallback(() => {
    /*
     * DO NOT call /previous anymore.
     *
     * Previous songs are already stored locally.
     */

    if (queueRef.current.length <= 1) {
      console.warn("No previous song available");
      return;
    }

    /*
     * Current index should normally be 3.
     *
     * Example:
     *
     * [P3, P2, P1, CURRENT, N1, N2, N3, N4, N5, N6]
     *
     * We want P1.
     */

    const currentIndex = Math.min(
      PREVIOUS_COUNT,
      queueRef.current.length - 1,
    );

    const previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      return;
    }

    const previous = queueRef.current[previousIndex];

    if (!previous) return;

    /*
     * Move the previous song to CURRENT position.
     *
     * Example:
     *
     * BEFORE:
     * [P3, P2, P1, CURRENT, N1, N2, N3, N4, N5, N6]
     *
     * AFTER:
     * [P2, P1, CURRENT, N1, N2, N3, N4, N5, N6]
     *
     * But we need the previous song to become the
     * current song at index 3.
     *
     * So instead of simply shifting the array, we
     * rotate the window around the previous position.
     */

    /*
     * Remove everything from the previous song onward
     * and rebuild the window.
     *
     * Previous songs remain before current.
     */

    const previousSongs = queueRef.current.slice(
      0,
      previousIndex,
    );

    const currentAndNextSongs = queueRef.current.slice(
      previousIndex,
    );

    /*
     * currentAndNextSongs[0] is the song we want to play.
     */

    const newCurrent = currentAndNextSongs[0];

    /*
     * Keep previous songs + new current + next songs.
     *
     * We don't need to ask the server for previous.
     */
    queueRef.current = [
      ...previousSongs,
      newCurrent,
      ...currentAndNextSongs.slice(1),
    ];

    /*
     * If there are fewer than 3 previous songs, that's fine.
     * We cannot invent history that wasn't played.
     */

    loadSongIntoPlayer(newCurrent, true);

    syncQueueState();

    /*
     * Do NOT prefetch here.
     *
     * Going previous doesn't consume a next song.
     * The existing future queue is still valid.
     */
  }, [
    loadSongIntoPlayer,
    syncQueueState,
  ]);

 
  // CHANGE PROGRESS
 

  const changeProgress = useCallback((event) => {
    const newTime = Number(event.target.value);

    setProgress(newTime);

    playerRef.current?.seekTo(newTime, true);
  }, []);

 
  // VOLUME
 

  const changeVolume = useCallback((event) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);

    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }

    playerRef.current?.setVolume(newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);

      playerRef.current?.setVolume(0);
    } else {
      const restoredVolume = previousVolume || 70;

      setVolume(restoredVolume);

      playerRef.current?.setVolume(restoredVolume);
    }
  }, [volume, previousVolume]);

 
  // SHUFFLE
 

  const toggleShuffle = useCallback(async () => {
    const newValue = !isShuffled;

    try {
      const response = await fetch(`${API_BASE}/shuffle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle shuffle");
      }

      const data = await response.json();

      const normalized = normalizeSong(data);

      setIsShuffled(newValue);

      /*
       * Shuffle changes the playlist order.
       *
       * Therefore old future queue is no longer reliable.
       */
      queueRef.current = [];

      syncQueueState();

      if (normalized) {
        queueRef.current = [normalized];

        loadSongIntoPlayer(normalized, true);

        syncQueueState();
      }

      prefetchQueue();
    } catch (err) {
      console.error("Failed to toggle shuffle:", err);
    }
  }, [
    isShuffled,
    normalizeSong,
    loadSongIntoPlayer,
    syncQueueState,
    prefetchQueue,
  ]);

 
  // REPEAT
 

  const toggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev);
  }, []);

 
  // YOUTUBE STATE CHANGE
 

  const onStateChange = useCallback(
    (event) => {
      const state = event.data;

      // PLAYING
      if (state === 1) {
        setIsPlaying(true);
        startProgressTimer();
      }

      // PAUSED
      if (state === 2) {
        setIsPlaying(false);
        stopProgressTimer();
        updateProgress();
      }

      // ENDED
      if (state === 0) {
        setIsPlaying(false);

        stopProgressTimer();

        updateProgress();

        // Repeat current song
        if (isRepeating) {
          playerRef.current?.seekTo(0, true);
          playerRef.current?.playVideo();

          return;
        }

        // Automatically move to next song
        nextSong();
      }

      // CUED
      if (state === 5) {
        updateProgress();
      }
    },
    [
      isRepeating,
      nextSong,
      startProgressTimer,
      stopProgressTimer,
      updateProgress,
    ],
  );

 
  // RETURN
 

  return {
    // Loading
    isLoading,
    error,

    // Current song
    song,

    // Queue
    queue,

    // Playback
    isPlaying,
    progress,
    duration,

    // Audio
    volume,

    // Modes
    isShuffled,
    isRepeating,

    // YouTube
    onReady,
    onStateChange,

    // Controls
    togglePlay,
    previousSong,
    nextSong,

    // Progress / volume
    changeProgress,
    changeVolume,
    toggleMute,

    // Modes
    toggleShuffle,
    toggleRepeat,
  }
}