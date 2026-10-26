const music = document.getElementById("bgMusic");

document.addEventListener("click", () => {
    const saved = localStorage.getItem("musicVolume");
    if (saved !== null) music.volume = saved / 100;
    music.play();
}, { once: true });

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
    window.location.href = "index.html"; 
});

const profileBtn = document.getElementById("profileBtn");
profileBtn.addEventListener("click", () => {
    window.location.href = "profile.html"; 
});

const rankBtn = document.getElementById("rankBtn");
rankBtn.addEventListener("click", () => {
    window.location.href = "leaderboard.html"; 
});

const settingsBtn = document.getElementById("settingsBtn");
settingsBtn.addEventListener("click", () => {
    window.location.href = "settings.html"; 
});

const exitBtn = document.getElementById("exitBtn");
exitBtn.addEventListener("click", async () => {
    await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include"  // ← sends the cookie so backend can clear it
    });
    window.location.href = "login.html";
});



