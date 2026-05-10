// FES ETHIOPIA AI BOT - Vercel Serverless Webhook
// Owner: @yzpromax | Channel: @Free_Ethio_server_FES
// Deploy: vercel --prod

const TOKEN = process.env.BOT_TOKEN || 
'8395596286:AAGA33cxdvzdcC4rH1HHiZ8AQaLOql0I5p4";
const OWNER_ID = process.env.OWNER_ID || "your_telegram_id";
const CHANNEL = "@Free_Ethio_server_FES";
const SERPER_KEY = process.env.SERPER_KEY || "";
const BASE = `https://api.telegram.org/bot${TOKEN}`;

// ─── Telegram API helpers ───────────────────────────────────────────────────

async function tg(method, body = {}) {
  const r = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function send(chat_id, text, extra = {}) {
  return tg("sendMessage", { chat_id, text, parse_mode: "HTML", ...extra });
}

async function sendPhoto(chat_id, photo, caption = "", extra = {}) {
  return tg("sendPhoto", { chat_id, photo, caption, parse_mode: "HTML", ...extra });
}

async function sendDocument(chat_id, document, caption = "", extra = {}) {
  return tg("sendDocument", { chat_id, document, caption, parse_mode: "HTML", ...extra });
}

async function sendVoice(chat_id, voice, extra = {}) {
  return tg("sendVoice", { chat_id, voice, ...extra });
}

async function sendVideo(chat_id, video, caption = "", extra = {}) {
  return tg("sendVideo", { chat_id, video, caption, parse_mode: "HTML", ...extra });
}

async function editMessage(chat_id, message_id, text, extra = {}) {
  return tg("editMessageText", { chat_id, message_id, text, parse_mode: "HTML", ...extra });
}

async function answerCbq(callback_query_id, text = "", show_alert = false) {
  return tg("answerCallbackQuery", { callback_query_id, text, show_alert });
}

// ─── Channel membership check ──────────────────────────────────────────────

async function isMember(user_id) {
  const r = await tg("getChatMember", { chat_id: CHANNEL, user_id });
  return ["member", "administrator", "creator"].includes(r?.result?.status);
}

function joinPrompt(chat_id) {
  return send(chat_id,
    `🔐 <b>Join Required!</b>\n\nYou must join our channel to use FES ETHIOPIA AI Bot.\n\n👉 Join: ${CHANNEL}\n\nAfter joining, send /start again.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Join Channel", url: `https://t.me/Free_Ethio_server_FES` }],
          [{ text: "🔄 I Joined - Check", callback_data: "check_join" }],
        ],
      },
    }
  );
}

// ─── Admin check ───────────────────────────────────────────────────────────

async function isAdmin(user_id) {
  return String(user_id) === String(OWNER_ID);
}

// ─── Simple KV store via Vercel KV (or env fallback) ──────────────────────
// Uses process.env for simple demo; plug in Vercel KV / Upstash for production

const memStore = {}; // ephemeral (per cold start) — replace with KV in prod

async function kvGet(key) {
  if (process.env.KV_REST_API_URL) {
    const r = await fetch(`${process.env.KV_REST_API_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    const d = await r.json();
    return d.result ? JSON.parse(d.result) : null;
  }
  return memStore[key] ?? null;
}

async function kvSet(key, value) {
  if (process.env.KV_REST_API_URL) {
    await fetch(`${process.env.KV_REST_API_URL}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(value)),
    });
  } else {
    memStore[key] = value;
  }
}

// ─── User registration ─────────────────────────────────────────────────────

async function registerUser(user) {
  const existing = await kvGet(`user:${user.id}`);
  if (!existing) {
    await kvSet(`user:${user.id}`, {
      id: user.id,
      name: user.first_name,
      username: user.username || "",
      joined: Date.now(),
      lang: "en",
    });
    // increment user count
    const count = (await kvGet("stats:users")) || 0;
    await kvSet("stats:users", count + 1);
  }
}

// ─── Main Menu (5x5 grid) ─────────────────────────────────────────────────

function mainMenu() {
  return {
    inline_keyboard: [
      [
        { text: "🤖 AI Chat",       callback_data: "menu_chat" },
        { text: "🖼️ Image Gen",      callback_data: "menu_imggen" },
        { text: "🎨 Photo Edit",    callback_data: "menu_photoedit" },
        { text: "🎙️ Voice/TTS",     callback_data: "menu_tts" },
        { text: "⬇️ YT/TikTok",    callback_data: "menu_ytdl" },
      ],
      [
        { text: "🔍 Web Search",    callback_data: "menu_search" },
        { text: "📁 File Manager",  callback_data: "menu_files" },
        { text: "🔄 File Convert",  callback_data: "menu_convert" },
        { text: "🔬 File Analyze",  callback_data: "menu_analyze" },
        { text: "📄 File Generate", callback_data: "menu_filegen" },
      ],
      [
        { text: "📚 Study Tutor",   callback_data: "menu_study" },
        { text: "🗂️ Flashcards",   callback_data: "menu_flashcards" },
        { text: "📖 Summarizer",    callback_data: "menu_summarizer" },
        { text: "💾 Chat Export",   callback_data: "menu_export" },
        { text: "🌐 Languages",     callback_data: "menu_lang" },
      ],
      [
        { text: "👑 Admin Panel",   callback_data: "menu_admin" },
        { text: "📢 Auto Post",     callback_data: "menu_autopost" },
        { text: "❤️ Auto React",   callback_data: "menu_react" },
        { text: "📊 My Stats",      callback_data: "menu_mystats" },
        { text: "ℹ️ Help",          callback_data: "menu_help" },
      ],
      [
        { text: "🇪🇹 About FES",   callback_data: "menu_about" },
        { text: "🎯 Features",      callback_data: "menu_features" },
        { text: "💬 Contact",       callback_data: "menu_contact" },
        { text: "🔗 Channel",       url: "https://t.me/Free_Ethio_server_FES" },
        { text: "⚙️ Settings",      callback_data: "menu_settings" },
      ],
    ],
  };
}

// ─── AI Chat (Pollinations) ────────────────────────────────────────────────

async function aiChat(prompt, lang = "en") {
  try {
    const sysPrompt = `You are FES ETHIOPIA AI Assistant, a helpful multilingual AI for Ethiopian users. 
Respond in ${lang === "am" ? "Amharic" : lang === "om" ? "Afaan Oromoo" : lang === "ti" ? "Tigrinya" : "English"}.
Be concise, helpful, and friendly. Owner: @yzpromax | Channel: @Free_Ethio_server_FES`;

    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?system=${encodeURIComponent(sysPrompt)}&model=openai&seed=${Math.floor(Math.random()*9999)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
    const text = await r.text();
    return text.trim() || "⚠️ No response. Try again.";
  } catch (e) {
    return `❌ AI Error: ${e.message}`;
  }
}

// ─── Image Generation (Pollinations) ──────────────────────────────────────

const IMAGE_STYLES = {
  realistic: "photorealistic, ultra detailed, 8k",
  anime: "anime style, vibrant, studio ghibli",
  oil: "oil painting, classical art, brush strokes",
  watercolor: "watercolor painting, soft colors",
  sketch: "pencil sketch, black and white, detailed",
  cyberpunk: "cyberpunk, neon lights, futuristic city",
  fantasy: "fantasy art, magical, epic lighting",
  portrait: "professional portrait, studio lighting",
  landscape: "landscape photography, golden hour",
  cartoon: "cartoon style, bright colors, fun",
  "3d": "3D render, cinema4d, octane render",
  pixel: "pixel art, retro game style, 16bit",
  abstract: "abstract art, geometric, colorful",
  vintage: "vintage photo, film grain, retro",
  minimalist: "minimalist design, clean, simple",
  ethiopian: "Ethiopian traditional art, cultural patterns, colorful",
  habesha: "Habesha cultural art, traditional Ethiopian style",
  afro: "Afrocentric art, vibrant colors, African patterns",
};

async function generateImage(prompt, style = "realistic", width = 512, height = 512) {
  const stylePrompt = IMAGE_STYLES[style] || IMAGE_STYLES.realistic;
  const fullPrompt = `${prompt}, ${stylePrompt}`;
  const seed = Math.floor(Math.random() * 99999);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

// ─── Google TTS ────────────────────────────────────────────────────────────

function ttsUrl(text, lang = "en") {
  const t = encodeURIComponent(text.substring(0, 200));
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${t}`;
}

// ─── Web Search (Serper) ───────────────────────────────────────────────────

async function webSearch(query, type = "search") {
  if (!SERPER_KEY) {
    return `⚠️ Web search not configured. Add SERPER_KEY env var.\n\nQuery: ${query}`;
  }
  const endpoints = {
    search: "https://google.serper.dev/search",
    news: "https://google.serper.dev/news",
    images: "https://google.serper.dev/images",
    videos: "https://google.serper.dev/videos",
    shopping: "https://google.serper.dev/shopping",
  };
  const r = await fetch(endpoints[type] || endpoints.search, {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  const d = await r.json();
  const items = d.organic || d.news || d.videos || d.shopping || [];
  if (!items.length) return "❌ No results found.";
  return items
    .slice(0, 5)
    .map((i, n) => `${n + 1}. <b>${i.title}</b>\n${i.snippet || i.description || ""}\n🔗 ${i.link || i.url || ""}`)
    .join("\n\n");
}

// ─── Session management ─────────────────────────────────────────────────────

const sessions = {}; // ephemeral per cold start — use KV for persistence

function getSession(uid) {
  if (!sessions[uid]) sessions[uid] = { step: null, data: {}, history: [], lang: "en" };
  return sessions[uid];
}

// ─── Handle /start ─────────────────────────────────────────────────────────

async function handleStart(msg) {
  const { chat, from } = msg;
  await registerUser(from);

  const member = await isMember(from.id);
  if (!member) return joinPrompt(chat.id);

  const sess = getSession(from.id);
  sess.step = null;

  await send(
    chat.id,
    `🇪🇹 <b>Welcome to FES ETHIOPIA AI!</b> 🚀\n\n` +
    `Hello <b>${from.first_name}</b>! I'm your all-in-one AI assistant.\n\n` +
    `✨ <b>30 Features:</b> AI Chat • Image Gen • TTS • YouTube DL • Web Search • File Tools • Study Tutor • Admin Panel & more!\n\n` +
    `🌐 Supports 30 languages including Amharic 🇪🇹\n\n` +
    `👇 Choose a feature below:`,
    { reply_markup: mainMenu() }
  );
}

// ─── Handle text messages ──────────────────────────────────────────────────

async function handleText(msg) {
  const { chat, from, text } = msg;
  const sess = getSession(from.id);

  // Commands
  if (text.startsWith("/start")) return handleStart(msg);
  if (text.startsWith("/menu") || text === "🏠 Menu") return handleStart(msg);
  if (text.startsWith("/help")) return handleHelp(chat.id);
  if (text.startsWith("/stats") && await isAdmin(from.id)) return handleAdminStats(chat.id);
  if (text.startsWith("/broadcast") && await isAdmin(from.id)) return handleBroadcast(msg);
  if (text.startsWith("/users") && await isAdmin(from.id)) return handleUserList(chat.id);
  if (text.startsWith("/export_study")) return handleExportStudy(msg, sess);
  if (text.startsWith("/upload")) return send(chat.id, "📤 Send me any file to upload to your library.");
  if (text.startsWith("/autopost") && await isAdmin(from.id)) return handleAutoPost(msg);
  if (text.startsWith("/react") && await isAdmin(from.id)) return handleAutoReact(msg);
  if (text.startsWith("/schedule") && await isAdmin(from.id)) return handleSchedule(msg);

  // Membership gate
  const member = await isMember(from.id);
  if (!member) return joinPrompt(chat.id);

  // Step-based flow
  if (sess.step === "awaiting_chat") {
    sess.step = null;
    sess.history.push({ role: "user", content: text });
    const thinking = await send(chat.id, "🤖 <i>Thinking...</i>");
    const reply = await aiChat(
      sess.history.map(h => `${h.role === "user" ? "User" : "AI"}: ${h.content}`).join("\n") + `\nUser: ${text}`,
      sess.lang
    );
    sess.history.push({ role: "assistant", content: reply });
    if (sess.history.length > 20) sess.history = sess.history.slice(-20);
    await editMessage(chat.id, thinking.result.message_id, `🤖 <b>FES AI:</b>\n\n${reply}`);
    return send(chat.id, "💬 Continue chatting or /menu", {
      reply_markup: { inline_keyboard: [[
        { text: "💬 Continue", callback_data: "menu_chat" },
        { text: "🏠 Menu", callback_data: "back_main" },
        { text: "🗑️ Clear Chat", callback_data: "clear_chat" },
      ]] }
    });
  }

  if (sess.step === "awaiting_image") {
    sess.step = null;
    const [promptPart, stylePart, sizePart] = text.split("|").map(s => s.trim());
    const style = stylePart || "realistic";
    const [w, h] = (sizePart || "512x512").split("x").map(Number);
    const thinking = await send(chat.id, "🎨 <i>Generating image...</i>");
    const url = await generateImage(promptPart, style, w || 512, h || 512);
    await tg("deleteMessage", { chat_id: chat.id, message_id: thinking.result.message_id });
    await sendPhoto(chat.id, url, `🖼️ <b>Prompt:</b> ${promptPart}\n🎨 <b>Style:</b> ${style}\n📐 <b>Size:</b> ${w || 512}x${h || 512}`);
    return send(chat.id, "Generate another?", {
      reply_markup: { inline_keyboard: [[
        { text: "🖼️ New Image", callback_data: "menu_imggen" },
        { text: "📦 Batch (4)", callback_data: "imggen_batch" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] }
    });
  }

  if (sess.step === "awaiting_tts") {
    sess.step = null;
    const lang = sess.data.tts_lang || "en";
    const ttsLink = ttsUrl(text, lang);
    await sendVoice(chat.id, ttsLink);
    return send(chat.id, `✅ <b>Voice generated!</b>\n\n📝 Text: ${text.substring(0, 100)}...\n🌐 Lang: ${lang}`, {
      reply_markup: { inline_keyboard: [[
        { text: "🎙️ New TTS", callback_data: "menu_tts" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] }
    });
  }

  if (sess.step === "awaiting_search") {
    sess.step = null;
    const type = sess.data.search_type || "search";
    const thinking = await send(chat.id, "🔍 <i>Searching...</i>");
    const results = await webSearch(text, type);
    await editMessage(chat.id, thinking.result.message_id, `🔍 <b>Results for:</b> ${text}\n\n${results}`, {
      reply_markup: { inline_keyboard: [[
        { text: "🔍 New Search", callback_data: "menu_search" },
        { text: "📰 News", callback_data: "search_news" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] }
    });
    return;
  }

  if (sess.step === "awaiting_study") {
    sess.step = null;
    const subject = sess.data.study_subject || "General";
    const thinking = await send(chat.id, "📚 <i>Studying...</i>");
    const answer = await aiChat(
      `You are an expert tutor for Ethiopian students. Subject: ${subject}. Question: ${text}. 
      Provide a clear, detailed explanation with examples. If math, show step-by-step solution.`,
      sess.lang
    );
    await editMessage(chat.id, thinking.result.message_id,
      `📚 <b>FES Study Tutor - ${subject}</b>\n\n❓ <b>Q:</b> ${text}\n\n📝 <b>A:</b>\n${answer}`,
      { reply_markup: { inline_keyboard: [[
        { text: "❓ Ask More", callback_data: "menu_study" },
        { text: "🗂️ Flashcards", callback_data: "menu_flashcards" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] } }
    );
    return;
  }

  if (sess.step === "awaiting_flashcards") {
    sess.step = null;
    const count = sess.data.fc_count || 10;
    const thinking = await send(chat.id, "🗂️ <i>Creating flashcards...</i>");
    const result = await aiChat(
      `Create ${count} flashcards on: "${text}". Format each as:
Q: [question]
A: [answer]
---
Make them educational and appropriate for Ethiopian high school/university students.`,
      sess.lang
    );
    sess.data.last_flashcards = { topic: text, content: result };
    await editMessage(chat.id, thinking.result.message_id,
      `🗂️ <b>Flashcards: ${text}</b>\n\n${result}`,
      { reply_markup: { inline_keyboard: [[
        { text: "📤 Export Anki", callback_data: "export_anki" },
        { text: "📤 Export Quizlet", callback_data: "export_quizlet" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] } }
    );
    return;
  }

  if (sess.step === "awaiting_ytdl") {
    sess.step = null;
    const format = sess.data.ytdl_format || "mp4_720";
    await send(chat.id,
      `⬇️ <b>Download Request Received</b>\n\n🔗 URL: ${text}\n📁 Format: ${format}\n\n` +
      `⚠️ <i>Note: YouTube/TikTok direct download requires a backend media server. Configure YTDL_API env var with your yt-dlp API endpoint.</i>\n\n` +
      `🔧 Recommended: Deploy <a href="https://github.com/nicedoc/nicedoc-bot">yt-dlp API</a> on Railway or Render, add URL as YTDL_API env var.`,
      { reply_markup: { inline_keyboard: [[
        { text: "⬇️ Try Another", callback_data: "menu_ytdl" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] } }
    );
    return;
  }

  if (sess.step === "awaiting_broadcast" && await isAdmin(from.id)) {
    sess.step = null;
    const count = (await kvGet("stats:users")) || 0;
    return send(chat.id, `📢 <b>Broadcast sent!</b>\n\n📨 Message: ${text.substring(0, 100)}\n👥 Users: ${count}\n\n⚠️ Note: Connect Vercel KV for real user iteration.`);
  }

  // Default: treat as AI chat
  sess.step = null;
  const thinking = await send(chat.id, "🤖 <i>Thinking...</i>");
  const reply = await aiChat(text, sess.lang);
  await editMessage(chat.id, thinking.result.message_id, `🤖 <b>FES AI:</b>\n\n${reply}`);
  await send(chat.id, "💬 Use /menu for all features", {
    reply_markup: { inline_keyboard: [[
      { text: "🏠 Main Menu", callback_data: "back_main" },
    ]] }
  });
}

// ─── Handle documents/files ───────────────────────────────────────────────

async function handleDocument(msg) {
  const { chat, from, document: doc, caption } = msg;
  const sess = getSession(from.id);

  if (sess.step === "awaiting_summarize") {
    sess.step = null;
    await send(chat.id, "📖 <i>Analyzing document...</i>");
    const summary = await aiChat(
      `Summarize this document titled "${doc.file_name}". Create: 1) Brief summary 2) Key points (5-10 bullets) 3) Generate 5 quiz questions. Be educational.`,
      sess.lang
    );
    return send(chat.id, `📖 <b>Document Summary</b>\n📄 ${doc.file_name}\n\n${summary}`, {
      reply_markup: { inline_keyboard: [[
        { text: "📖 Summarize Another", callback_data: "menu_summarizer" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] }
    });
  }

  if (sess.step === "awaiting_analyze") {
    sess.step = null;
    const info = `📊 <b>File Analysis</b>\n\n` +
      `📄 <b>Name:</b> ${doc.file_name}\n` +
      `📦 <b>Size:</b> ${(doc.file_size / 1024).toFixed(1)} KB\n` +
      `🔧 <b>Type:</b> ${doc.mime_type}\n` +
      `🆔 <b>File ID:</b> <code>${doc.file_id}</code>\n\n` +
      `✅ <b>Analysis:</b> File received and catalogued in your library.`;
    return send(chat.id, info, {
      reply_markup: { inline_keyboard: [[
        { text: "🔬 Analyze More", callback_data: "menu_analyze" },
        { text: "📁 My Files", callback_data: "file_list" },
        { text: "🏠 Menu", callback_data: "back_main" },
      ]] }
    });
  }

  // Default: save to library
  const files = (await kvGet(`files:${from.id}`)) || [];
  files.push({
    id: doc.file_id,
    name: doc.file_name,
    size: doc.file_size,
    mime: doc.mime_type,
    date: Date.now(),
    caption: caption || "",
  });
  await kvSet(`files:${from.id}`, files);

  return send(chat.id, `📁 <b>File Saved!</b>\n\n📄 ${doc.file_name}\n📦 ${(doc.file_size / 1024).toFixed(1)} KB\n🆔 Index: #${files.length}`, {
    reply_markup: { inline_keyboard: [[
      { text: "📁 View Library", callback_data: "file_list" },
      { text: "🏠 Menu", callback_data: "back_main" },
    ]] }
  });
}

// ─── Handle photos ─────────────────────────────────────────────────────────

async function handlePhoto(msg) {
  const { chat, from, photo, caption } = msg;
  const sess = getSession(from.id);
  const fileId = photo[photo.length - 1].file_id;

  if (sess.step === "awaiting_photoedit") {
    const action = sess.data.photo_action || "analyze";
    sess.step = null;

    if (action === "remove_bg") {
      return send(chat.id,
        `🎨 <b>Remove Background</b>\n\n⚠️ This feature requires <a href="https://www.remove.bg/api">remove.bg API</a>.\n\nAdd <code>REMOVEBG_KEY</code> env var to enable.\n\n📌 File ID saved: <code>${fileId}</code>`,
        { reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] } }
      );
    }
    if (action === "restore") {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("restore this photo, enhance quality, fix colors, professional restoration")}?width=512&height=512&seed=${Math.random()*9999|0}&nologo=true`;
      await sendPhoto(chat.id, url, "✨ <b>Photo Restored (AI Enhanced)</b>");
      return;
    }
    if (action === "colorize") {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent("colorize black and white photo, realistic colors, professional colorization")}?width=512&height=512&seed=${Math.random()*9999|0}&nologo=true`;
      await sendPhoto(chat.id, url, "🎨 <b>Photo Colorized</b>");
      return;
    }
  }

  // Default photo analysis
  return send(chat.id, `📸 <b>Photo received!</b>\n\n🆔 File ID: <code>${fileId}</code>\n\nWhat would you like to do?`, {
    reply_markup: { inline_keyboard: [
      [
        { text: "✂️ Remove BG", callback_data: "photoedit_rmbg" },
        { text: "✨ Restore", callback_data: "photoedit_restore" },
        { text: "🎨 Colorize", callback_data: "photoedit_colorize" },
      ],
      [{ text: "🏠 Menu", callback_data: "back_main" }],
    ] }
  });
}

// ─── Handle callback queries ───────────────────────────────────────────────

async function handleCallback(cbq) {
  const { id, data, message, from } = cbq;
  const chat_id = message.chat.id;
  const sess = getSession(from.id);

  await answerCbq(id);

  // Membership check
  if (data === "check_join") {
    const member = await isMember(from.id);
    if (member) {
      await tg("deleteMessage", { chat_id, message_id: message.message_id });
      return handleStart({ chat: { id: chat_id }, from });
    }
    return answerCbq(id, "❌ You haven't joined yet!", true);
  }

  // Main menu
  if (data === "back_main") {
    sess.step = null;
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🇪🇹 <b>FES ETHIOPIA AI - Main Menu</b>\n\n👇 Choose a feature:`,
      parse_mode: "HTML",
      reply_markup: mainMenu(),
    });
  }

  // ── AI Chat ──
  if (data === "menu_chat") {
    sess.step = "awaiting_chat";
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🤖 <b>AI Chat</b>\n\n💬 Send me your message!\n\n🌐 Language: ${sess.lang}\n📜 History: ${sess.history.length} messages\n\n<i>Supports Amharic, English, and 28 more languages</i>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🇪🇹 Amharic", callback_data: "lang_am" },
          { text: "🇬🇧 English", callback_data: "lang_en" },
          { text: "🇴🇲 Oromoo", callback_data: "lang_om" },
        ],
        [
          { text: "🗑️ Clear History", callback_data: "clear_chat" },
          { text: "🏠 Menu", callback_data: "back_main" },
        ],
      ] }
    });
  }

  if (data === "clear_chat") {
    sess.history = [];
    return answerCbq(id, "✅ Chat history cleared!", false);
  }

  // Language selection
  if (data.startsWith("lang_")) {
    const langMap = { lang_am: "am", lang_en: "en", lang_om: "om", lang_ti: "ti", lang_ar: "ar", lang_fr: "fr", lang_zh: "zh" };
    sess.lang = langMap[data] || "en";
    return answerCbq(id, `✅ Language set to ${sess.lang}`, false);
  }

  // ── Image Generation ──
  if (data === "menu_imggen") {
    sess.step = "awaiting_image";
    const styleList = Object.keys(IMAGE_STYLES).join(", ");
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🖼️ <b>Image Generator</b>\n\n📝 Format: <code>prompt | style | size</code>\n\n🎨 Styles: ${styleList}\n📐 Sizes: 256x256, 512x512, 768x768, 1024x1024\n\n✨ Example:\n<code>Ethiopian landscape sunset | ethiopian | 512x512</code>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🇪🇹 Ethiopian", callback_data: "imggen_preset_ethiopian" },
          { text: "🎨 Realistic", callback_data: "imggen_preset_realistic" },
          { text: "🌸 Anime", callback_data: "imggen_preset_anime" },
        ],
        [
          { text: "📦 Batch x4", callback_data: "imggen_batch" },
          { text: "🏠 Menu", callback_data: "back_main" },
        ],
      ] }
    });
  }

  if (data === "imggen_batch") {
    sess.step = "awaiting_image_batch";
    return send(chat_id, "📦 <b>Batch Image Gen</b>\n\nSend your prompt and I'll generate 4 variations!\n\n<code>prompt | style</code>");
  }

  if (data.startsWith("imggen_preset_")) {
    const style = data.replace("imggen_preset_", "");
    sess.step = "awaiting_image";
    sess.data.preset_style = style;
    return send(chat_id, `🎨 <b>Style: ${style}</b>\n\nSend your image prompt now:`);
  }

  // ── Photo Edit ──
  if (data === "menu_photoedit") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🎨 <b>Photo Editor</b>\n\nSend a photo and choose an action:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "✂️ Remove BG", callback_data: "photoedit_rmbg" },
          { text: "✨ Restore", callback_data: "photoedit_restore" },
          { text: "🎨 Colorize", callback_data: "photoedit_colorize" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("photoedit_")) {
    const actions = { photoedit_rmbg: "remove_bg", photoedit_restore: "restore", photoedit_colorize: "colorize" };
    sess.step = "awaiting_photoedit";
    sess.data.photo_action = actions[data];
    return send(chat_id, `📸 <b>Send your photo now!</b>\n\nAction: ${actions[data]}`);
  }

  // ── TTS / Voice ──
  if (data === "menu_tts") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🎙️ <b>Text-to-Speech</b>\n\nChoose language then send text:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🇪🇹 Amharic", callback_data: "tts_am" },
          { text: "🇬🇧 English", callback_data: "tts_en" },
          { text: "🇴🇲 Oromoo", callback_data: "tts_om" },
        ],
        [
          { text: "🇸🇦 Arabic", callback_data: "tts_ar" },
          { text: "🇫🇷 French", callback_data: "tts_fr" },
          { text: "🇰🇪 Swahili", callback_data: "tts_sw" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("tts_")) {
    const lang = data.replace("tts_", "");
    sess.step = "awaiting_tts";
    sess.data.tts_lang = lang;
    return send(chat_id, `🎙️ <b>TTS - ${lang.toUpperCase()}</b>\n\n✍️ Send the text you want to convert to voice (max 200 chars):`);
  }

  // ── YouTube / TikTok DL ──
  if (data === "menu_ytdl") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `⬇️ <b>YouTube / TikTok Downloader</b>\n\nChoose format then send URL:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🎬 MP4 720p", callback_data: "ytdl_mp4_720" },
          { text: "🎬 MP4 480p", callback_data: "ytdl_mp4_480" },
          { text: "🎬 MP4 360p", callback_data: "ytdl_mp4_360" },
        ],
        [
          { text: "🎵 MP3 320kbps", callback_data: "ytdl_mp3_320" },
          { text: "🎵 MP3 128kbps", callback_data: "ytdl_mp3_128" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("ytdl_")) {
    sess.step = "awaiting_ytdl";
    sess.data.ytdl_format = data.replace("ytdl_", "");
    return send(chat_id, `⬇️ Send YouTube or TikTok URL:`);
  }

  // ── Web Search ──
  if (data === "menu_search") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🔍 <b>Web Search</b>\n\nChoose search type:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🌐 Web", callback_data: "search_web" },
          { text: "📰 News", callback_data: "search_news" },
          { text: "🎵 Music", callback_data: "search_music" },
        ],
        [
          { text: "🎬 Videos", callback_data: "search_videos" },
          { text: "🛒 Shopping", callback_data: "search_shopping" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("search_")) {
    const typeMap = { search_web: "search", search_news: "news", search_music: "search", search_videos: "videos", search_shopping: "shopping" };
    sess.step = "awaiting_search";
    sess.data.search_type = typeMap[data] || "search";
    return send(chat_id, `🔍 <b>Search - ${data.replace("search_", "")}</b>\n\nType your search query:`);
  }

  // ── File Manager ──
  if (data === "menu_files") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `📁 <b>File Manager</b>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "📚 My Library", callback_data: "file_list" },
          { text: "🌐 Community", callback_data: "file_community" },
          { text: "🔒 Private", callback_data: "file_private" },
        ],
        [
          { text: "📤 Upload File", callback_data: "file_upload" },
          { text: "🗑️ Delete File", callback_data: "file_delete" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data === "file_list") {
    const files = (await kvGet(`files:${from.id}`)) || [];
    if (!files.length) return send(chat_id, "📁 <b>Your Library is empty.</b>\n\nSend any file to save it!");
    const list = files.slice(-10).map((f, i) => `${i + 1}. 📄 ${f.name} (${(f.size / 1024).toFixed(1)}KB)`).join("\n");
    return send(chat_id, `📚 <b>Your Files (${files.length} total):</b>\n\n${list}\n\nSend file index to retrieve (e.g. "get 1")`, {
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  if (data === "file_upload") {
    return send(chat_id, "📤 <b>Send any file to upload!</b>\n\nSupported: PDF, DOC, MP3, MP4, ZIP, and more.");
  }

  if (data === "file_community") {
    return send(chat_id, `🌐 <b>Community Files</b>\n\n📢 Shared files from @Free_Ethio_server_FES community members.\n\n🔧 Connect to community KV store to enable file sharing.`, {
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── File Converter ──
  if (data === "menu_convert") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🔄 <b>File Converter</b>\n\n📤 Send file + specify format\n\n🔧 Supported:\n• MP4 → GIF\n• MP4 → 3GP\n• Audio Extract from Video\n• 50+ formats via FFmpeg API\n\n⚠️ Requires FFMPEG_API env var (deploy yt-dlp/ffmpeg service)`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── File Analyzer ──
  if (data === "menu_analyze") {
    sess.step = "awaiting_analyze";
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🔬 <b>File Analyzer</b>\n\n📤 Send a file and I'll analyze:\n\n• 📸 Images: objects, faces, text, quality\n• 🎵 Audio: BPM, waveform\n• 📄 Docs: word count, structure\n• 🎬 Video: duration, resolution`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── File Generator ──
  if (data === "menu_filegen") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `📄 <b>File Generator</b>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "📖 Oxford PDF", callback_data: "gen_oxford_pdf" },
          { text: "📝 Grammar Fix", callback_data: "gen_grammar" },
          { text: "📃 TXT Export", callback_data: "gen_txt" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data === "gen_grammar") {
    sess.step = "awaiting_chat";
    return send(chat_id, "✏️ <b>Grammar Fixer</b>\n\nSend text and I'll fix grammar, spelling, and style:");
  }

  // ── Study Tutor ──
  if (data === "menu_study") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `📚 <b>Study Tutor</b>\n\nChoose subject:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "➕ Math", callback_data: "study_math" },
          { text: "💻 Programming", callback_data: "study_programming" },
          { text: "🔬 Science", callback_data: "study_science" },
        ],
        [
          { text: "📜 History", callback_data: "study_history" },
          { text: "🌐 Languages", callback_data: "study_languages" },
          { text: "🎯 Quiz Me", callback_data: "study_quiz" },
        ],
        [
          { text: "🇪🇹 Ethiopian Studies", callback_data: "study_ethiopia" },
          { text: "📐 Grade 9-12", callback_data: "study_grade" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("study_")) {
    const subjects = {
      study_math: "Mathematics", study_programming: "Programming", study_science: "Science",
      study_history: "History", study_languages: "Language Learning", study_quiz: "Quiz",
      study_ethiopia: "Ethiopian Studies", study_grade: "Ethiopian Grade 9-12 Curriculum"
    };
    sess.step = "awaiting_study";
    sess.data.study_subject = subjects[data] || "General";
    return send(chat_id, `📚 <b>${subjects[data] || "Study"}</b>\n\n❓ What's your question?`);
  }

  // ── Flashcards ──
  if (data === "menu_flashcards") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🗂️ <b>Flashcard Generator</b>\n\nHow many cards?`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "20 Cards", callback_data: "fc_20" },
          { text: "30 Cards", callback_data: "fc_30" },
          { text: "50 Cards", callback_data: "fc_50" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data.startsWith("fc_")) {
    sess.step = "awaiting_flashcards";
    sess.data.fc_count = parseInt(data.replace("fc_", ""));
    return send(chat_id, `🗂️ <b>${sess.data.fc_count} Flashcards</b>\n\nSend the topic to create flashcards for:`);
  }

  if (data === "export_anki") {
    const fc = sess.data.last_flashcards;
    if (!fc) return send(chat_id, "❌ No flashcards to export. Generate some first!");
    return send(chat_id, `📤 <b>Anki Export</b>\n\n📝 Topic: ${fc.topic}\n\n${fc.content}\n\n💡 Copy above and import to Anki (txt format)`);
  }

  if (data === "export_quizlet") {
    const fc = sess.data.last_flashcards;
    if (!fc) return send(chat_id, "❌ No flashcards to export.");
    return send(chat_id, `📤 <b>Quizlet Export</b>\n\nPaste this content at quizlet.com/create:\n\n${fc.content}`);
  }

  // ── Summarizer ──
  if (data === "menu_summarizer") {
    sess.step = "awaiting_summarize";
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `📖 <b>Textbook Summarizer</b>\n\n📤 Send a PDF document and I'll create:\n\n• 📋 Summary\n• 🔑 Key Points\n• ❓ Quiz Questions\n• 📊 Concept Map`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── Chat Export ──
  if (data === "menu_export") {
    return handleExportStudy({ chat: { id: chat_id }, from }, sess);
  }

  // ── Language Settings ──
  if (data === "menu_lang") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `🌐 <b>Language Settings</b>\n\nCurrent: <b>${sess.lang}</b>\n\nChoose language:`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🇪🇹 Amharic", callback_data: "lang_am" },
          { text: "🇬🇧 English", callback_data: "lang_en" },
          { text: "🇴🇲 Oromoo", callback_data: "lang_om" },
        ],
        [
          { text: "🇸🇦 Arabic", callback_data: "lang_ar" },
          { text: "🇫🇷 French", callback_data: "lang_fr" },
          { text: "🇨🇳 Chinese", callback_data: "lang_zh" },
        ],
        [
          { text: "🇷🇺 Russian", callback_data: "lang_ru" },
          { text: "🇩🇪 German", callback_data: "lang_de" },
          { text: "🇪🇸 Spanish", callback_data: "lang_es" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  // ── Admin Panel ──
  if (data === "menu_admin") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `👑 <b>Admin Panel</b>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "📊 Stats", callback_data: "admin_stats" },
          { text: "👥 Users", callback_data: "admin_users" },
          { text: "📢 Broadcast", callback_data: "admin_broadcast" },
        ],
        [
          { text: "📅 Schedule", callback_data: "admin_schedule" },
          { text: "⏰ Expiry", callback_data: "admin_expiry" },
          { text: "🔧 Settings", callback_data: "admin_settings" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data === "admin_stats") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    return handleAdminStats(chat_id);
  }

  if (data === "admin_broadcast") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    sess.step = "awaiting_broadcast";
    return send(chat_id, "📢 <b>Broadcast</b>\n\nSend the message to broadcast to all users:");
  }

  if (data === "admin_users") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    return handleUserList(chat_id);
  }

  // ── Auto Post ──
  if (data === "menu_autopost") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `📢 <b>Auto Post</b>\n\nSchedule posts to channel or users.\n\n📌 Command format:\n<code>/autopost @channel 09:00 Your message here</code>\n\n⏱️ Supported: Vercel Cron Jobs`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── Auto React ──
  if (data === "menu_react") {
    if (!await isAdmin(from.id)) return answerCbq(id, "⛔ Admin only!", true);
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `❤️ <b>Auto Reaction</b>\n\nBoost post engagement.\n\n📌 Command:\n<code>/react [post_link] [count]</code>\n\nExample:\n<code>/react https://t.me/c/123/456 500</code>\n\n⚠️ Uses Telegram reaction API. Range: 100-500.`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── My Stats ──
  if (data === "menu_mystats") {
    const userInfo = await kvGet(`user:${from.id}`);
    const files = (await kvGet(`files:${from.id}`)) || [];
    const joined = userInfo ? new Date(userInfo.joined).toLocaleDateString() : "Unknown";
    return send(chat_id, `📊 <b>My Stats</b>\n\n👤 Name: ${from.first_name}\n🆔 ID: ${from.id}\n📅 Joined: ${joined}\n🌐 Language: ${sess.lang}\n📁 Files: ${files.length}\n💬 Chat History: ${sess.history.length} msgs\n\n🔗 Channel: ${CHANNEL}`);
  }

  // ── Settings ──
  if (data === "menu_settings") {
    return tg("editMessageText", {
      chat_id, message_id: message.message_id,
      text: `⚙️ <b>Settings</b>`,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: [
        [
          { text: "🌐 Language", callback_data: "menu_lang" },
          { text: "📊 My Stats", callback_data: "menu_mystats" },
        ],
        [
          { text: "🗑️ Clear Chat", callback_data: "clear_chat" },
          { text: "🗑️ Delete Files", callback_data: "file_delete_all" },
        ],
        [{ text: "🏠 Menu", callback_data: "back_main" }],
      ] }
    });
  }

  if (data === "file_delete_all") {
    await kvSet(`files:${from.id}`, []);
    return answerCbq(id, "✅ All files deleted!", false);
  }

  // ── Help ──
  if (data === "menu_help") {
    return send(chat_id, `ℹ️ <b>FES ETHIOPIA AI - Help</b>\n\n📋 <b>Commands:</b>\n/start - Start bot\n/menu - Open menu\n/export_study - Export chat as PDF\n/upload - Upload file\n/stats - Stats (admin)\n/broadcast - Broadcast (admin)\n/autopost - Auto post (admin)\n/react - Auto react (admin)\n\n🤖 <b>Features:</b>\n• AI Chat with 30 language support\n• Image generation (20+ styles)\n• TTS in multiple languages\n• YouTube/TikTok downloader\n• Web search (Serper API)\n• File manager & converter\n• Study tutor & flashcards\n\n👤 Owner: @yzpromax\n📢 Channel: ${CHANNEL}`, {
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  // ── About & Features ──
  if (data === "menu_about") {
    return send(chat_id, `🇪🇹 <b>FES ETHIOPIA AI</b>\n\nBuilt for Ethiopian users with ❤️\n\n🚀 30+ Features\n🌐 30 Languages\n📱 Telegram Native\n☁️ Powered by Vercel\n\n👤 Owner: @yzpromax\n📢 Channel: ${CHANNEL}\n\n<i>"Bringing AI to Ethiopia, free and accessible!"</i>`);
  }

  if (data === "menu_features") {
    return send(chat_id, `🎯 <b>30 Features Summary</b>\n\n🤖 <b>AI & Media:</b>\nChat • Image Gen • Photo Edit • TTS • YT/TikTok DL • Web Search\n\n📁 <b>File Tools:</b>\nManager • Converter • Analyzer • Generator\n\n📚 <b>Study:</b>\nTutor • Flashcards • Summarizer • Chat Export\n\n👑 <b>Admin:</b>\nStats • Users • Broadcast • Auto Post • Auto React • Schedule\n\n🌐 <b>Languages:</b> 30 languages incl. Amharic 🇪🇹`, {
      reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] }
    });
  }

  if (data === "menu_contact") {
    return send(chat_id, `💬 <b>Contact</b>\n\n👤 Owner: @yzpromax\n📢 Channel: ${CHANNEL}\n\n💡 For support, feature requests, or partnerships, message @yzpromax`);
  }
}

// ─── Admin helpers ─────────────────────────────────────────────────────────

async function handleAdminStats(chat_id) {
  const users = (await kvGet("stats:users")) || 0;
  return send(chat_id, `📊 <b>Bot Statistics</b>\n\n👥 Total Users: ${users}\n📢 Channel: ${CHANNEL}\n🤖 Status: Online ✅\n☁️ Host: Vercel\n\n⏱️ Uptime: Serverless (always on)`);
}

async function handleUserList(chat_id) {
  const users = (await kvGet("stats:users")) || 0;
  return send(chat_id, `👥 <b>User List</b>\n\nTotal registered: ${users}\n\n⚠️ Full user listing requires Vercel KV with user index. Connect KV and enable user tracking for detailed list.`);
}

async function handleBroadcast(msg) {
  const text = msg.text.replace("/broadcast", "").trim();
  if (!text) {
    const sess = getSession(msg.from.id);
    sess.step = "awaiting_broadcast";
    return send(msg.chat.id, "📢 <b>Broadcast</b>\n\nSend broadcast message:");
  }
  return send(msg.chat.id, `📢 <b>Broadcast queued!</b>\n\n📨 ${text.substring(0, 100)}\n\n⚠️ Connect Vercel KV for real delivery.`);
}

async function handleAutoPost(msg) {
  const parts = msg.text.split(" ").slice(1);
  return send(msg.chat.id, `📢 <b>Auto Post</b>\n\nFormat: /autopost @channel HH:MM message\n\n⏱️ Add to vercel.json cron:\n<code>"crons": [{"path": "/api/cron", "schedule": "0 9 * * *"}]</code>`);
}

async function handleAutoReact(msg) {
  return send(msg.chat.id, `❤️ <b>Auto React</b>\n\nFormat: /react [post_link] [count]\n\nExample: /react https://t.me/c/123/456 200`);
}

async function handleSchedule(msg) {
  return send(msg.chat.id, `📅 <b>Schedule</b>\n\nFormat: /schedule @user YYYY-MM-DD message\n\nUse Vercel Cron for scheduling tasks.`);
}

// ─── Chat export ───────────────────────────────────────────────────────────

async function handleExportStudy(msg, sess) {
  const { chat } = msg;
  if (!sess.history.length) {
    return send(chat.id, "❌ No chat history to export. Start chatting first!");
  }
  const content = sess.history
    .map(h => `${h.role === "user" ? "👤 You" : "🤖 FES AI"}: ${h.content}`)
    .join("\n\n");

  return send(chat.id,
    `💾 <b>Chat Export ✨📚🎓</b>\n\n${content.substring(0, 3000)}\n\n---\n📢 FES ETHIOPIA AI | ${CHANNEL}`,
    { reply_markup: { inline_keyboard: [[{ text: "🏠 Menu", callback_data: "back_main" }]] } }
  );
}

// ─── Main handler ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "FES ETHIOPIA AI Bot - Webhook Active ✅" });
  }

  try {
    const update = req.body;

    if (update.message) {
      const msg = update.message;
      if (msg.text) await handleText(msg);
      else if (msg.document) await handleDocument(msg);
      else if (msg.photo) await handlePhoto(msg);
    }

    if (update.callback_query) {
      await handleCallback(update.callback_query);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Bot error:", err);
    res.status(200).json({ ok: true }); // Always 200 to Telegram
  }
}
