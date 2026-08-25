const API_BASE = "https://hgrlgkhigmomhcxpnerj.supabase.co/auth/v1/callback"; // إذا كان الـAPI على نطاق مختلف: "https://api.example.com"

const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showRegister() {
  clearMessages();
  loginBox.classList.add("hidden");
  registerBox.classList.remove("hidden");
}

function showLogin() {
  clearMessages();
  registerBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
}

document.getElementById("showRegisterButton").addEventListener("click", showRegister);
document.getElementById("showLoginButton").addEventListener("click", showLogin);

document.querySelectorAll("[data-password]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.password);
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.textContent = visible ? "إظهار" : "إخفاء";
  });
});

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let data = {};
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    throw new Error(data.message || "حدث خطأ غير متوقع");
  }
  return data;
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = loginForm.querySelector(".main-btn");
  setLoading(button, true);

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value,
        remember: document.getElementById("rememberMe").checked
      })
    });

    showMessage("loginMessage", data.message || "تم تسجيل الدخول بنجاح", "success");

    // عدّل المسار حسب موقع الصفحة الرئيسية في مشروعك.
    if (data.user) {
      window.location.href = data.redirect || "/account.html";
    }
  } catch (error) {
    showMessage("loginMessage", error.message, "error");
  } finally {
    setLoading(button, false);
  }
});

registerForm.addEventListener("submit", async event => {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (name.length < 2) {
    showMessage("registerMessage", "اكتب الاسم بشكل صحيح", "error");
    return;
  }
  if (password.length < 8) {
    showMessage("registerMessage", "كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error");
    return;
  }
  if (password !== confirm) {
    showMessage("registerMessage", "كلمتا المرور غير متطابقتين", "error");
    return;
  }

  const button = registerForm.querySelector(".main-btn");
  setLoading(button, true);

  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    showMessage("registerMessage", data.message || "تم إنشاء الحساب بنجاح", "success");
    setTimeout(showLogin, 1000);
  } catch (error) {
    showMessage("registerMessage", error.message, "error");
  } finally {
    setLoading(button, false);
  }
});

async function forgotPassword() {
  const email = document.getElementById("loginEmail").value.trim();

  if (!email) {
    showMessage("loginMessage", "اكتب بريدك الإلكتروني أولاً", "error");
    return;
  }

  try {
    const data = await api("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    showMessage("loginMessage", data.message, "success");
  } catch (error) {
    showMessage("loginMessage", error.message, "error");
  }
}

document.getElementById("forgotButton").addEventListener("click", forgotPassword);

function googleLogin() {
  // يتطلب إعداد Google OAuth في الخادم.
  window.location.href = `${API_BASE}/api/auth/google`;
}

document.getElementById("googleLoginButton").addEventListener("click", googleLogin);
document.getElementById("googleRegisterButton").addEventListener("click", googleLogin);

function showMessage(id, text, type = "") {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `message ${type}`;
}

function clearMessages() {
  document.querySelectorAll(".message").forEach(el => {
    el.textContent = "";
    el.className = "message";
  });
}

function setLoading(button, loading) {
  button.disabled = loading;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "جارٍ التنفيذ...";
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
  }
}
