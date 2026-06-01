import { readFileSync } from "fs";
const text = readFileSync(".env.local", "utf8");
const line = text.split(/\r?\n/).find((l) => l.startsWith("NVIDIA_API_KEY="));
if (!line) { console.log("NVIDIA_API_KEY: missing"); process.exit(1); }
const value = line.slice("NVIDIA_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
if (value.includes("PASTE_YOUR")) { console.log("NVIDIA_API_KEY: still placeholder"); process.exit(1); }
if (value.length < 8) { console.log("NVIDIA_API_KEY: too short"); process.exit(1); }
console.log("NVIDIA_API_KEY: ok");
console.log("live_answer:", /NEXT_PUBLIC_ENABLE_LIVE_ANSWER=true/.test(text));
console.log("live_eval:", /NEXT_PUBLIC_ENABLE_LIVE_EVALUATORS=true/.test(text));