# Deploying ketoai.app on Render (free)

This app is a prerendered Vite/React frontend plus a small Express server. The
server does two jobs:

1. Serves the built frontend from `dist/` (in production).
2. Exposes `POST /api/generate-meal-plan`, which calls OpenAI/DeepSeek with the
   API key. The key cannot live in the browser, so the site needs a real server
   process — a static-only host (GitHub Pages, plain Netlify/Vercel static) is
   not enough on its own.

`render.yaml` defines a free Render Docker web service that runs the existing
`Dockerfile`. One service serves both the site and the API, so there is no
separate frontend, no CORS configuration, and no code changes needed.

## 1. Create the service

1. Sign in at <https://dashboard.render.com> with GitHub. Free web services do
   not require a credit card.
2. Click **New +** → **Blueprint**.
3. Connect the `alaber1969/keto-planner` repository. Render reads `render.yaml`
   from the repo root.
4. When prompted, paste your OpenAI API key into `OPENAI_API_KEY`. This is the
   same key that is in Railway's environment variables or your local `.env`.
5. Click **Apply**. The first build installs pnpm dependencies, type-checks,
   builds the frontend, and runs `scripts/prerender.cjs`; it can take several
   minutes.
6. Verify the temporary URL:
   - `https://<service-name>.onrender.com/` should render the site.
   - `https://<service-name>.onrender.com/api/health` should return
     `{"status":"ok","provider":"openai",...}`.

If the name `ketoai` is already taken on Render, change `name:` in
`render.yaml` to something unique (for example `ketoai-app`). The custom domain
is what visitors and search engines see, so the internal name does not matter.

## 2. Point ketoai.app at Render

1. In the Render dashboard: your service → **Settings** → **Custom Domains** →
   **Add Custom Domain** → `ketoai.app`.
   Render also adds `www.ketoai.app` and redirects `www` to the apex domain.
2. At your DNS provider, remove any `AAAA` records for these hostnames (Render
   uses IPv4), then add the records Render shows on that screen. Typically that
   is an `A`/`ALIAS` record for the apex and a `CNAME` for `www` — always use
   the exact values displayed in Render, since they are service-specific.
3. Click **Verify** in Render. TLS certificates are issued and renewed
   automatically.
4. Keep the Railway service running until `https://ketoai.app` serves the new
   deployment correctly, then delete the Railway service.

## 3. Keep the free instance awake (important)

Free Render web services sleep after 15 minutes without inbound traffic, and
the next request takes about a minute to wake. While asleep, Render answers
`/robots.txt` with a Disallow-all response, which can hurt search indexing.

Use a free uptime monitor to keep it warm:

1. Sign up at <https://uptimerobot.com> (free plan, no card).
2. Add an **HTTP(s)** monitor:
   - URL: `https://ketoai.app/api/health`
   - Interval: 5 minutes
3. Save and enable it.

The pings count as inbound traffic, so the service stays awake. Render gives
750 free instance-hours per workspace per month; one service running 24/7 uses
roughly 720–744, which fits. Do not add a second free web service to the same
workspace. If the allowance is exhausted, all free services pause until the
next month.

## 4. Environment variables

Set in Render → your service → **Environment** (the Blueprint already sets the
non-secret ones):

| Key | Value | Notes |
| --- | --- | --- |
| `OPENAI_API_KEY` | `sk-...` | Required. Secret — never commit it. |
| `LLM_PROVIDER` | `openai` | Default. `deepseek` is also supported. |
| `OPENAI_MODEL` | `gpt-4o-mini` | Default. |
| `RATE_LIMIT_PER_MIN` | `5` | Per-IP, in-memory. |
| `RATE_LIMIT_DAILY` | `30` | Per-IP, in-memory. |
| `CORS_ORIGIN` | optional | Comma-separated allowlist; only needed if the frontend is hosted on a different origin. Defaults to `https://ketoai.app,https://www.ketoai.app` in production. |

`PORT` is injected by Render. `NODE_ENV=production` is set both in the
Dockerfile and in `render.yaml`.

## 5. After the switch

- Test the calculator, a full meal-plan generation, the blog pages, and
  `https://ketoai.app/robots.txt`.
- The canonical URLs and structured data already point at `https://ketoai.app`,
  so no SEO changes are needed.
- Confirm the UptimeRobot monitor is green for a day before deleting Railway.
- The OpenAI calls themselves are not free — they are billed by OpenAI exactly
  as they were on Railway.

## Troubleshooting

- **Build fails**: open the Render build log. Most failures are dependency or
  lockfile issues during `pnpm install`; the Dockerfile pins Node 20 and pnpm 9.
- **Site returns 502 or times out**: the free instance may be waking up, or the
  process crashed. Check Render → **Logs**.
- **Site loads but AI generation fails**: check `/api/health`, then confirm
  `OPENAI_API_KEY` is set in Render and has available quota. Server logs include
  the provider error.
- **`robots.txt` shows `Disallow: /`**: the service is asleep. Enable/fix the
  UptimeRobot monitor, then request `/api/health` to wake it.
- **First request after idle takes ~1 minute**: expected on the free plan; the
  monitor above prevents this in normal operation.
- **Rollback**: Railway is untouched until you delete it; DNS can be pointed
  back while the old service still exists.

More detail: <https://render.com/docs/free> and
<https://render.com/docs/custom-domains>.
