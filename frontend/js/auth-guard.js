const AUTH_GUARD_API   = "http://localhost:3000/get-profile";
const AUTH_GUARD_LOGIN = "http://localhost:5173/login.html";

(function blockRender() {
    const style = document.createElement("style");
    style.id = "__auth_guard_style";
    style.textContent = "body { visibility: hidden !important; }";
    (document.head || document.documentElement).appendChild(style);
})();

(function checkAuth() {
    function revealPage() {
        const style = document.getElementById("__auth_guard_style");
        if (style) style.remove();
    }

    function redirectToLogin() {
        // Prevent redirect loop if already on login page
        if (window.location.href.includes("login")) {
            revealPage();
            return;
        }
        window.location.replace(AUTH_GUARD_LOGIN);
    }

    function isLoginPage() {
        return window.location.href.includes("login");
    }

    if (isLoginPage()) {
        revealPage();
        return;
    }

    fetch(AUTH_GUARD_API, {
        method: "GET",
        credentials: "include"
    })
    .then(function (response) {
        if (!response.ok) {
            redirectToLogin();
            return null;
        }
        return response.json();
    })
    .then(function (data) {
        if (!data) return; // already redirecting
        if (!data.success) {
            redirectToLogin();
        } else {
            revealPage();
        }
    })
    .catch(function (err) {
        // ✅ Log the real error instead of silently redirecting
        console.error("Auth guard fetch failed:", err.message);
        // Only redirect if it's genuinely an auth issue, not a network crash
        if (err.message !== "Failed to fetch") {
            redirectToLogin();
        } else {
            // Backend is down — reveal page and warn instead of redirect loop
            console.warn("Backend unreachable — skipping auth guard");
            revealPage();
        }
    });
})();