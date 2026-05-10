# 🚀 FES ETHIOPIA AI BOT — Vercel Deployment Guide

## 📁 File Structure
```
fes_bot/
├── api/
│   ├── webhook.js    ← Main bot handler
│   └── cron.js       ← Auto-post scheduler
└── vercel.json       ← Vercel config
```

---

## ⚡ STEP 1 — Create Telegram Bot

1. Open Telegram → @BotFather
2. Send `/newbot`
3. Name: `FES ETHIOPIA AI`
4. Username: `FES_Ethiopia_AI_Bot`
5. Copy the **BOT_TOKEN**

---

## ☁️ STEP 2 — Deploy to Vercel

### Option A: Vercel CLI (from phone using Termux)
```bash
npm install -g vercel
cd fes_bot
vercel --prod
```

### Option B: GitHub + Vercel Dashboard
1. Upload files to GitHub repo
2. Go to vercel.com → Import repo
3. Deploy

---

## 🔑 STEP 3 — Set Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `BOT_TOKEN` | Your BotFather token | ✅ Yes |
| `OWNER_ID` | Your Telegram user ID | ✅ Yes |
| `SERPER_KEY` | serper.dev API key | Optional (web search) |
| `KV_REST_API_URL` | Upstash Redis URL | Optional (persistence) |
| `KV_REST_API_TOKEN` | Upstash Redis token | Optional (persistence) |
| `AUTO_POST_CHANNEL` | @YourChannel | Optional (cron posts) |
| `CRON_SECRET` | Random secret string | Optional (cron security) |
| `REMOVEBG_KEY` | remove.bg API key | Optional (BG removal) |

---

## 🔗 STEP 4 — Set Webhook

After deploying, set webhook with this URL:
```
https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-project.vercel.app/api/webhook
```

Or use this curl command:
```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-app.vercel.app/api/webhook"
```

---

## 💾 STEP 5 — Add Persistence (Upstash Redis — Free)

For user data, file library, and stats to persist:

1. Go to upstash.com → Create free Redis DB
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Add as `KV_REST_API_URL` and `KV_REST_API_TOKEN` in Vercel env vars

---

## 📢 STEP 6 — Add Bot to Channel

1. Go to @Free_Ethio_server_FES channel settings
2. Add bot as **Administrator**
3. Give: Post messages, Add members permissions

---

## 🧪 STEP 7 — Test

Send `/start` to your bot. You should see the 5x5 menu!

---

## 🌐 Free APIs Used (No Key Needed)

- **Pollinations AI** — AI Chat + Image Gen (free, no key)
- **Google TTS** — Text-to-Speech (free)

## 🔧 Optional Paid APIs

- **Serper.dev** — Web Search ($50/mo free tier = 2500 searches)
- **remove.bg** — Background removal (50 free/mo)
- **Upstash Redis** — Persistence (free tier: 10k requests/day)

---

## 👤 Owner: @yzpromax
## 📢 Channel: @Free_Ethio_server_FES
