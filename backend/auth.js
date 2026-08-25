import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { query } from "./db.js";

const PASSWORD_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    emailVerified: user.email_verified,
    createdAt: user.created_at
  };
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const cleanName = String(name || "").trim();
  const cleanEmail = normalizeEmail(email);

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(400).json({ message: "الاسم غير صالح." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: "البريد الإلكتروني غير صالح." });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "كلمة المرور يجب أن تكون بين 8 و128 حرفاً." });
  }

  const existing = await query(
    "SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [cleanEmail]
  );

  if (existing.rowCount) {
    return res.status(409).json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

  const result = await query(
    `INSERT INTO users (name, email, password_hash, provider)
     VALUES ($1, $2, $3, 'local')
     RETURNING id, name, email, provider, email_verified, created_at`,
    [cleanName, cleanEmail, passwordHash]
  );

  return res.status(201).json({
    message: "تم إنشاء الحساب بنجاح.",
    user: publicUser(result.rows[0])
  });
}

export async function login(req, res) {
  const { email, password, remember } = req.body;
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || typeof password !== "string") {
    return res.status(400).json({ message: "أدخل البريد الإلكتروني وكلمة المرور." });
  }

  const result = await query(
    `SELECT id, name, email, password_hash, provider, email_verified, created_at
     FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [cleanEmail]
  );

  if (!result.rowCount || !result.rows[0].password_hash) {
    return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
  }

  const expiresIn = remember ? "30d" : (process.env.JWT_EXPIRES_IN || "7d");

  const token = jwt.sign(
    { sub: user.id, type: "session" },
    process.env.JWT_SECRET,
    { expiresIn }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });

  return res.json({
    message: "تم تسجيل الدخول بنجاح.",
    user: publicUser(user),
    redirect: "/account.html"
  });
}

export async function logout(req, res) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/"
  });
  return res.json({ message: "تم تسجيل الخروج." });
}

export async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: "غير مسجل الدخول." });
  return res.json({ user: publicUser(req.user) });
}

const genericRecoveryMessage = "إذا كان البريد مرتبطاً بحساب، فستصلك تعليمات الاستعادة.";

export function supabaseConfig(_req, res) {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const anonKey = String(process.env.SUPABASE_ANON_KEY || "");
  if (!url || !anonKey) {
    return res.status(503).json({ message: "إعدادات Supabase غير مكتملة على الخادم." });
  }
  return res.json({ url, anonKey });
}

export async function forgotPassword(req, res, next) {
  const email = normalizeEmail(req.body.email);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ message: genericRecoveryMessage });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const anonKey = String(process.env.SUPABASE_ANON_KEY || "");
  if (supabaseUrl && anonKey) {
    try {
      const redirectTo = process.env.SUPABASE_REDIRECT_URL || `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password.html`;
      const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: "POST",
        headers: { apikey: anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirect_to: redirectTo })
      });
      if (!response.ok) console.warn("Supabase recovery request failed:", await response.text());
      return res.json({ message: genericRecoveryMessage });
    } catch (error) {
      return next(error);
    }
  }

  // المسار المحلي القديم يبقى متاحاً فقط إذا لم تُضبط Supabase بعد.
  const result = await query("SELECT id, email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1", [email]);
  if (!result.rowCount) return res.json({ message: genericRecoveryMessage });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  await query(`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 minutes')`, [result.rows[0].id, tokenHash]);
  if (process.env.NODE_ENV !== "production") console.log("DEV password reset token:", rawToken);
  return res.json({ message: genericRecoveryMessage });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "بيانات استعادة كلمة المرور غير صالحة." });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const result = await query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (!result.rowCount) {
    return res.status(400).json({ message: "الرابط غير صالح أو منتهي الصلاحية." });
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

  await query("UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
    [passwordHash, result.rows[0].user_id]);

  await query("UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1",
    [result.rows[0].id]);

  return res.json({ message: "تم تغيير كلمة المرور بنجاح." });
}

export function authenticate(req, res, next) {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: "غير مسجل الدخول." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    query(
      `SELECT id, name, email, provider, email_verified, created_at
       FROM users WHERE id=$1 LIMIT 1`,
      [payload.sub]
    ).then(result => {
      if (!result.rowCount) return res.status(401).json({ message: "الحساب غير موجود." });
      req.user = result.rows[0];
      next();
    }).catch(next);
  } catch {
    return res.status(401).json({ message: "جلسة الدخول غير صالحة أو منتهية." });
  }
}
