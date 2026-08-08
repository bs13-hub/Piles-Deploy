/* Piles helper — Cloudflare Worker
 *
 * A tiny, stateless proxy that holds your Anthropic API key server-side so the
 * single-file app never has to. It exposes exactly two fixed actions — a leaked
 * URL can't be turned into general Claude access. Nothing is stored.
 *
 * Deploy: see proxy/README.md. Set ANTHROPIC_API_KEY as a Worker secret and put
 * your GitHub Pages origin in ALLOWED_ORIGINS below.
 */

const ALLOWED_ORIGINS = ["https://bs13-hub.github.io"]; // your Pages origin(s)
const MODEL = "claude-haiku-4-5";                        // cheap + fast; vision-capable for later
const MAX_TASKS = 100;                                   // hard cap per request

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(origin))
      return json({ error: "origin not allowed" }, 403, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "server not configured" }, 500, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }

    const action = body && body.action;
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, MAX_TASKS).map(s => String(s).slice(0, 200)) : [];
    if (!tasks.length) return json({ error: "no tasks" }, 400, cors);

    try {
      if (action === "estimate-durations") return json(await estimate(tasks, env), 200, cors);
      if (action === "suggest-groups")     return json(await group(tasks, env), 200, cors);
      return json({ error: "unknown action" }, 400, cors);
    } catch (e) {
      return json({ error: "upstream", detail: String((e && e.message) || e) }, 502, cors);
    }
  },
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : (ALLOWED_ORIGINS[0] || "*");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers });
}

async function anthropic(env, { system, user, schema, maxTokens }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens || 2048,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: { type: "json_schema", schema } },
    }),
  });
  if (!res.ok) throw new Error("anthropic " + res.status);
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  return JSON.parse(text);
}

async function estimate(tasks, env) {
  const schema = {
    type: "object", additionalProperties: false, required: ["estimates"],
    properties: {
      estimates: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["name", "minutes"],
          properties: { name: { type: "string" }, minutes: { type: "integer" } },
        },
      },
    },
  };
  const out = await anthropic(env, {
    system: "You estimate how many minutes a typical adult realistically needs for each short household or personal task. Be realistic, not optimistic — most people underestimate. Return an integer number of minutes for every task, echoing the task name exactly as given.",
    user: "Estimate minutes for each task:\n" + tasks.map(t => "- " + t).join("\n"),
    schema, maxTokens: 2048,
  });
  return {
    estimates: (out.estimates || []).map(e => ({
      name: String(e.name || ""),
      minutes: Math.max(1, Math.min(240, Math.round(Number(e.minutes) || 5))),
    })),
  };
}

async function group(tasks, env) {
  const schema = {
    type: "object", additionalProperties: false, required: ["groups"],
    properties: {
      groups: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["name", "taskNames"],
          properties: {
            name: { type: "string" },
            taskNames: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  };
  const out = await anthropic(env, {
    system: "You group short tasks into a few intuitive piles a person would instantly recognize (e.g. Errands, Kitchen, Desk work, Calls, Outside). Only group tasks that clearly belong together; leave loners ungrouped. Return at most 4 groups, each with a short 1–3 word name and the exact task names it contains, copied verbatim from the input.",
    user: "Group these tasks:\n" + tasks.map(t => "- " + t).join("\n"),
    schema, maxTokens: 2048,
  });
  return {
    groups: (out.groups || []).map(g => ({
      name: String(g.name || "Pile"),
      taskNames: (g.taskNames || []).map(String),
    })),
  };
}
