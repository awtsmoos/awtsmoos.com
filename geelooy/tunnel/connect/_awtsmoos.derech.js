// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file External-agent connect page (Yaakov 2026-10-12).
 * @description
 * The Awtsmoos gives strangers one short link instead of a heavy prompt.
 * GET /tunnel/connect — explainer (+ invite creation for owners).
 * GET /tunnel/connect?code=XXXX — redeem page for the invited agent.
 * GET /tunnel/connect?code=XXXX&format=json — machine-readable descriptor.
 */

const { query } = require("../../api/tunnel/control/core/request.js");
const { currentIdentity } = require("../../api/tunnel/control/core/auth.js");

function escapeHtml(value) {
	return String(value == null ? "" : value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function pageShell(title, inner) {
	return `<!DOCTYPE html>
<html lang="en" data-awt-connect>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — Awtsmoos Tunnel</title>
<style>
:root {
	--awt-bg: #0b0e14;
	--awt-surface: #121722;
	--awt-surface-2: #18202f;
	--awt-text: #eef2f9;
	--awt-muted: #9aa7bd;
	--awt-gold: #e8b93c;
	--awt-green: #3ddc84;
	--awt-red: #ff6b6b;
	--awt-cyan: #56c8f5;
	--awt-border: #26314a;
	--awt-radius: 14px;
	color-scheme: dark;
}
@media (prefers-color-scheme: light) {
	:root {
		--awt-bg: #f5f7fb;
		--awt-surface: #ffffff;
		--awt-surface-2: #eef1f7;
		--awt-text: #172033;
		--awt-muted: #5a6a86;
		--awt-border: #dde3ef;
		color-scheme: light;
	}
}
* { box-sizing: border-box; }
body {
	margin: 0;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
	background: var(--awt-bg);
	color: var(--awt-text);
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}
.card {
	width: 100%;
	max-width: 560px;
	background: var(--awt-surface);
	border: 1px solid var(--awt-border);
	border-radius: var(--awt-radius);
	padding: 32px;
	box-shadow: 0 24px 70px rgb(0 0 0 / 28%);
}
.brand {
	color: var(--awt-gold);
	font-weight: 700;
	letter-spacing: 0.14em;
	font-size: 13px;
	margin: 0 0 6px;
}
h1 { font-size: 26px; margin: 0 0 10px; line-height: 1.25; }
p { color: var(--awt-muted); line-height: 1.6; margin: 0 0 14px; }
p strong { color: var(--awt-text); }
.btn {
	display: inline-block;
	border: 1px solid transparent;
	border-radius: 10px;
	padding: 13px 26px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	background: var(--awt-gold);
	color: #1a1405;
	transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgb(232 185 60 / 30%); }
.btn:focus-visible { outline: 3px solid var(--awt-cyan); outline-offset: 2px; }
.btn:active { transform: translateY(0); box-shadow: none; }
.btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
.btn.secondary {
	background: transparent;
	color: var(--awt-text);
	border-color: var(--awt-border);
}
.btn.secondary:hover { border-color: var(--awt-cyan); box-shadow: 0 10px 28px rgb(86 200 245 / 18%); }
.code {
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	background: var(--awt-surface-2);
	border: 1px solid var(--awt-border);
	border-radius: 8px;
	padding: 10px 14px;
	word-break: break-all;
	font-size: 14px;
	color: var(--awt-text);
}
.row { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.hint { font-size: 13px; }
.error { color: var(--awt-red); font-weight: 600; }
.ok { color: var(--awt-green); font-weight: 600; }
.hidden { display: none; }
label { display: block; font-size: 13px; color: var(--awt-muted); margin: 12px 0 4px; }
input[type="text"] {
	width: 100%;
	padding: 11px 13px;
	border-radius: 10px;
	border: 1px solid var(--awt-border);
	background: var(--awt-surface-2);
	color: var(--awt-text);
	font-size: 15px;
}
input[type="text"]:focus { outline: 3px solid var(--awt-cyan); outline-offset: 1px; border-color: var(--awt-cyan); }
pre {
	background: var(--awt-surface-2);
	border: 1px solid var(--awt-border);
	border-radius: 8px;
	padding: 12px;
	overflow-x: auto;
	font-size: 13px;
	color: var(--awt-text);
}
.steps { counter-reset: step; padding: 0; list-style: none; }
.steps li { counter-increment: step; margin: 0 0 12px; padding-left: 34px; position: relative; color: var(--awt-muted); line-height: 1.55; }
.steps li::before {
	content: counter(step);
	position: absolute; left: 0; top: 1px;
	width: 24px; height: 24px; border-radius: 50%;
	background: var(--awt-surface-2);
	border: 1px solid var(--awt-border);
	color: var(--awt-gold);
	font-size: 13px; font-weight: 700;
	display: flex; align-items: center; justify-content: center;
}
.steps li strong { color: var(--awt-text); }
</style>
</head>
<body>
<main class="card">
${inner}
</main>
</body>
</html>`;
}

function machineJson($i, params, identity) {
	const code = String(params.code || "").trim();
	const payload = {
		BH: "B\"H",
		ok: true,
		page: "https://awtsmoos.com/tunnel/connect",
		code: code || null,
		flow: [
			"POST https://awtsmoos.com/api/tunnel/control/external-agent/invite/redeem with JSON {\"code\": \"YOUR_CODE\", \"agentName\": \"your-name\"}",
			"Use the returned apiKey as the x-awtsmoos-api-key header against https://awtsmoos.com/api/tunnel/control"
		],
		describe_endpoint: "https://awtsmoos.com/api/tunnel/control/external-agent/invite/describe",
		redeem_endpoint: "https://awtsmoos.com/api/tunnel/control/external-agent/invite/redeem",
		authenticated_owner: Boolean(identity && identity.ok)
	};
	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "application/json; charset=utf-8");
	$i.response.setHeader("Access-Control-Allow-Origin", "*");
	$i.response.setHeader("Cache-Control", "no-store");
	return { mimeType: "application/json", response: JSON.stringify(payload, null, 2) };
}

function ownerSection() {
	return `
		<h1>Invite an external agent</h1>
		<p>You are signed in as the tunnel owner. Mint a <strong>single-use connect link</strong>,
		send it to the agent (ChatGPT, Claude, anything), and it can connect itself —
		no huge prompt to copy.</p>
		<label for="invite-label">Label for this invite</label>
		<input type="text" id="invite-label" maxlength="120" placeholder="e.g. Claude research session" value="">
		<div class="row">
			<button class="btn" id="mint-btn" type="button">Create connect link</button>
		</div>
		<div id="mint-result" class="hidden" style="margin-top:18px">
			<p class="hint">Share this link. It works <strong>once</strong> and expires in one hour.</p>
			<div class="code" id="mint-link"></div>
			<div class="row">
				<button class="btn secondary" id="copy-link-btn" type="button">Copy link</button>
			</div>
		</div>
		<p class="hint" id="mint-error" role="alert"></p>
		<script>
		(function () {
			var btn = document.getElementById("mint-btn");
			var labelInput = document.getElementById("invite-label");
			var result = document.getElementById("mint-result");
			var linkEl = document.getElementById("mint-link");
			var errEl = document.getElementById("mint-error");
			btn.addEventListener("click", async function () {
				btn.disabled = true;
				errEl.textContent = "";
				try {
					var res = await fetch("/api/tunnel/control/external-agent/invite/create", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						credentials: "same-origin",
						body: JSON.stringify({ label: labelInput.value || "External agent" })
					});
					var data = await res.json();
					if (!data.ok) throw new Error(data.error || "mint failed");
					linkEl.textContent = data.url;
					result.classList.remove("hidden");
				} catch (e) {
					errEl.textContent = "Could not create the link: " + e.message;
				}
				btn.disabled = false;
			});
			document.getElementById("copy-link-btn").addEventListener("click", function () {
				var t = linkEl.textContent;
				if (navigator.clipboard) { navigator.clipboard.writeText(t); }
				this.textContent = "Copied";
				var self = this;
				setTimeout(function () { self.textContent = "Copy link"; }, 1500);
			});
		})();
		</script>`;
}

function guestSection() {
	return `
		<h1>Connect an external agent</h1>
		<p>An <strong>invite link</strong> from the tunnel owner connects an AI agent
		(ChatGPT, Claude, or anything that can fetch a URL) to this Awtsmoos tunnel
		in seconds — no huge prompt to copy.</p>
		<ol class="steps">
			<li><strong>Ask the owner</strong> for a connect link. It looks like<br>
				<span class="code">https://awtsmoos.com/tunnel/connect?code=XXXXXXXXXXXX</span></li>
			<li><strong>Open the link</strong> — in a browser or with curl.</li>
			<li><strong>Press Connect.</strong> The agent receives one scoped API key and is ready.</li>
		</ol>
		<p class="hint">Each link works <strong>once</strong> and expires within hours. Owners: sign in to mint links.</p>`;
}

function redeemSection(code) {
	const safe = escapeHtml(code);
	return `
		<h1>Connect this agent</h1>
		<p>This invite links an external agent to the Awtsmoos tunnel.
		Pressing <strong>Connect</strong> issues one scoped API key for it —
		the code is then spent and can never be reused.</p>
		<div id="invite-meta"><p class="hint">Checking the invite…</p></div>
		<div class="row">
			<button class="btn" id="connect-btn" type="button" disabled>Connect</button>
		</div>
		<div id="redeem-result" class="hidden" style="margin-top:18px">
			<p class="ok">Connected. Copy the API key now — it will not be shown again.</p>
			<div class="code" id="api-key"></div>
			<div class="row">
				<button class="btn secondary" id="copy-key-btn" type="button">Copy key</button>
			</div>
			<p class="hint">Use it as the <span class="code">x-awtsmoos-api-key</span> header:</p>
			<pre id="usage-snippet"></pre>
		</div>
		<p class="hint error" id="redeem-error" role="alert"></p>
		<script>
		(function () {
			var code = ${JSON.stringify(code)};
			var btn = document.getElementById("connect-btn");
			var meta = document.getElementById("invite-meta");
			var errEl = document.getElementById("redeem-error");
			fetch("/api/tunnel/control/external-agent/invite/describe?code=" + encodeURIComponent(code))
				.then(function (r) { return r.json(); })
				.then(function (d) {
					if (!d.ok) throw new Error("This invite is invalid, spent, or expired.");
					var exp = new Date(d.expiresAt);
					meta.innerHTML = "<p class=\\"hint\\">Invite <strong>" +
						d.label.replace(/</g, "&lt;") +
						"</strong> · scopes: " + d.scopes.join(", ") +
						" · expires " + exp.toLocaleString() + "</p>";
					btn.disabled = false;
				})
				.catch(function (e) { meta.innerHTML = "<p class=\\"error\\">" + e.message + "</p>"; });
			btn.addEventListener("click", async function () {
				btn.disabled = true;
				errEl.textContent = "";
				try {
					var name = "";
					try { name = (window.prompt("Agent name (optional):", "") || "").slice(0, 120); } catch (e) {}
					var res = await fetch("/api/tunnel/control/external-agent/invite/redeem", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ code: code, agentName: name || "external-agent" })
					});
					var data = await res.json();
					if (!data.ok) throw new Error(data.error === "invite_not_found"
						? "This invite is invalid, spent, or expired." : (data.error || "redeem failed"));
					document.getElementById("api-key").textContent = data.apiKey;
					document.getElementById("usage-snippet").textContent =
						"curl -H 'x-awtsmoos-api-key: " + data.apiKey + "' \\\\n" +
						"  https://awtsmoos.com/api/tunnel/control/me";
					document.getElementById("redeem-result").classList.remove("hidden");
					btn.textContent = "Connected";
				} catch (e) {
					errEl.textContent = e.message;
					btn.disabled = false;
				}
			});
			document.getElementById("copy-key-btn").addEventListener("click", function () {
				var t = document.getElementById("api-key").textContent;
				if (navigator.clipboard) { navigator.clipboard.writeText(t); }
				this.textContent = "Copied";
				var self = this;
				setTimeout(function () { self.textContent = "Copy key"; }, 1500);
			});
		})();
		</script>`;
}

async function connectPage($i) {
	const params = query($i) || {};
	const code = String(params.code || "").trim();
	const identity = (() => {
		try { return currentIdentity($i); } catch { return { ok: false }; }
	})();

	if (String(params.format || "").toLowerCase() === "json") {
		return machineJson($i, params, identity);
	}

	let inner;
	if (code) {
		inner = redeemSection(code);
	} else if (identity && identity.ok) {
		inner = ownerSection();
	} else {
		inner = guestSection();
	}
	inner = `<p class="brand">✦ AWTSMOOS TUNNEL</p>` + inner;

	$i.response.statusCode = 200;
	$i.response.setHeader("Content-Type", "text/html; charset=utf-8");
	$i.response.setHeader("Access-Control-Allow-Origin", "*");
	$i.response.setHeader("Cache-Control", "no-store");
	$i.response.setHeader("X-Robots-Tag", "noindex");
	return {
		mimeType: "text/html",
		response: pageShell(code ? "Connect an agent" : "External agent connect", inner)
	};
}

module.exports = {
	dynamicRoutes: async $i => {
		await $i.use("", async () => connectPage($i));
	}
};
