import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID || "@AbuBasel_AI";

function esc(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

async function tgSend(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: CHAT_ID,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!r.ok) throw new Error(await r.text());
}

app.post("/webhook", async (req, res) => {
  try {
    const p = req.body || {};
    const name     = p.name || "تحالف المتداولين | أبو باسل & د. وائل";
    const symbol   = p.symbol || "SPX";
    const side     = p.side || "—";
    const tf       = p.tf || "";
    const score    = Number(p.score || 0);
    const strength = p.strength || "";
    const price    = p.price ?? "";
    const volRatio = p.vol_ratio ?? "";
    const stdev    = p.stdev ?? "";

    const emoji = side === "CALL" ? "🟢" : side === "PUT" ? "🔴" : "⚪️";
    const title = side === "CALL" ? "CALL" : side === "PUT" ? "PUT" : "SIGNAL";

    const msg =
      `*${esc(emoji + " " + title)}* | *${esc(symbol)}*\n` +
      `• *الفريم:* ${esc(tf)}\n` +
      `• *القوة:* ${esc(score + "%")} — ${esc(strength)}\n` +
      `• *السعر:* ${esc(price)}\n` +
      `• *الحجم:* ${esc(String(volRatio))}x\n` +
      `• *الانحراف:* ${esc(String(stdev))}\n\n` +
      `🤖 ${esc(name)}\n` +
      `${esc("⚠️ إدارة المخاطر أولاً — ليست نصيحة مالية")}`;

    await tgSend(msg);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/", (_, res) => res.send("OK"));
// اختبار إرسال إشارة تجريبية
app.get("/test", async (req, res) => {
  try {
    const testMsg = `
🟢 CALL | SPX (TEST)
⏱ TF: 1 Minute
📊 Strength: 95% 💎
🤖 تحالف المتداولين | أبو باسل & د. وائل
    `;
    await tgSend(testMsg);
    res.send("Test signal sent to Telegram channel.");
  } catch (e) {
    res.status(500).send(e.message);
  }
});
app.listen(process.env.PORT || 3000, () => console.log("Running"));
