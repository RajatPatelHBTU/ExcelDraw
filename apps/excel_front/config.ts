// Backend endpoints. In production set these in Vercel as environment variables
// (NEXT_PUBLIC_* so they're available in the browser). They fall back to the
// local dev servers when unset.
export const HTTP_BACKEND =
  process.env.NEXT_PUBLIC_HTTP_BACKEND ?? "http://localhost:4000";
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";
