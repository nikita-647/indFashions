// Local-only mock auth service — no backend required.
// A single demo admin account is seeded into localStorage on first use.
// Sign in, forgot password, OTP verification, and password reset all
// work entirely client-side so the app is fully usable as a frontend-only demo.

const ACCOUNT_KEY = "mockAdminAccount";
const OTP_SESSION_KEY = "mockOtpSession";

export const DEFAULT_ADMIN_EMAIL = "admin@fashion.com";
export const DEFAULT_ADMIN_PASSWORD = "Admin@123";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const randomId = () =>
  `demo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const randomToken = () =>
  `demo-token.${Math.random().toString(36).slice(2)}.${Date.now()}`;

const seedAccount = () => {
  const account = {
    _id: randomId(),
    name: "Admin",
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  return account;
};

const loadAccount = () => {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fall through and reseed
  }
  return seedAccount();
};

const saveAccount = (account) => {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
};

export const mockAuth = {
  // Returns the seeded demo credentials so the UI can show a hint.
  getDemoCredentials: () => ({
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  }),

  login: async (email, password) => {
    await delay();
    const account = loadAccount();
    if (
      email?.trim().toLowerCase() === account.email.toLowerCase() &&
      password === account.password
    ) {
      return {
        success: true,
        token: randomToken(),
        adminId: account._id,
      };
    }
    return { success: false, message: "Invalid email or password" };
  },

  // "Sends" an OTP — since there's no backend/email service, the OTP is
  // returned directly so the UI can surface it to the user (clearly
  // labelled as a demo flow).
  requestOtp: async (email) => {
    await delay();
    const account = loadAccount();
    if (email?.trim().toLowerCase() !== account.email.toLowerCase()) {
      return { success: false, message: "No admin account with that email" };
    }
    const otp = String(Math.floor(10000 + Math.random() * 90000));
    const session = {
      email: account.email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    localStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
    return { success: true, otp };
  },

  verifyOtp: async (email, otp) => {
    await delay();
    let session;
    try {
      session = JSON.parse(localStorage.getItem(OTP_SESSION_KEY));
    } catch (e) {
      session = null;
    }
    if (!session || session.email.toLowerCase() !== email?.trim().toLowerCase()) {
      return { success: false, message: "Request a new OTP and try again" };
    }
    if (Date.now() > session.expiresAt) {
      return { success: false, message: "OTP expired, please request a new one" };
    }
    if (session.otp !== otp) {
      return { success: false, message: "Incorrect OTP" };
    }
    const securityToken = randomToken();
    localStorage.setItem(
      OTP_SESSION_KEY,
      JSON.stringify({ ...session, securityToken, verified: true })
    );
    return { success: true, securityToken };
  },

  resetPassword: async (email, securityToken, newPassword) => {
    await delay();
    let session;
    try {
      session = JSON.parse(localStorage.getItem(OTP_SESSION_KEY));
    } catch (e) {
      session = null;
    }
    if (
      !session?.verified ||
      session.securityToken !== securityToken ||
      session.email.toLowerCase() !== email?.trim().toLowerCase()
    ) {
      return { success: false, message: "Session expired, please start over" };
    }
    const account = loadAccount();
    account.password = newPassword;
    saveAccount(account);
    localStorage.removeItem(OTP_SESSION_KEY);
    return { success: true };
  },
};

export default mockAuth;
