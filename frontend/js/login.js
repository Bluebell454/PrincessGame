// ================= PASSWORD TOGGLE =================
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.style.opacity = "1";
    } else {
        input.type = "password";
        icon.style.opacity = "0.5";
    }
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add("show", "shake");
    setTimeout(() => el.classList.remove("shake"), 300);
}

function showSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.add("show");
}

// ================= RPG POPUP =================
function showRpgPopup(message, type = "info") {
    const popup = document.getElementById("rpgPopup");
    const text = document.getElementById("rpgText");
    text.textContent = message;
    popup.classList.add("show", type);
    createParticleGlow(type);
    setTimeout(() => closeRpgPopup(), 3000);
}

function closeRpgPopup() {
    const popup = document.getElementById("rpgPopup");
    popup.classList.remove("show", "success", "error", "info");
    clearParticles();
}

// ================= PARTICLE GLOW =================
let particleInterval;
function createParticleGlow(type) {
    const popup = document.getElementById("rpgPopup");
    clearParticles();
    const colors = { success: "#98FBCB", error: "#ff4d6d", info: "#ffffff" };
    const popupRect = popup.getBoundingClientRect();
    const color = colors[type] || "#ffffff";
    particleInterval = setInterval(() => {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.background = color;
        particle.style.left = `${Math.random() * popupRect.width}px`;
        particle.style.top = `${Math.random() * popupRect.height}px`;
        popup.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }, 80);
}

function clearParticles() {
    clearInterval(particleInterval);
    document.querySelectorAll(".particle").forEach(p => p.remove());
}

function clearMessages() {
    document.querySelectorAll(".error-msg, .success-msg").forEach(el => {
        el.textContent = "";
        el.classList.remove("show");
    });
}

const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');

signUpBtnLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.add('active');
});

signInBtnLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.remove('active');
});

const music = document.getElementById("bgMusic");
document.addEventListener("click", () => { music.play(); }, { once: true });

// ================= SIGNUP =================
document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const name = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;

    // Client-side password match check
    if (password !== confirmPassword) {
        showError("signupError", "Passwords do not match!");
        showRpgPopup("Passwords do not match!", "error");
        return;
    }

    const res = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!data.success) {
        showError("signupError", data.message);
        showRpgPopup(data.message, "error");
    } else {
        showSuccess("signupSuccess", "Check your email to verify!");
        showRpgPopup("If entered mail is correct, a verification mail has been sent!", "success");
    }
});

// ================= LOGIN =================
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const name = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password })
    });

    const data = await res.json();

    if (!data.success) {
        showError("loginError", data.message);
        showRpgPopup(data.message, "error");
    } else {
        showSuccess("loginSuccess", "Welcome back!");
        showRpgPopup("Login successful!", "success");
        setTimeout(() => { window.location.href = "menu.html"; }, 1500);
    }
});