const container = document.getElementById("leaderboard");

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

async function loadLeaderboard() {
  try {
    const res = await fetch("http://localhost:3000/leaderboard");
    const data = await res.json();

    if (!data.success) return;

    const players = data.users;

    container.innerHTML = "";

    players.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "lb-row";

      row.style.opacity = "0";
      row.style.transform = "translateY(20px)";

      row.innerHTML = `
        <div class="lb-rank">${i + 1}</div>

        <div class="lb-player">
          <img class="lb-avatar" src="${p.avatar || '/assets/avatars/a1.png'}">
          <div class="lb-info">
            <div class="lb-name">${p.name}</div>
            <div class="lb-sub">Player</div>
          </div>
        </div>

        
         <div class="lb-score">
  ${formatTime(p.highScore)}
</div>
      `;

      container.appendChild(row);

      setTimeout(() => {
        row.style.transition = "all 0.4s ease";
        row.style.opacity = "1";
        row.style.transform = "translateY(0)";
      }, i * 100);
    });

  } catch (err) {
    console.error("Leaderboard error:", err);
  }
}

// 🚀 LOAD DATA
loadLeaderboard();

// 🎮 BUTTON FUNCTIONALITY

// 🔙 Back button
document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "/menu.html";
});


// 👤 View Profile button
document.getElementById("profileBtn").addEventListener("click", () => {
  window.location.href = "/profile.html";

  // 👉 you can later open a profile panel or page
});
const music = document.getElementById("bgMusic");

document.addEventListener("click", () => {
    const saved = localStorage.getItem("musicVolume");
    if (saved !== null) music.volume = saved / 100;
    music.play();
}, { once: true });