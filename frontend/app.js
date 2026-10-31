const API = window.APP_CONFIG.API_BASE_URL;

async function apiRequest(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "حدث خطأ في الاتصال");
  }

  return data;
}

function showMessage(message) {
  alert(message);
}

// Discord login
function discordLogin() {
  window.location.href = API + "/api/auth/discord";
}

// Connect buttons
document.getElementById("loginBtn")?.addEventListener("click", discordLogin);

document.getElementById("dashboardLogin")?.addEventListener("click", async () => {
  try {
    const result = await apiRequest("/api/auth/me");

    if (!result.user) {
      discordLogin();
      return;
    }

    await loadPlayer();
  } catch (error) {
    discordLogin();
  }
});

// Load player information
async function loadPlayer() {
  const container = document.getElementById("playerInfo");

  try {
    const result = await apiRequest("/api/player");

    if (!result.player) {
      container.textContent = "اربط حساب SA-MP أولاً.";
      return;
    }

    container.innerHTML = `
      <div class="card">
        <h3>${escapeHTML(result.player.username || "Player")}</h3>
        <p>المستوى: ${escapeHTML(result.player.level ?? "-")}</p>
        <p>الوظيفة: ${escapeHTML(result.player.job ?? "-")}</p>
        <p>الفصيل: ${escapeHTML(result.player.faction ?? "-")}</p>
        <p>النقود: ${escapeHTML(result.player.cash ?? "-")}</p>
        <p>البنك: ${escapeHTML(result.player.bank ?? "-")}</p>
      </div>
    `;
  } catch (error) {
    container.textContent = error.message;
  }
}

// Escape values before displaying them
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// Check Discord session on page load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const result = await apiRequest("/api/auth/me");

    if (result.user) {
      document.getElementById("loginBtn").textContent = "متصل بـ Discord";
    }
  } catch (error) {
    console.log("No active session");
  }
});
