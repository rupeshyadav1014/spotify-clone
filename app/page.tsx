"use client";

import { useEffect, useRef, useState } from "react";

const songs = [
  {
    name: "Hanumanansh",
    artist: "NCS Release",
    cover: "/covers/1.jpg",
    audio: "/songs/1.mp3",
  },
  {
    name: "Yeh Awarapan",
    artist: "Huma-Huma",
    cover: "/covers/2.jpg",
    audio: "/songs/2.mp3",
  },
  {
    name: "Ishq Kameena 2.0",
    artist: "NCS Release",
    cover: "/covers/3.jpg",
    audio: "/songs/3.mp3",
  },
  {
    name: "Different Heaven & EH!DE",
    artist: "My Heart",
    cover: "/covers/4.jpg",
    audio: "/songs/4.mp3",
  },
  {
    name: "Janji - Heroes Tonight",
    artist: "feat. Johnning",
    cover: "/covers/5.jpg",
    audio: "/songs/5.mp3",
  },
  {
    name: "Rabba - Salam-e-Ishq",
    artist: "Salam-e-Ishq",
    cover: "/covers/6.jpg",
    audio: "/songs/6.mp3",
  },
  {
    name: "Sakhiyaan",
    artist: "Salam-e-Ishq",
    cover: "/covers/7.jpg",
    audio: "/songs/7.mp3",
  },
  {
    name: "Bhula Dena",
    artist: "Salam-e-Ishq",
    cover: "/covers/8.jpg",
    audio: "/songs/8.mp3",
  },
  {
    name: "Tumhari Kasam",
    artist: "Salam-e-Ishq",
    cover: "/covers/9.jpg",
    audio: "/songs/9.mp3",
  },
  {
    name: "Na Jaana",
    artist: "Salam-e-Ishq",
    cover: "/covers/10.jpg",
    audio: "/songs/10.mp3",
  },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);

  const song = songs[currentSong];

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.src = song.audio;
    audio.volume = volume;
    audio.load();

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [isRepeat, isShuffle, currentSong]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "BUTTON" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }

      if (event.code === "ArrowRight") {
        playNext();
      }

      if (event.code === "ArrowLeft") {
        playPrevious();
      }

      if (event.key.toLowerCase() === "m") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [isPlaying, currentSong, isShuffle, volume]);

  const playSong = async (index: number) => {
    const audio = audioRef.current;

    if (!audio) return;

    if (index !== currentSong) {
      setCurrentSong(index);

      audio.src = songs[index].audio;
      audio.volume = volume;
      audio.load();
      setCurrentTime(0);

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }

      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src) {
        audio.src = song.audio;
        audio.load();
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const playNext = () => {
    let nextIndex: number;

    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (songs.length > 1 && nextIndex === currentSong);
    } else {
      nextIndex = (currentSong + 1) % songs.length;
    }

    setCurrentSong(nextIndex);

    const audio = audioRef.current;

    if (audio) {
      audio.src = songs[nextIndex].audio;
      audio.volume = volume;
      audio.load();

      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playPrevious = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const previousIndex =
      (currentSong - 1 + songs.length) % songs.length;

    setCurrentSong(previousIndex);

    audio.src = songs[previousIndex].audio;
    audio.volume = volume;
    audio.load();

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleProgress = (value: number) => {
    const audio = audioRef.current;

    if (!audio || !duration) return;

    const newTime = (value / 100) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolume = (value: number) => {
    setVolume(value);

    if (value > 0) {
      setLastVolume(value);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
    } else {
      setVolume(lastVolume || 1);
    }
  };

  const resetPlayer = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setCurrentSong(0);
    setIsPlaying(false);
    setIsShuffle(false);
    setIsRepeat(false);
    setCurrentTime(0);
  };

  const progress =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <main>
      <audio ref={audioRef} preload="metadata" />

      <header className="navbar">
        <a href="#home" className="brand">
          <img src="/logo.png" alt="Spotify Logo" />
          <span>Spotify</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
        </nav>

        <div className="status">
          <span className="status-dot" />
          <span>{isPlaying ? "Now Playing" : "Music Player"}</span>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">YOUR PERSONAL MUSIC SPACE</p>

          <h1>
            Best of <span>NCS</span>
          </h1>

          <p className="hero-text">
            No Copyright Sounds — listen, control and enjoy your music.
          </p>
        </div>
      </section>

      <section className="music-layout">
        <div className="song-list">
          <div className="section-heading">
            <div>
              <h2>Your Songs</h2>
              <p>{songs.length} songs</p>
            </div>

            <button
              type="button"
              className="clear-button"
              onClick={resetPlayer}
            >
              Reset
            </button>
          </div>

          <div className="song-item-container">
            {songs.map((item, index) => (
              <article
                className={`songItem ${
                  index === currentSong && isPlaying ? "active" : ""
                }`}
                key={item.name}
              >
                <img
                  src={item.cover}
                  alt={`${item.name} cover`}
                  className="song-cover"
                />

                <div className="song-details">
                  <strong className="songName">{item.name}</strong>
                  <small>{item.artist}</small>
                </div>

                <span className="song-duration">
                  {index === currentSong
                    ? formatTime(duration)
                    : "00:00"}
                </span>

                <button
                  type="button"
                  className="songItemPlay"
                  aria-label={
                    index === currentSong && isPlaying
                      ? `Pause ${item.name}`
                      : `Play ${item.name}`
                  }
                  onClick={() => {
                    if (index === currentSong && isPlaying) {
                      togglePlay();
                    } else {
                      playSong(index);
                    }
                  }}
                >
                  {index === currentSong && isPlaying ? "❚❚" : "▶"}
                </button>
              </article>
            ))}
          </div>
        </div>

        <aside className="music-banner">
          <div className="banner-overlay">
            <img
              src="/playing.gif"
              alt="Music animation"
              className="banner-gif"
            />

            <p>NOW PLAYING</p>

            <h2>{song.name}</h2>

            <span>{song.artist}</span>
          </div>
        </aside>
      </section>

      <section className="about" id="about">
        <p className="eyebrow">ABOUT PROJECT</p>

        <h2>Simple. Fast. Music.</h2>

        <p>
          A Next.js music player built with TypeScript and Tailwind CSS. It
          supports playlist controls, progress seeking, volume control and
          automatic next-song playback.
        </p>
      </section>

      <footer className="player">
        <div className="progress-wrapper">
          <span>{formatTime(currentTime)}</span>

          <input
            id="myProgressBar"
            type="range"
            min="0"
            max="100"
            value={progress}
            step="0.1"
            onChange={(event) =>
              handleProgress(Number(event.target.value))
            }
            aria-label="Song progress"
          />

          <span>{formatTime(duration)}</span>
        </div>

        <div className="player-content">
          <div className="current-song">
            <img
              src={song.cover}
              alt={`${song.name} cover`}
            />

            <div className="current-song-text">
              <strong>{song.name}</strong>
              <small>
                {isPlaying ? "Now Playing" : "Ready to play"}
              </small>
            </div>
          </div>

          <div className="controls">
            <button
              type="button"
              className={isShuffle ? "active" : ""}
              aria-label="Shuffle"
              onClick={() => setIsShuffle(!isShuffle)}
            >
              🔀
            </button>

            <button
              type="button"
              aria-label="Previous song"
              onClick={playPrevious}
            >
              ⏮
            </button>

            <button
              type="button"
              className="main-play"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <button
              type="button"
              aria-label="Next song"
              onClick={playNext}
            >
              ⏭
            </button>

            <button
              type="button"
              className={isRepeat ? "active" : ""}
              aria-label="Repeat"
              onClick={() => setIsRepeat(!isRepeat)}
            >
              🔁
            </button>
          </div>

          <div className="volume-box">
            <button
              id="muteButton"
              type="button"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              onClick={toggleMute}
            >
              {volume === 0 ? "🔇" : "🔊"}
            </button>

            <input
              id="volumeControl"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) =>
                handleVolume(Number(event.target.value))
              }
              aria-label="Volume"
            />
          </div>
        </div>
      </footer>
    </main>
  );
}