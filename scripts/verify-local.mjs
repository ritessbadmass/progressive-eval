const base = process.argv[2] ?? "http://localhost:3000";

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
  return { status: res.status, json };
}

async function main() {
  console.log(`\nVerifying ${base} ...\n`);
  const chat = await post("/api/chat", {
    prompt: "What is progressive evaluation in one sentence?",
  });
  console.log("POST /api/chat", chat.status, "source:", chat.json.source ?? chat.json.error);
  if (chat.json.answer) console.log("  answer preview:", chat.json.answer.slice(0, 120).replace(/\n/g, " ") + "...");

  const evaluate = await post("/api/evaluate", {
    userPrompt: "What is progressive evaluation?",
    baseAnswer: "Progressive evaluation means fast answers first, optional specialist review second.",
    evaluatorTypes: ["reasoning", "research", "writing", "risk", "code", "career"],
  });
  console.log("POST /api/evaluate", evaluate.status, "source:", evaluate.json.source ?? evaluate.json.error);
  if (evaluate.json.results) {
    console.log("  evaluators:", evaluate.json.results.map((r) => r.evaluatorId).join(", "));
    console.log("  first summary:", evaluate.json.results[0]?.summary?.slice(0, 80) + "...");
  }

  const revise = await post("/api/revise", {
    userPrompt: "What is progressive evaluation?",
    originalAnswer: "Progressive evaluation means fast answers first, optional specialist review second.",
    evaluatorResults: evaluate.json.results ?? [],
  });
  console.log("POST /api/revise", revise.status, "source:", revise.json.source ?? revise.json.error);
  if (revise.json.answer) console.log("  revised preview:", revise.json.answer.slice(0, 120).replace(/\n/g, " ") + "...");

  const alternate = await post("/api/alternate", {
    userPrompt: "What is progressive evaluation?",
    originalAnswer: "Progressive evaluation means fast answers first, optional specialist review second.",
    strategy: "different approach",
  });
  console.log("POST /api/alternate", alternate.status, "source:", alternate.json.source ?? alternate.json.error);
  if (alternate.json.answer) console.log("  alternate preview:", alternate.json.answer.slice(0, 120).replace(/\n/g, " ") + "...");
  console.log("\nCheck dev server terminal for [dev] answer source / evaluator source lines.\n");
}

main().catch((e) => { console.error(e); process.exit(1); });