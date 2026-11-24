//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Ask chat — the question vessel of the unified intelligence page.
 * The Awtsmoos gives every question its answer only through witnesses;
 * this module speaks to /ask/api and renders answers with their evidence.
 * Contract preserved from the original page: {query, session, sources} in,
 * {text, status, results, total, options, citations} out.
 */
"use strict";

const log = document.getElementById("log");
const form = document.getElementById("askbar");
const input = document.getElementById("input");
const go = document.getElementById("go");
const PAGE = 7;

/** One chat session id per page load: the engine's follow-up memory key. */
const SESSION = "s" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** True when the text is mostly Hebrew, for right-to-left rendering. */
function isHebrew(text) {
	const letters = String(text || "").replace(/[^א-תa-zA-Z]/g, "");
	if (!letters) return false;
	const hebrew = (String(text).match(/[א-ת]/g) || []).length;
	return hebrew / letters.length > 0.5;
}

function scrollEnd() {
	requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
}

function addBubble(kind, text) {
	const bubble = document.createElement("div");
	bubble.className = "msg " + kind;
	if (isHebrew(text)) bubble.dir = "rtl";
	bubble.textContent = text;
	log.append(bubble);
	scrollEnd();
	return bubble;
}

function bubbleText(data) {
	return data.text || data.answer || "The engine answered without words — status: " + (data.status || "unknown") + ".";
}

function statusLabel(status) {
	const labels = {
		"source-observed": "Verified source",
		"indexed-partial": "Partial archive — coverage is honest",
		"ikar-lineage-observed": "Lineage verified",
		"no-evidence": "No verified evidence yet",
		"degraded": "Engine degraded",
		"needs-question": "Ask a question"
	};
	return labels[status] || status || "";
}

/** Paged, keyboard-navigable explorer for one answer's result list. */
function buildExplorer(results, total) {
	let page = 0;
	let sel = 0;
	const pages = Math.max(1, Math.ceil(results.length / PAGE));
	const wrap = document.createElement("div");
	wrap.className = "explorer";
	wrap.tabIndex = 0;
	const bar = document.createElement("div");
	bar.className = "bar";
	const count = document.createElement("span");
	count.className = "count";
	count.textContent = total + " matching passage" + (total === 1 ? "" : "s");
	const hint = document.createElement("span");
	hint.className = "hint";
	hint.textContent = "↑ ↓ to browse · Enter opens the passage in the detail pane";
	bar.append(count, hint);
	const list = document.createElement("div");
	list.className = "list";
	const detail = document.createElement("div");
	detail.className = "detail";
	const pager = document.createElement("div");
	pager.className = "pager";
	const prev = document.createElement("button");
	prev.type = "button"; prev.textContent = "← Prev";
	const next = document.createElement("button");
	next.type = "button"; next.textContent = "Next →";
	const pinfo = document.createElement("span");
	pinfo.className = "pinfo";
	pager.append(prev, pinfo, next);
	wrap.append(bar, list, detail, pager);

	function snippetOf(r) {
		return String(r.he || r.en || r.text || "").replace(/\s+/g, " ").slice(0, 110);
	}
	function renderList() {
		list.innerHTML = "";
		const start = page * PAGE;
		results.slice(start, start + PAGE).forEach((r, i) => {
			const idx = start + i;
			const b = document.createElement("button");
			b.type = "button";
			b.className = "item";
			b.setAttribute("aria-selected", idx === sel ? "true" : "false");
			const n = document.createElement("span");
			n.className = "n"; n.textContent = idx + 1;
			const ref = document.createElement("span");
			ref.className = "ref"; ref.textContent = r.ref || r.id || "source";
			const snip = document.createElement("span");
			snip.className = "snip"; snip.textContent = snippetOf(r);
			if (isHebrew(snip.textContent)) snip.dir = "rtl";
			b.append(n, ref, snip);
			if (r.literal) {
				const lit = document.createElement("span");
				lit.className = "lit"; lit.textContent = "IN VERSE";
				b.append(lit);
			}
			if (typeof r.score === "number") {
				const score = document.createElement("span");
				score.className = "score"; score.textContent = r.score + "%";
				b.append(score);
			}
			b.onclick = () => { select(idx); wrap.focus(); };
			list.append(b);
		});
		pinfo.textContent = "Page " + (page + 1) + " of " + pages;
		prev.disabled = page <= 0;
		next.disabled = page >= pages - 1;
	}
	function renderDetail() {
		const r = results[sel];
		if (!r) { detail.textContent = ""; return; }
		detail.innerHTML = "";
		const dref = document.createElement("span");
		dref.className = "dref";
		dref.textContent = r.ref || r.id || "source";
		const body = document.createElement("span");
		body.textContent = r.he || r.en || r.text || "";
		if (isHebrew(body.textContent)) body.dir = "rtl";
		detail.append(dref, body);
		if (r.en && r.he) {
			const en = document.createElement("span");
			en.textContent = "\n\n" + r.en;
			detail.append(en);
		}
	}
	function select(idx) {
		sel = Math.max(0, Math.min(results.length - 1, idx));
		page = Math.floor(sel / PAGE);
		renderList(); renderDetail();
	}
	prev.onclick = () => { if (page > 0) { page--; sel = page * PAGE; renderList(); renderDetail(); } };
	next.onclick = () => { if (page < pages - 1) { page++; sel = page * PAGE; renderList(); renderDetail(); } };
	wrap.addEventListener("keydown", (e) => {
		if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
		else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
		else if (e.key === "PageDown") { e.preventDefault(); next.onclick(); }
		else if (e.key === "PageUp") { e.preventDefault(); prev.onclick(); }
	});
	renderList(); renderDetail();
	return wrap;
}

function addTurn(data) {
	const turn = document.createElement("div");
	turn.className = "turn";
	const bubble = document.createElement("div");
	bubble.className = "msg ai";
	const label = statusLabel(data.status);
	if (label) {
		const line = document.createElement("div");
		line.className = "status-line";
		line.textContent = label;
		bubble.append(line);
	}
	const body = document.createElement("span");
	body.textContent = bubbleText(data);
	if (isHebrew(body.textContent)) bubble.dir = "rtl";
	bubble.append(body);
	turn.append(bubble);
	if (data.citations && data.citations.length) {
		const cites = document.createElement("div");
		cites.className = "cites";
		data.citations.forEach((c) => {
			if (c.url) {
				const a = document.createElement("a");
				a.href = c.url; a.target = "_blank"; a.rel = "noopener";
				a.textContent = "✦ " + (c.ref || c.url);
				cites.append(a);
			} else if (c.ref) {
				const s = document.createElement("span");
				s.textContent = "✦ " + c.ref;
				cites.append(s);
			}
		});
		if (cites.childNodes.length) turn.append(cites);
	}
	if (data.options && data.options.length) {
		const row = document.createElement("div");
		row.className = "opts";
		const sendWord = (word) => {
			row.querySelectorAll("button").forEach((x) => { x.disabled = true; });
			input.value = word;
			form.requestSubmit();
		};
		data.options.forEach((o) => {
			const b = document.createElement("button");
			b.type = "button";
			b.textContent = o.word;
			b.onclick = () => sendWord(o.word);
			row.append(b);
		});
		const none = document.createElement("button");
		none.type = "button";
		none.textContent = "None of these";
		none.onclick = () => sendWord("none");
		row.append(none);
		turn.append(row);
	}
	if (data.results && data.results.length) turn.append(buildExplorer(data.results, data.total || data.results.length));
	log.append(turn);
	scrollEnd();
}

function autoSize() {
	input.style.height = "auto";
	input.style.height = Math.min(input.scrollHeight, 180) + "px";
}
input.addEventListener("input", autoSize);
input.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});

form.onsubmit = async (e) => {
	e.preventDefault();
	const q = input.value.trim();
	if (!q) return;
	input.value = "";
	autoSize();
	go.disabled = true;
	addBubble("user", q);
	const pending = addBubble("ai", "Searching the library…");
	try {
		const r = await fetch("/ask/api", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ query: q, session: SESSION, sources: window.ASK_SOURCES || null })
		});
		if (!r.ok) throw new Error("bad");
		const data = await r.json();
		pending.remove();
		addTurn(data);
	} catch (err) {
		pending.textContent = "Could not reach the engine. Please try again in a moment.";
	}
	go.disabled = false;
	input.focus();
};

document.getElementById("chips").addEventListener("click", (e) => {
	const b = e.target.closest("button");
	if (!b) return;
	input.value = b.textContent.trim();
	form.requestSubmit();
});

addBubble("ai", "Shalom! Ask me anything from the library — a person, a story, an idea, an exact reference. When I search, I bring the whole list of matches to browse, with the sources themselves. Try \u201cthe metal snake\u201d.");
