"use client";

import { useEffect, useRef, useState } from "react";

type Song = {
  name: string;
  artist: string;
  cover: string;
  audio: string;
};

type RadioStation = {
  stationuuid: string;
  name: string;
  url_resolved: string;
  favicon?: string;
  language?: string;
  country?: string;
  codec?: string;
  bitrate?: number;
};

const localSongs: Song[] = [
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
  const radioAudioRef = useRef<HTMLAudioElement | null>(null);

  const [songs, setSongs] = useState<Song[]>(localSongs);
  const [currentSong, setCurrentSong] = useState(0);
  const [search, setSearch] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [lastVolume, setLastVolume] = useState(1);

  const [apiLoading, setApiLoading] = useState(true);

  // Radio
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [radioLoading, setRadioLoading] = useState(true);
  const [radioPlaying, setRadioPlaying] = useState<string | null>(null);

  const song = songs[currentSong] ?? localSongs[0];

  const filteredSongs = songs.filter((item) =>
    `${item.name} ${item.artist}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Load songs from Jamendo API
  useEffect(() => {
    const loadJamendoSongs = async () => {
      try {
        setApiLoading(true);

        const response = await fetch("/api/jamendo");

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();

        if (!Array.isArray(data.results) || data.results.length === 0) {
          throw new Error("No songs received");
        }

        const apiSongs: Song[] = data.results
          .filter(
            (item: {
              name?: string;
              artist_name?: string;
              album_image?: string;
              audio?: string;
            }) => item.audio
          )
          .map(
            (item: {
              name?: string;
              artist_name?: string;
              album_image?: string;
              audio?: string;
            }) => ({
              name: item.name || "Unknown Song",
              artist: item.artist_name || "Unknown Artist",
              cover: item.album_image || "/covers/1.jpg",
              audio: item.audio || "",
            })
          );

        if (apiSongs.length > 0) {
          setSongs(apiSongs);
          setCurrentSong(0);
        }
      } catch (error) {
        console.error("Jamendo API error:", error);
      } finally {
        setApiLoading(false);
      }
    };

    loadJamendoSongs();
  }, []);

  // Load India Radio stations
  useEffect(() => {
    const loadRadioStations = async () => {
      try {
        setRadioLoading(true);

        const response = await fetch("/api/radio");

        if (!response.ok) {
          throw new Error("Radio API request failed");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRadioStations(data);
        } else {
          setRadioStations([]);
        }
      } catch (error) {
        console.error("Radio API error:", error);
        setRadioStations([]);
      } finally {
        setRadioLoading(false);
      }
    };

    loadRadioStations();
  }, []);

  // Load current song
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !song?.audio) return;

    audio.src = song.audio;
    audio.volume = volume;
    audio.load();

    setCurrentTime(0);
    setDuration(0);
  }, [currentSong, songs]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = volume;
    }

    const radioAudio = radioAudioRef.current;

    if (radioAudio) {
      radioAudio.volume = volume;
    }
  }, [volume]);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat, isShuffle, currentSong, songs]);

  // Keyboard controls
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
  }, [isPlaying, currentSong, isShuffle, volume, songs]);

  // Play normal song
  const playSong = async (index: number) => {
    const audio = audioRef.current;

    if (!audio || !songs[index]) return;

    // Stop radio
    const radioAudio = radioAudioRef.current;

    if (radioAudio) {
      radioAudio.pause();
      radioAudio.currentTime = 0;
    }

    setRadioPlaying(null);

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

  // Play / pause normal song
  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !song?.audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Stop radio
      const radioAudio = radioAudioRef.current;

      if (radioAudio) {
        radioAudio.pause();
        radioAudio.currentTime = 0;
      }

      setRadioPlaying(null);

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const playNext = () => {
    if (songs.length === 0) return;

    let nextIndex: number;

    if (isShuffle && songs.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSong);
    } else {
      nextIndex = (currentSong + 1) % songs.length;
    }

    const audio = audioRef.current;

    setCurrentSong(nextIndex);

    if (audio && songs[nextIndex]) {
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

    if (!audio || songs.length === 0) return;

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

    const radioAudio = radioAudioRef.current;

    if (radioAudio) {
      radioAudio.pause();
      radioAudio.currentTime = 0;
    }

    setCurrentSong(0);
    setIsPlaying(false);
    setRadioPlaying(null);
    setIsShuffle(false);
    setIsRepeat(false);
    setCurrentTime(0);
  };
  // Play radio station
  const playRadio = async (station: RadioStation) => {
    const radioAudio = radioAudioRef.current;

    if (!radioAudio || !station.url_resolved) return;

    if (radioPlaying === station.stationuuid) {
      radioAudio.pause();
      setRadioPlaying(null);
      return;
    }

    const audio = audioRef.current;

    if (audio) {
      audio.pause();
    }

    setIsPlaying(false);

    radioAudio.pause();
    radioAudio.src = station.url_resolved;
    radioAudio.volume = volume;

    try {
      await radioAudio.play();
      setRadioPlaying(station.stationuuid);
    } catch (error) {
      console.error("Radio playback error:", error);
      setRadioPlaying(null);
    }
  };

  const progress =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <main>
      <audio ref={audioRef} preload="metadata" />
      <audio ref={radioAudioRef} preload="none" />

      <header className="navbar">
        <a href="#home" className="brand">
          <img src="/logo.png" alt="Spotify Logo" />
          <span>Spotify</span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#radio">Radio</a>
          <a href="#about">About</a>
        </nav>

        <div className="status">
          <span className="status-dot" />
          <span>
            {apiLoading
              ? "Loading Music"
              : radioPlaying
              ? "Radio Playing"
              : isPlaying
              ? "Now Playing"
              : "Music Player"}
          </span>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">YOUR PERSONAL MUSIC SPACE</p>

          <h1>
            Best of <span>NCS</span>
          </h1>

          <p className="hero-text">
            Music powered by Jamendo API + Indian Radio.
          </p>
        </div>
      </section>

      <section className="music-layout">
        <div className="song-list">
          <div className="section-heading">
            <div>
              <h2>Your Songs</h2>
              <p>{filteredSongs.length} songs</p>
            </div>

            <button
              type="button"
              className="clear-button"
              onClick={resetPlayer}
            >
              Reset
            </button>
          </div>

          {/* Search */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search songs or artists..."
              aria-label="Search songs"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          <div className="song-item-container">
            {filteredSongs.map((item) => {
              const actualIndex = songs.indexOf(item);

              return (
                <article
                  className={`songItem ${
                    actualIndex === currentSong && isPlaying
                      ? "active"
                      : ""
                  }`}
                  key={`${item.name}-${actualIndex}`}
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
                    {actualIndex === currentSong
                      ? formatTime(duration)
                      : "00:00"}
                  </span>

                  <button
                    type="button"
                    className="songItemPlay"
                    aria-label={
                      actualIndex === currentSong && isPlaying
                        ? `Pause ${item.name}`
                        : `Play ${item.name}`
                    }
                    onClick={() => {
                      if (
                        actualIndex === currentSong &&
                        isPlaying
                      ) {
                        togglePlay();
                      } else {
                        playSong(actualIndex);
                      }
                    }}
                  >
                    {actualIndex === currentSong && isPlaying
                      ? "❚❚"
                      : "▶"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="music-banner">
          <div className="banner-overlay">
            <img
              src="/playing.gif"
              alt="Music animation"
              className="banner-gif"
            />

            <p>
              {radioPlaying ? "RADIO PLAYING" : "NOW PLAYING"}
            </p>

            <h2>
              {radioPlaying
                ? radioStations.find(
                    (station) =>
                      station.stationuuid === radioPlaying
                  )?.name || "Indian Radio"
                : song.name}
            </h2>

            <span>
              {radioPlaying
                ? "Live Indian Radio"
                : song.artist}
            </span>
          </div>
        </aside>
      </section>

      {/* INDIA RADIO */}
      <section
        id="radio"
        style={{
          padding: "60px 20px 120px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <p className="eyebrow">LIVE STREAMING</p>

          <h2
            style={{
              fontSize: "32px",
              margin: "5px 0",
            }}
          >
            📻 Indian Radio
          </h2>

          <p style={{ opacity: 0.7 }}>
            Listen to live radio stations from India.
          </p>
        </div>

        {radioLoading ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            Loading Indian radio stations...
          </div>
        ) : radioStations.length === 0 ? (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            No radio stations found.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {radioStations.map((station) => (
              <article
                key={station.stationuuid}
                style={{
                  padding: "18px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.06)",
                  border:
                    radioPlaying === station.stationuuid
                      ? "1px solid rgba(255,255,255,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <img
                  src={
                    station.favicon ||
                    "/covers/1.jpg"
                  }
                  alt=""
                  width={55}
                  height={55}
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    background: "#222",
                  }}
                  onError={(event) => {
                    event.currentTarget.src =
                      "/covers/1.jpg";
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {station.name}
                  </strong>

                  <small
                    style={{
                      display: "block",
                      opacity: 0.6,
                      marginTop: "4px",
                    }}
                  >
                    {station.language || "India"}
                    {station.codec
                      ? ` • ${station.codec}`
                      : ""}
                  </small>

                  <button
                    type="button"
                    onClick={() => playRadio(station)}
                    style={{
                      marginTop: "10px",
                      padding: "7px 14px",
                      borderRadius: "20px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        radioPlaying ===
                        station.stationuuid
                          ? "rgba(255,255,255,0.2)"
                          : "white",
                      color:
                        radioPlaying ===
                        station.stationuuid
                          ? "white"
                          : "black",
                      fontWeight: 600,
                    }}
                  >
                    {radioPlaying === station.stationuuid
                      ? "❚❚ Stop"
                      : "▶ Play"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="about" id="about">
        <p className="eyebrow">ABOUT PROJECT</p>

        <h2>Simple. Fast. Music.</h2>

        <p>
          A Next.js music player connected to the Jamendo API
          and Indian live radio stations.
          Search, playback, progress, volume, playlist and
          radio controls are handled by the application.
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
              <strong>
                {radioPlaying
                  ? radioStations.find(
                      (station) =>
                        station.stationuuid === radioPlaying
                    )?.name || "Indian Radio"
                  : song.name}
              </strong>

              <small>
                {radioPlaying
                  ? "Live Radio"
                  : isPlaying
                  ? "Now Playing"
                  : "Ready to play"}
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
              aria-label={
                volume === 0 ? "Unmute" : "Mute"
              }
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