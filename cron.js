// /api/cron.js — Vercel Cron Job Handler
// Runs on schedule defined in vercel.json

const TOKEN = process.env.BOT_TOKEN; || "8395596286:AAGA33cxdvzdcC4rH1HHiZ8AQaLOql0I5p4"
const CHANNEL = "@Free_Ethio_server_FES";
const BASE = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, body = {}) {
  const r = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

export default async function handler(req, res) {
  // Security: only allow Vercel cron
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Daily greeting post to channel
    const messages = [
      "🌅 Good morning from FES ETHIOPIA AI! 🇪🇹\n\n✨ Today is a great day to learn, grow, and explore!\n\n🤖 Try our AI bot: @FES_Ethiopia_AI_Bot\n📢 Channel: @Free_Ethio_server_FES",
      "🚀 FES ETHIOPIA AI - Daily Tip!\n\n💡 Did you know? You can generate images in Ethiopian art style!\n\nSend: <code>Ethiopian landscape | ethiopian | 512x512</code>\n\n🤖 @FES_Ethiopia_AI_Bot",
      "📚 Study with FES AI!\n\n🎓 Ethiopian Grade 9-12 curriculum support\n• Math, Science, History\n• Flashcards & Quizzes\n• AI Tutor in Amharic!\n\n🤖 @FES_Ethiopia_AI_Bot",
    ];

    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    // Get scheduled posts from KV
    // const scheduled = await kvGet("scheduled_posts") || [];
    // Process and send them...

    // For now, send daily message if configured
    if (process.env.AUTO_POST_CHANNEL) {
      await tg("sendMessage", {
        chat_id: process.env.AUTO_POST_CHANNEL,
        text: randomMsg,
        parse_mode: "HTML",
      });
    }

    res.status(200).json({ ok: true, ran: new Date().toISOString() });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ error: err.message });
  }
}
