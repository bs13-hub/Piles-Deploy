# Piles helper (optional backend)

The Piles app is a single static file and works fully on its own. This folder
adds an **optional** helper that makes two things smarter by calling Claude:

- **✨ Tighten estimates** — sharper per-task durations than the keyword guesser.
- **✨ Suggest piles** — smarter grouping of The Dump than keyword matching.
- **📷 Screenshot intake** — snap or upload a screenshot of your list in another
  app (TickTick, Reminders, Notes) and the tasks drop into The Dump. You confirm
  the list before anything is added.

It's **additive**: until you deploy this and paste the URL into `index.html`,
the app behaves exactly as before (keyword estimates, keyword grouping). The
model never touches the timeline math or auto-acts — it only proposes, you tap.

`worker.js` is a Cloudflare Worker that holds your Anthropic API key
server-side (a public file can't) and exposes only three fixed actions. It's
stateless — no screenshots, tasks, or anything else is stored.

Model: `claude-haiku-4-5` (cheap + fast; ~$1 / $5 per million tokens). Real-world
use is cents per month.

---

## One-time setup (~15 min)

### 1. Get an Anthropic API key
Create one at the Anthropic Console and add a few dollars of credit.

### 2. Deploy the Worker
With the Cloudflare CLI (`npm i -g wrangler`, then `wrangler login`):

```sh
cd proxy
wrangler deploy worker.js --name piles-helper --compatibility-date 2024-11-01
wrangler secret put ANTHROPIC_API_KEY   # paste your key when prompted
```

(Or paste `worker.js` into the Cloudflare dashboard → Workers → Create, and add
`ANTHROPIC_API_KEY` under Settings → Variables → Secrets.)

You'll get a URL like `https://piles-helper.<you>.workers.dev`.

### 3. Lock it to your site
In `worker.js`, set `ALLOWED_ORIGINS` to your GitHub Pages origin
(default is `https://bs13-hub.github.io`). Re-deploy if you change it. This stops
anyone else's page from spending your key.

### 4. Point the app at it
In `index.html`, set the one constant near the top of the script:

```js
const PROXY_URL = "https://piles-helper.<you>.workers.dev";
```

Commit and push. The ✨ buttons appear on the Piles tab and the 📷 screenshot
option appears in the capture sheet. Leave `PROXY_URL` empty to turn the helper
off — the app falls straight back to keyword estimates, keyword grouping, and
typed/voice capture only.

---

## Notes
- **Privacy:** task names and screenshots pass through to Claude via the Worker
  to be processed, and are not stored. Anthropic's API does not train on API
  data. Screenshots are shrunk in the browser before upload, so a full-res photo
  never leaves the device.
- **Cost control:** the Worker caps each request at 100 tasks, ~5MB per image,
  and one Claude call. For heavier protection add a Cloudflare rate-limit rule
  or a KV counter.
