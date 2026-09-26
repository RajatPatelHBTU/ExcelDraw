// Backend endpoints.
// Reads from NEXT_PUBLIC_* environment variables set in Vercel.
// Automatically falls back to the live Render backend in production,
// and to localhost during local development.

const isDev = process.env.NODE_ENV === "development";

const defaultHttp = isDev
  ? "http://localhost:4000"
  : "https://exceldraw-api-2oj0.onrender.com";

const defaultWs = isDev
  ? "ws://localhost:8080"
  : "wss://exceldraw-ws-m7ly.onrender.com";

const rawHttp = process.env.NEXT_PUBLIC_HTTP_BACKEND || defaultHttp;
const rawWs = process.env.NEXT_PUBLIC_WS_URL || defaultWs;

// Strip any trailing slashes to avoid double-slash endpoint issues
export const HTTP_BACKEND = rawHttp.replace(/\/+$/, "");
export const WS_URL = rawWs.replace(/\/+$/, "");
