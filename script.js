console.log("🎵 Spotify Clone Loaded");


// ==================================================
// 1. GET HTML ELEMENTS
// ==================================================

const audio = new Audio();

const masterPlay = document.getElementById("masterPlay");
const previous = document.getElementById("previous");
const next = document.getElementById("next");

const progressBar = document.getElementById("myProgressBar");
const volumeControl = document.getElementById("volumeControl");
const muteButton = document.getElementById("muteButton");

const masterSongName = document.getElementById("masterSongName");
const currentCover = document.getElementById("currentCover");
const playerStatus = document.getElementById("playerStatus");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const bannerSongName = document.getElementById("bannerSongName");

const shuffleButton = document.getElementById("shuffle");
const repeatButton = document.getElementById("repeat");

const resetPlayer = document.getElementById("resetPlayer");

const songButtons = document.querySelectorAll(".songItemPlay");
const songItems = document.querySelectorAll(".songItem");
const songDurations = document.querySelectorAll(".song-duration");


// ==================================================
// 2. SONG DATA
// ==================================================

const songs = [

    {
        name: "Warriyo - Mortals",
        artist: "NCS Release",
        file: "songs/1.mp3",
        cover: "covers/1.jpg"
    },

    {
        name: "Cielo - Huma-Huma",
        artist: "Huma-Huma",
        file: "songs/2.mp3",
        cover: "covers/2.jpg"
    },

    {
        name: "DEAF KEV - Invincible",
        artist: "NCS Release",
        file: "songs/3.mp3",
        cover: "covers/3.jpg"
    },

    {
        name: "Different Heaven & EH!DE",
        artist: "My Heart",
        file: "songs/4.mp3",
        cover: "covers/4.jpg"
    },

    {
        name: "Janji - Heroes Tonight",
        artist: "feat. Johnning",
        file: "songs/5.mp3",
        cover: "covers/5.jpg"
    },

    {
        name: "Rabba - Salam-e-Ishq",
        artist: "Salam-e-Ishq",
        file: "songs/6.mp3",
        cover: "covers/6.jpg"
    },

    {
        name: "Sakhiyaan",
        artist: "Salam-e-Ishq",
        file: "songs/7.mp3",
        cover: "covers/7.jpg"
    },

    {
        name: "Bhula Dena",
        artist: "Salam-e-Ishq",
        file: "songs/8.mp3",
        cover: "covers/8.jpg"
    },

    {
        name: "Tumhari Kasam",
        artist: "Salam-e-Ishq",
        file: "songs/9.mp3",
        cover: "covers/9.jpg"
    },

    {
        name: "Na Jaana",
        artist: "Salam-e-Ishq",
        file: "songs/10.mp3",
        cover: "covers/10.jpg"
    }

];


// ==================================================
// 3. PLAYER VARIABLES
// ==================================================

let currentSong = 0;

let isShuffle = false;

let isRepeat = false;

let lastVolume = 1;


// ==================================================
// 4. INITIAL AUDIO SETTINGS
// ==================================================

audio.volume = 1;

audio.preload = "metadata";


// ==================================================
// 5. FORMAT TIME
// ==================================================

function formatTime(seconds) {

    if (!seconds || isNaN(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
}


// ==================================================
// 6. LOAD SONG
// ==================================================

function loadSong(index) {

    // Safety check
    if (index < 0 || index >= songs.length) {
        return;
    }

    currentSong = index;

    const song = songs[currentSong];

    // Set audio source
    audio.src = song.file;

    // Update player information
    masterSongName.innerText = song.name;

    bannerSongName.innerText = song.name;

    currentCover.src = song.cover;

    playerStatus.innerText = song.artist;

    // Reset progress
    progressBar.value = 0;

    currentTime.innerText = "0:00";

    duration.innerText = "0:00";

    // Update selected song
    updateActiveSong();

    console.log("Loaded:", song.file);
}


// ==================================================
// 7. PLAY SONG
// ==================================================

async function playSong(index) {

    loadSong(index);

    try {

        await audio.play();

        masterPlay.innerText = "⏸";

        masterPlay.title = "Pause";

        playerStatus.innerText = "Now Playing";

        updateActiveSong();

        console.log(
            "▶ Playing:",
            songs[currentSong].file
        );

    } catch (error) {

        console.error(
            "❌ Audio Play Error:",
            error
        );

        playerStatus.innerText =
            "Unable to play this song";

    }
}


// ==================================================
// 8. PLAY / PAUSE
// ==================================================

masterPlay.addEventListener("click", async () => {

    try {

        if (audio.paused) {

            await audio.play();

        } else {

            audio.pause();

        }

    } catch (error) {

        console.error(
            "❌ Play Error:",
            error
        );

    }

});


// ==================================================
// 9. AUDIO PLAY EVENT
// ==================================================

audio.addEventListener("play", () => {

    masterPlay.innerText = "⏸";

    masterPlay.title = "Pause";

    playerStatus.innerText = "Now Playing";

    updateActiveSong();

});


// ==================================================
// 10. AUDIO PAUSE EVENT
// ==================================================

audio.addEventListener("pause", () => {

    masterPlay.innerText = "▶";

    masterPlay.title = "Play";

    if (!audio.ended) {

        playerStatus.innerText = "Paused";

    }

    updateActiveSong();

});


// ==================================================
// 11. UPDATE ACTIVE SONG
// ==================================================

function updateActiveSong() {

    songItems.forEach((item, index) => {

        const button =
            item.querySelector(".songItemPlay");

        if (
            index === currentSong &&
            !audio.paused
        ) {

            item.classList.add("active");

            button.innerText = "⏸";

        } else {

            item.classList.remove("active");

            button.innerText = "▶";

        }

    });

}


// ==================================================
// 12. SONG LIST BUTTONS
// ==================================================

songButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const index =
            Number(button.dataset.index);

        // Same song = pause
        if (
            index === currentSong &&
            !audio.paused
        ) {

            audio.pause();

            return;
        }

        // Otherwise play selected song
        playSong(index);

    });

});


// ==================================================
// 13. PROGRESS BAR UPDATE
// ==================================================

audio.addEventListener("timeupdate", () => {

    if (
        audio.duration &&
        !isNaN(audio.duration)
    ) {

        const progress =
            (audio.currentTime /
                audio.duration) * 100;

        progressBar.value = progress;

        currentTime.innerText =
            formatTime(audio.currentTime);

        duration.innerText =
            formatTime(audio.duration);
    }

});


// ==================================================
// 14. SONG LOADED
// ==================================================

audio.addEventListener("loadedmetadata", () => {

    if (!isNaN(audio.duration)) {

        duration.innerText =
            formatTime(audio.duration);

    }

});


// ==================================================
// 15. SEEK SONG
// ==================================================

progressBar.addEventListener("input", () => {

    if (
        audio.duration &&
        !isNaN(audio.duration)
    ) {

        audio.currentTime =
            (progressBar.value / 100) *
            audio.duration;

    }

});


// ==================================================
// 16. LOAD ALL SONG DURATIONS
// ==================================================

songDurations.forEach(
    (durationElement, index) => {

        const tempAudio =
            new Audio(songs[index].file);

        tempAudio.preload = "metadata";

        tempAudio.addEventListener(
            "loadedmetadata",
            () => {

                durationElement.innerText =
                    formatTime(
                        tempAudio.duration
                    );

            }
        );

        tempAudio.addEventListener(
            "error",
            () => {

                durationElement.innerText =
                    "--:--";

            }
        );

    }
);


// ==================================================
// 17. NEXT SONG
// ==================================================

function playNextSong() {

    // SHUFFLE
    if (isShuffle) {

        let randomIndex;

        do {

            randomIndex =
                Math.floor(
                    Math.random() * songs.length
                );

        } while (
            randomIndex === currentSong &&
            songs.length > 1
        );

        currentSong = randomIndex;

    }

    // NORMAL NEXT
    else {

        currentSong++;

        if (
            currentSong >= songs.length
        ) {

            currentSong = 0;

        }

    }

    playSong(currentSong);

}


// Next button
next.addEventListener(
    "click",
    playNextSong
);


// ==================================================
// 18. PREVIOUS SONG
// ==================================================

previous.addEventListener(
    "click",
    () => {

        // If song is already playing
        // for more than 3 seconds,
        // restart it.

        if (audio.currentTime > 3) {

            audio.currentTime = 0;

            return;

        }


        currentSong--;

        if (currentSong < 0) {

            currentSong =
                songs.length - 1;

        }

        playSong(currentSong);

    }
);


// ==================================================
// 19. AUTO NEXT
// ==================================================

audio.addEventListener(
    "ended",
    () => {

        // REPEAT
        if (isRepeat) {

            audio.currentTime = 0;

            audio.play();

            return;

        }

        // NORMAL / SHUFFLE
        playNextSong();

    }
);


// ==================================================
// 20. SHUFFLE
// ==================================================

shuffleButton.addEventListener(
    "click",
    () => {

        isShuffle =
            !isShuffle;

        shuffleButton.classList.toggle(
            "active",
            isShuffle
        );

        console.log(
            "Shuffle:",
            isShuffle
        );

    }
);


// ==================================================
// 21. REPEAT
// ==================================================

repeatButton.addEventListener(
    "click",
    () => {

        isRepeat =
            !isRepeat;

        repeatButton.classList.toggle(
            "active",
            isRepeat
        );

        console.log(
            "Repeat:",
            isRepeat
        );

    }
);


// ==================================================
// 22. VOLUME
// ==================================================

volumeControl.addEventListener(
    "input",
    () => {

        const volume =
            Number(volumeControl.value);

        audio.volume = volume;


        if (volume > 0) {

            lastVolume = volume;

            muteButton.innerText = "🔊";

        } else {

            muteButton.innerText = "🔇";

        }

    }
);


// ==================================================
// 23. MUTE / UNMUTE
// ==================================================

muteButton.addEventListener(
    "click",
    () => {

        if (audio.volume > 0) {

            lastVolume =
                audio.volume;

            audio.volume = 0;

            volumeControl.value = 0;

            muteButton.innerText = "🔇";

        } else {

            audio.volume =
                lastVolume || 1;

            volumeControl.value =
                audio.volume;

            muteButton.innerText = "🔊";

        }

    }
);


// ==================================================
// 24. RESET PLAYER
// ==================================================

resetPlayer.addEventListener(
    "click",
    () => {

        audio.pause();

        currentSong = 0;

        loadSong(0);

        masterPlay.innerText = "▶";

        masterPlay.title = "Play";

        playerStatus.innerText =
            "Ready to play";

        progressBar.value = 0;

        currentTime.innerText =
            "0:00";

        duration.innerText =
            "0:00";

        isShuffle = false;

        isRepeat = false;

        shuffleButton.classList.remove(
            "active"
        );

        repeatButton.classList.remove(
            "active"
        );

        console.log("Player reset");

    }
);


// ==================================================
// 25. KEYBOARD CONTROLS
// ==================================================

document.addEventListener(
    "keydown",
    (event) => {

        // Don't run shortcuts
        // when using range inputs.

        if (
            event.target.tagName ===
            "INPUT"
        ) {

            return;

        }


        // SPACE
        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            masterPlay.click();

        }


        // RIGHT ARROW
        if (
            event.code ===
            "ArrowRight"
        ) {

            playNextSong();

        }


        // LEFT ARROW
        if (
            event.code ===
            "ArrowLeft"
        ) {

            previous.click();

        }


        // M = MUTE
        if (
            event.key.toLowerCase() ===
            "m"
        ) {

            muteButton.click();

        }

    }
);


// ==================================================
// 26. AUDIO ERROR
// ==================================================

audio.addEventListener(
    "error",
    () => {

        console.error(
            "❌ Could not load:",
            songs[currentSong].file
        );

        playerStatus.innerText =
            "Audio file could not be loaded";

    }
);


// ==================================================
// 27. INITIAL SONG
// ==================================================

loadSong(0);


// ==================================================
// 28. READY
// ==================================================

console.log(
    `✅ ${songs.length} songs loaded`
);