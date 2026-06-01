export function clientDevLog(message: string): void {
  if (process.env.NODE_ENV === "production") return;
  console.log(`[dev] ${message}`);
}