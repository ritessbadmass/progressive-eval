/** Server-side dev logging — stripped in production builds. */
export function devLog(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  if (detail !== undefined) {
    console.log(`[dev] ${message}`, detail);
    return;
  }
  console.log(`[dev] ${message}`);
}