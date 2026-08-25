const form = document.getElementById("resetForm");
const message = document.getElementById("resetMessage");
const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
let supabaseConfig;

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function setLoading(button, loading) {
  button.disabled = loading;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = "جارٍ الحفظ...";
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

async function loadConfig() {
  const response = await fetch("/api/auth/supabase-config", { credentials: "same-origin" });
  const data = await response.json();
  if (!response.ok || !data.url || !data.anonKey) throw new Error("إعدادات الاستعادة غير متاحة حالياً.");
  return data;
}

document.querySelectorAll("[data-password]").forEach(button => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.password);
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    button.textContent = visible ? "إظهار" : "إخفاء";
  });
});

(async () => {
  if (!accessToken) {
    showMessage("رابط الاستعادة غير صالح أو منتهي الصلاحية.", "error");
    form.querySelector("button[type=submit]").disabled = true;
    return;
  }
  try {
    supabaseConfig = await loadConfig();
  } catch (error) {
    showMessage(error.message, "error");
    form.querySelector("button[type=submit]").disabled = true;
  }
})();

form.addEventListener("submit", async event => {
  event.preventDefault();
  const password = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmNewPassword").value;
  const button = form.querySelector("button[type=submit]");

  if (password.length < 8) return showMessage("كلمة المرور يجب أن تكون 8 أحرف على الأقل.", "error");
  if (password !== confirm) return showMessage("كلمتا المرور غير متطابقتين.", "error");
  if (!supabaseConfig || !accessToken) return showMessage("انتهت صلاحية رابط الاستعادة. اطلب رابطاً جديداً.", "error");

  setLoading(button, true);
  showMessage("");
  try {
    const response = await fetch(`${supabaseConfig.url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error("تعذر حفظ كلمة المرور. ربما انتهت صلاحية الرابط.");
    showMessage("تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بأمان.", "success");
    form.reset();
    button.textContent = "تم الحفظ";
    setTimeout(() => { window.location.href = "login.html"; }, 1800);
  } catch (error) {
    showMessage(error.message || "حدث خطأ غير متوقع.", "error");
    setLoading(button, false);
  }
});
