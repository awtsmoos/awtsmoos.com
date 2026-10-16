// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Standalone instant-loading device pairing approval page.
 * @description
 * Yaakov 2026-10-14: the pairing approval URL must NOT load the entire
 * tunnel-control app. This is a single self-contained HTML page — inline
 * CSS, inline JS, zero external requests except the approve POST itself.
 * Loads in well under a second. Sharp corners, beautiful, done.
 */

function esc(value) {
	return String(value || "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/** Script-safe JSON for user-supplied query fields embedded in inline JavaScript. */
function scriptJson(value) {
	return JSON.stringify(String(value || ""))
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e")
		.replace(/&/g, "\\u0026")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

/**
 * Builds the standalone approval page. pairingCode may be empty for the
 * manual-entry mode (user types the code from the installer's card).
 */
function pairingPageHtml({ pairingCode = "", pairingId = "", returnPath = "" } = {}) {
	const code = String(pairingCode || "").trim().toUpperCase();
	const safeCode = esc(code);
	const displayCode = esc(code.length === 10 ? `${code.slice(0, 5)}-${code.slice(5)}` : code);
	const safeReturn = esc(returnPath);
	const safePairingId = String(pairingId || "");
	const hasCode = code.length >= 4;

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a111a">
<meta name="referrer" content="no-referrer">
<title>Approve this device? · Awtsmoos</title>
<style>
/* B"H: A single self-contained, fast, readable approval gate. */
:root { color-scheme:dark; --bg:#0a111a;--card:#121d2a;--line:#364757;--ink:#f4f8fa;--muted:#b9cbd4;--green:#49e69b;--red:#ff9c9c; }
* { box-sizing:border-box; }
html,body { min-height:100%;margin:0; }
body { background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:grid;place-items:center;padding:20px; }
.card { width:min(100%,420px);padding:28px;border:1px solid var(--line);border-radius:16px;background:var(--card);box-shadow:0 18px 50px #0004; }
.kicker { font-size:12px;font-weight:700;letter-spacing:.1em;color:var(--green);margin-bottom:16px; }
h1 { font-size:clamp(23px,6vw,29px);line-height:1.2;margin:0 0 12px; }
p.sub { color:var(--muted);font-size:14px;line-height:1.6;margin:0 0 20px; }
.codebox { padding:13px 10px;margin-bottom:18px;background:#09111a;border:1px solid var(--line);border-radius:10px;text-align:center; }
.code { color:var(--green);font:bold clamp(21px,5.5vw,30px)/1.4 ui-monospace,monospace;letter-spacing:.08em;overflow-wrap:anywhere; }
.btn { width:100%;padding:14px 12px;min-height:48px;border-radius:9px;border:1px solid var(--line);font:700 16px/1.25 system-ui,sans-serif;cursor:pointer;margin-bottom:10px; }
.btn-approve { background:var(--green);color:#052115;border-color:var(--green); }
.btn-approve:disabled { opacity:.65;cursor:wait; }
.btn-cancel { background:transparent;color:var(--muted); }
.btn:focus-visible,.manual input:focus-visible { outline:3px solid var(--green);outline-offset:3px; }
.status { min-height:20px;color:var(--muted);font-size:14px;line-height:1.5;margin:8px 0 0; }
.status.error { color:var(--red); }
.manual input { width:100%;min-height:48px;padding:12px;margin-bottom:12px;border:1px solid var(--line);border-radius:8px;background:#0a111a;color:var(--ink);font:20px ui-monospace,monospace;text-align:center;text-transform:uppercase; }
.success { display:none;text-align:center;padding:24px 2px 10px; }
.success.show { display:block; }
.check { width:72px;height:72px;display:block;margin:0 auto 16px; }
.success h2 { color:var(--green);font-size:25px;margin:0 0 8px; }
.success p { margin:0;color:var(--muted);font-size:14px;line-height:1.6; }
.card .hidden { display:none; }
@media (max-width:380px) { body {padding:12px;} .card {padding:20px;} }
@media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important;transition:none!important; } }
</style>
</head>
<body>
<main class="card" id="card">
	<div class="kicker">B"H · SECURE DEVICE PAIRING</div>

	<div id="view-approve" class="${hasCode ? "" : "hidden"}">
		<h1>Approve this device?</h1>
		<p class="sub">A tunnel installer asked to link this device to your account. Approve only if you just ran the installer on your own machine.</p>
		<div class="codebox"><div class="code" id="code">${displayCode}</div></div>
		<button class="btn btn-approve" id="approve" type="button">Approve this device</button>
		<button class="btn btn-cancel" id="cancel" type="button">Cancel</button>
		<p class="status" id="status" role="status" aria-live="polite"></p>
	</div>

	<div id="view-manual" class="${hasCode ? "hidden" : ""}">
		<h1>Enter pairing code</h1>
		<p class="sub">The installer on your machine printed a short code. Type it here to approve that device.</p>
		<form class="manual" id="manual-form">
			<input id="manual-input" type="text" placeholder="e.g. 5MFYRTEW" value="${safeCode}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="16" aria-label="Pairing code">
			<button class="btn btn-approve" type="submit">Continue</button>
			<button class="btn btn-cancel" id="cancel2" type="button">Cancel</button>
		</form>
		<p class="status" id="status2" role="status" aria-live="polite"></p>
	</div>

	<div class="success" id="view-success">
		<svg class="check" viewBox="0 0 74 74" fill="none" aria-hidden="true">
			<circle cx="37" cy="37" r="34" stroke="#2fd47e" stroke-width="4"/>
			<path d="M23 38.5 33 48l18-21" stroke="#2fd47e" stroke-width="5" stroke-linecap="square"/>
		</svg>
		<h2>Approved ✓</h2>
		<p>Approval saved. Return to the installer and wait for device registration to finish.</p>
	</div>
</main>
<script>
(function(){
	"use strict";
	var approveBtn=document.getElementById("approve");
	var status=document.getElementById("status");
	var status2=document.getElementById("status2");
	var returnPath=${scriptJson(safeReturn)};
	var pairingId=${scriptJson(safePairingId)};
	function fail(el,msg){ el.textContent=msg; el.classList.add("error"); }
	async function approve(code,btn,statusEl){
		btn.disabled=true;
		statusEl.classList.remove("error");
		statusEl.textContent="Checking your approval…";
		var res, data=null;
		try{
			res=await fetch("/api/tunnel/control/pairing/approve",{
				method:"POST",
				headers:{"content-type":"application/json"},
				body:JSON.stringify({userCode:code, pairingId:pairingId})
			});
			try{ data=await res.json(); }catch(e){}
		}catch(e){
			btn.disabled=false;
			fail(statusEl,"Network error — check your connection and try again.");
			return;
		}
		if(res.status===401 || (data && (data.error==="unauthorized" || data.error==="not_authenticated" || data.error==="authentication_required"))){
			var back=encodeURIComponent(location.pathname+location.search);
			location.href="/login/?next="+back;
			return;
		}
		if(!data || !data.ok){
			btn.disabled=false;
			var msg=(data && data.message)||(data && data.error ? "Approval failed: "+data.error : "Approval was not accepted. Check the code and try again.");
			fail(statusEl,msg);
			return;
		}
		document.getElementById("view-approve").classList.add("hidden");
		document.getElementById("view-manual").classList.add("hidden");
		document.getElementById("view-success").classList.add("show");
	}
	if(approveBtn){
		var code=${scriptJson(code)};
		approveBtn.addEventListener("click",function(){ approve(code,approveBtn,status); });
		document.getElementById("cancel").addEventListener("click",function(){
			location.href=returnPath || "/";
		});
	}
	var form=document.getElementById("manual-form");
	if(form){
		var input=document.getElementById("manual-input");
		form.addEventListener("submit",function(e){
			e.preventDefault();
			var c=String(input.value||"").trim().toUpperCase();
			if(c.length<4){ fail(status2,"Type the full code from your installer's approval card."); input.focus(); return; }
			location.href=location.pathname+"?pairingCode="+encodeURIComponent(c);
		});
		document.getElementById("cancel2").addEventListener("click",function(){
			location.href=returnPath || "/";
		});
		input.focus();
	}
})();
</script>
</body>
</html>`;
}

module.exports = { pairingPageHtml };
