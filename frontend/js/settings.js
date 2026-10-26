const music = document.getElementById("bgMusic");

document.addEventListener("click", () => {
    music.play();
}, { once: true });

// ================= LOAD SAVED VALUES =================
const savedMusic = localStorage.getItem("musicVolume");
const savedSound = localStorage.getItem("soundVolume");

const musicSlider = document.getElementById("musicSlider");
const soundSlider = document.getElementById("soundSlider");

// Apply saved values to sliders on load
if (savedMusic !== null) musicSlider.value = savedMusic;
if (savedSound !== null) soundSlider.value = savedSound;

// Apply saved music volume to this page's bgMusic
music.volume = (savedMusic !== null ? savedMusic : musicSlider.value) / 100;

// ================= MUSIC SLIDER =================
musicSlider.addEventListener("input", () => {
    const vol = musicSlider.value / 100;
    music.volume = vol;
    localStorage.setItem("musicVolume", musicSlider.value);
});

// ================= SOUND SLIDER =================
soundSlider.addEventListener("input", () => {
    localStorage.setItem("soundVolume", soundSlider.value);

    // If the game sounds are already loaded (user came from game page), update live
    if (window.sounds) {
        const vol = soundSlider.value / 100;
        window.sounds.jump.volume = vol;
        window.sounds.gem.volume = vol;
        window.sounds.win.volume = vol;
        window.sounds.lose.volume = vol;
        window.sounds.bg.volume = vol;
    }
});

// ================= GO BACK =================
const gobackBtn = document.getElementById("gobackBtn");
gobackBtn.addEventListener("click", () => {
    window.location.href = "menu.html";
});