//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Ask page panels — live coverage, lineage explorer, source choice.
 * The Awtsmoos hides nothing of the vessel's true measure;
 * these panels read the engine's own status actions and show them plainly.
 */
"use strict";

async function askAction(payload) {
	const r = await fetch("/ask/api", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	if (!r.ok) throw new Error("bad");
	return r.json();
}

/* ---- live coverage strip: honest counts from the engine itself ---- */
(async function loadCoverage() {
	const archiveNum = document.querySelector("#stat-archive .stat-num");
	const archiveNote = document.querySelector("#stat-archive .stat-note");
	const midNum = document.querySelector("#stat-midrash .stat-num");
	const midNote = document.querySelector("#stat-midrash .stat-note");
	try {
		const d = await askAction({ action: "index-status" });
		archiveNum.textContent = Number(d.indexed || 0).toLocaleString() + " / " + Number(d.total || 0).toLocaleString();
		archiveNote.textContent = "passages indexed · coverage complete: " + (d.complete ? "yes" : "not yet — still growing");
	} catch (e) {
		archiveNum.textContent = "—";
		archiveNote.textContent = "engine unreachable right now";
	}
	try {
		const d = await askAction({ action: "midrash-index-status" });
		const c = d.coverage || {};
		midNum.textContent = Number(c.activePosts || 0).toLocaleString() + " · " + Number(c.activePhrases || 0).toLocaleString();
		midNote.textContent = "posts · phrases indexed · complete corpus search: " + (d.completeCorpusSearch ? "yes" : "not yet");
	} catch (e) {
		midNum.textContent = "—";
		midNote.textContent = "engine unreachable right now";
	}
})();

/* ---- lineage explorer ---- */
const linform = document.getElementById("linform");
const linout = document.getElementById("linout");
linform.onsubmit = async (e) => {
	e.preventDefault();
	const seriesId = document.getElementById("lin-series").value.trim();
	const parentSeriesId = document.getElementById("lin-parent").value.trim();
	linout.innerHTML = "";
	const wait = document.createElement("p");
	wait.textContent = "Tracing through the public registry…";
	linout.append(wait);
	try {
		const d = await askAction({ action: "ikar-lineage", seriesId, parentSeriesId });
		linout.innerHTML = "";
		const chain = document.createElement("div");
		chain.className = "chain";
		(d.nodes || []).forEach((n, i) => {
			if (i > 0) {
				const arrow = document.createElement("span");
				arrow.className = "arrow";
				arrow.textContent = "→";
				chain.append(arrow);
			}
			const a = document.createElement("a");
			a.className = "node";
			a.href = n.url || ("https://awtsmoos.com/heichelos/ikar/series/" + encodeURIComponent(n.id));
			a.target = "_blank";
			a.rel = "noopener";
			a.textContent = n.id;
			chain.append(a);
		});
		linout.append(chain);
		const verdict = document.createElement("p");
		if (d.lineageVerified) {
			verdict.className = "verified";
			verdict.textContent = "✓ Lineage verified against the live public registry (authority version " + (d.authorityVersion ?? "—") + ").";
		} else {
			verdict.className = "unverified";
			verdict.textContent = "Lineage not verified: " + (d.status || "the registry did not affirm this chain") + ". Nothing here is guessed.";
		}
		linout.append(verdict);
	} catch (err) {
		linout.innerHTML = "";
		const p = document.createElement("p");
		p.className = "unverified";
		p.textContent = "Could not reach the lineage authority.";
		linout.append(p);
	}
};

/* ---- sources (which collections the engine draws from) ---- */
window.ASK_SOURCES = null;
try {
	const saved = JSON.parse(localStorage.getItem("askSources") || "null");
	if (Array.isArray(saved)) window.ASK_SOURCES = saved;
} catch (e) {}
const srcbtn = document.getElementById("srcbtn");
const sourcesEl = document.getElementById("sources");
const srclist = document.getElementById("srclist");
const srcnote = document.getElementById("srcnote");
let sourcesLoaded = false;
async function loadSources() {
	try {
		const data = await askAction({ action: "collections" });
		srclist.innerHTML = "";
		(data.collections || []).forEach((c) => {
			const lab = document.createElement("label");
			const cb = document.createElement("input");
			cb.type = "checkbox";
			cb.checked = !window.ASK_SOURCES || window.ASK_SOURCES.indexOf(c.id) >= 0;
			cb.onchange = () => {
				const boxes = srclist.querySelectorAll("input[type=checkbox]");
				window.ASK_SOURCES = [];
				boxes.forEach((b, i) => {
					if (b.checked) window.ASK_SOURCES.push((data.collections || [])[i].id);
				});
				try { localStorage.setItem("askSources", JSON.stringify(window.ASK_SOURCES)); } catch (e) {}
			};
			const name = document.createElement("span");
			name.textContent = c.name;
			const cnt = document.createElement("span");
			cnt.className = "cnt";
			cnt.textContent = c.records ? c.records.toLocaleString() + " passages" : "";
			lab.append(cb, name, cnt);
			srclist.appendChild(lab);
		});
		if (!(data.collections || []).length)
			srcnote.textContent = "The collection list is not available from the engine right now; answers draw on everything verifiable.";
		else if (data.indexer && data.indexer.lastPassAt)
			srcnote.textContent = "Last learned from the library: " + new Date(data.indexer.lastPassAt).toLocaleString();
		sourcesLoaded = true;
	} catch (e) {
		srcnote.textContent = "Could not load the source list.";
	}
}
srcbtn.onclick = () => {
	sourcesEl.classList.toggle("open");
	if (sourcesEl.classList.contains("open") && !sourcesLoaded) loadSources();
};
document.getElementById("relearn").onclick = async () => {
	srcnote.textContent = "Learning runs inside the engine's capacity gates; the request was noted.";
	try { await askAction({ action: "index" }); } catch (e) {}
};
