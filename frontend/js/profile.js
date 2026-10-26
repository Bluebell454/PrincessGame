const music = document.getElementById("bgMusic");

document.addEventListener("click", () => {
    const saved = localStorage.getItem("musicVolume");
    if (saved !== null) music.volume = saved / 100;
    music.play();
}, { once: true });

const playItBtn = document.getElementById("playItBtn");
playItBtn.addEventListener("click", () => {
    window.location.href = "index.html"; 
});

const closeBtn= document.getElementById("closeBtn");
closeBtn.addEventListener("click", () => {
    window.location.href = "menu.html"; 
});

// Load user profile
async function loadProfile() {
    const res = await fetch("http://localhost:3000/get-profile", {
        credentials: "include"
    });

    const data = await res.json();
    if (!data.success) {
        alert("Not logged in!");
        window.location.href = "login.html";
        return;
    }

    const user = data.user;

    // Update username
    document.querySelector(".player-text h2").textContent = user.name;

    // Update high score
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}m ${secs}s`;
    }

    document.querySelector(".stat-box h2").textContent =
        user.highScore ? formatTime(user.highScore) : "No record";

    // Update avatar
    const avatarDiv = document.querySelector(".avatar");
    if (user.avatar) {
        avatarDiv.style.backgroundImage = `url(${user.avatar})`;
        avatarDiv.style.backgroundSize = "cover";
        avatarDiv.style.backgroundPosition = "center";
        avatarDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
    } else {
        avatarDiv.style.backgroundImage = "";
        const initial = user.name.charAt(0).toUpperCase();
        avatarDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        });
        avatarDiv.insertAdjacentText("afterbegin", initial);
    }
} // ✅ closing brace for loadProfile was missing

loadProfile();

// Avatar upload logic
const avatarDiv = document.querySelector(".avatar");
const avatarInput = document.getElementById("avatarUpload");

avatarDiv.addEventListener("click", () => {
    avatarInput.click();
});

avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function () {
        await fetch("http://localhost:3000/upload-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ avatar: reader.result })
        });

        loadProfile();
    };

    reader.readAsDataURL(file);
});