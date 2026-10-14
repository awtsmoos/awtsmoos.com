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

/**
 * Builds the standalone approval page. pairingCode may be empty for the
 * manual-entry mode (user types the code from the installer's card).
 */
function pairingPageHtml({ pairingCode = "", returnPath = "" } = {}) {
	const code = String(pairingCode || "").trim().toUpperCase();
	const safeCode = esc(code);
	const safeReturn = esc(returnPath);
	const hasCode = code.length >= 4;

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a0e14">
<title>Approve this device? · Awtsmoos</title>
<style>
/* B"H — Yaakov 2026-10-14: MAGICAL STYLES! Beautiful, glowing, animated! */
:root{
	--bg:#0a0e14; --card:#101722; --line:#1f2b3d; --text:#e8f0fa;
	--dim:#8fa1b8; --green:#2fd47e; --green-dark:#178a4e; --red:#e05656;
	--gold:#d8a93f; --blue:#4da6ff; --purple:#9d4dff; --cyan:#4dd2ff;
}
*{box-sizing:border-box;border-radius:0;margin:0;padding:0}
html,body{height:100%}
body{
	background:linear-gradient(135deg, #0a0e14 0%, #0d1420 50%, #0a0e14 100%);
	background-size:200% 200%;
	animation:magicalBg 15s ease infinite;
	color:var(--text);
	font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
	display:flex; align-items:center; justify-content:center;
	padding:20px; -webkit-text-size-adjust:100%;
}
@keyframes magicalBg{
	0%,100%{background-position:0% 50%}
	50%{background-position:100% 50%}
}
/* B"H — Yaakov 2026-10-14: Floating magical stars! */
body::before{
	content:"✦ ✧ ⋆ ✩ ✶";
	position:fixed; top:10%; left:0; right:0; text-align:center;
	font-size:24px; letter-spacing:2em; color:rgba(77,166,255,.15);
	animation:floatStars 20s linear infinite; pointer-events:none;
}
body::after{
	content:"⋆ ✩ ✦ ✧ ✶";
	position:fixed; bottom:10%; left:0; right:0; text-align:center;
	font-size:18px; letter-spacing:3em; color:rgba(157,77,255,.12);
	animation:floatStars 25s linear infinite reverse; pointer-events:none;
}
@keyframes floatStars{
	0%{transform:translateX(-50px); opacity:.3}
	50%{opacity:.8}
	100%{transform:translateX(50px); opacity:.3}
}
.card{
	width:100%; max-width:430px; background:var(--card);
	border:1px solid var(--line); padding:34px 30px 30px;
	box-shadow:0 18px 60px rgba(0,0,0,.55), 0 0 40px rgba(77,166,255,.15);
	position:relative; overflow:hidden;
}
.card::before{
	content:""; position:absolute; top:0; left:-100%; width:100%; height:2px;
	background:linear-gradient(90deg, transparent, var(--cyan), var(--purple), transparent);
	animation:shimmer 3s linear infinite;
}
@keyframes shimmer{
	0%{left:-100%} 100%{left:100%}
}
.kicker{
	color:var(--green); font-size:11px; letter-spacing:.32em;
	font-weight:700; margin-bottom:14px;
}
h1{font-size:27px; line-height:1.25; margin-bottom:12px; font-weight:700}
p.sub{color:var(--dim); font-size:14px; line-height:1.65; margin-bottom:22px}
.codebox{
	background:#0a0f18; border:1px solid var(--line);
	padding:20px 12px; text-align:center; margin-bottom:22px;
}
.codebox .code{
	font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
	font-size:34px; font-weight:700; letter-spacing:.28em; color:var(--green);
	text-indent:.28em; word-break:break-all;
}
.btn{
	display:block; width:100%; padding:15px 12px; font-size:16px; font-weight:700;
	border:1px solid transparent; cursor:pointer; text-align:center;
	margin-bottom:10px; transition:all .2s ease;
	-webkit-tap-highlight-color:transparent;
}
.btn:active{transform:translateY(1px) scale(.98)}
.btn-approve{
	background:linear-gradient(135deg, var(--green), #25b86a);
	color:#06130b; border-color:var(--green);
	box-shadow:0 4px 20px rgba(47,212,126,.3);
}
.btn-approve:hover{
	background:linear-gradient(135deg, #45e292, var(--green));
	box-shadow:0 6px 30px rgba(47,212,126,.5);
	transform:translateY(-1px);
}
.btn-approve:disabled{background:var(--green-dark); border-color:var(--green-dark); color:#0a0e14; cursor:wait; opacity:.75; box-shadow:none; transform:none}
.btn-cancel{background:transparent; color:var(--dim); border-color:var(--line); margin-bottom:0}
.btn-cancel:hover{color:var(--text); border-color:var(--dim)}
.status{min-height:22px; font-size:13.5px; color:var(--dim); margin-top:14px; line-height:1.5}
.status.error{color:var(--red)}
.success{display:none; text-align:center; padding:8px 0 2px}
.success.show{display:block}
.check{
	width:74px; height:74px; margin:0 auto 18px; display:block;
}
.success h2{color:var(--green); font-size:24px; margin-bottom:8px}
.success p{color:var(--dim); font-size:14px; line-height:1.6}
.manual input{
	display:block; width:100%; background:#0a0f18; border:1px solid var(--line);
	color:var(--text); font-size:22px; padding:14px; text-align:center;
	font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
	letter-spacing:.2em; text-transform:uppercase; margin-bottom:12px;
}
.manual input:focus{outline:none; border-color:var(--green)}
.card .hidden{display:none}
</style>
</head>
<body>
<main class="card" id="card">
	<div class="kicker">B"H · SECURE DEVICE PAIRING</div>

	<div id="view-approve" class="${hasCode ? "" : "hidden"}">
		<h1>Approve this device?</h1>
		<p class="sub">A tunnel installer asked to link this device to your account. Approve only if you just ran the installer on your own machine.</p>
		<div class="codebox"><div class="code" id="code">${safeCode}</div></div>
		<button class="btn btn-approve" id="approve" type="button">Approve this device</button>
		<button class="btn btn-cancel" id="cancel" type="button">Cancel</button>
		<p class="status" id="status" role="status" aria-live="polite"></p>
	</div>

	<div id="view-manual" class="${hasCode ? "hidden" : ""}">
		<h1>Enter pairing code</h1>
		<p class="sub">The installer on your machine printed a short code. Type it here to approve that device.</p>
		<form class="manual" id="manual-form">
			<input id="manual-input" type="text" placeholder="e.g. 5MFYRTEW" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="16" aria-label="Pairing code">
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
		<h2>Device approved ✓</h2>
		<p>The tunnel is linking now. You can close this page — the installer will finish on its own.</p>
	</div>
</main>
<script>
(function(){
	"use strict";
	var approveBtn=document.getElementById("approve");
	var status=document.getElementById("status");
	var status2=document.getElementById("status2");
	var returnPath=${JSON.stringify(safeReturn)};
	function fail(el,msg){ el.textContent=msg; el.classList.add("error"); }
	async function approve(code,btn,statusEl){
		btn.disabled=true;
		statusEl.classList.remove("error");
		statusEl.textContent="Approving encrypted device identity…";
		var res, data=null;
		try{
			res=await fetch("/api/tunnel/control/pairing/approve",{
				method:"POST",
				headers:{"content-type":"application/json"},
				body:JSON.stringify({userCode:code})
			});
			try{ data=await res.json(); }catch(e){}
		}catch(e){
			btn.disabled=false;
			fail(statusEl,"Network error — check your connection and try again.");
			return;
		}
		if(res.status===401 || (data && data.error==="unauthorized")){
			var back=encodeURIComponent(location.pathname+location.search);
			location.href="/login?return="+back;
			return;
		}
		if(!data || !data.ok){
			btn.disabled=false;
			var msg=(data && data.message)||"This code was not recognized — it may have expired. Re-run the installer for a fresh code.";
			fail(statusEl,msg);
			return;
		}
		document.getElementById("view-approve").classList.add("hidden");
		document.getElementById("view-manual").classList.add("hidden");
		document.getElementById("view-success").classList.add("show");
	}
	if(approveBtn){
		var code=${JSON.stringify(code)};
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
