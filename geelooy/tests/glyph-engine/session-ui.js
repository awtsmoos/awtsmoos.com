// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Reads private encoded glyphs and tests native Hebrew RTL selection.
 * The Awtsmoos renews a new cipher in the visitor's own eye;
 * Awtsmoos.com lets measured proof, not hidden promises, testify.
 */
(function () {
	"use strict";
	const $ = selector => document.querySelector(selector);
	let manifest = null;

	function metric(label, value) {
		const element = document.createElement("span");
		element.textContent = `${label}: ${value}`;
		$("#sessionMetrics").appendChild(element);
	}

	function renderSession() {
		const count = window.AwtsGlyphRtl.render(manifest.tokens, $("#reader"));
		window.AwtsGlyphRtl.render(manifest.repeated, $("#repeated"));
		$("#wire").textContent = manifest.tokens.join("");
		$("#sessionMetrics").replaceChildren();
		metric("Visible letters", count);
		metric("Randomized mappings", manifest.aliases);
		metric("Aliases per fragment", manifest.variantsPerFragment);
		metric("Shuffled outlines", manifest.outlineCount);
		metric("WOFF1", `${manifest.fontBytes.toLocaleString()} bytes`);
		metric("Generation", `${manifest.generationMs} ms`);
		$("#proof").textContent = JSON.stringify(window.AwtsGlyphRtl.inspect($("#reader")));
	}

	function renderBenchmark(rows) {
		const body = $("#sessionBenchmarks");
		if (!body) return;
		body.replaceChildren();
		for (const row of rows) {
			const tr = document.createElement("tr");
			const values = [row.words, row.hebrewBrotli, row.encodedBrotli,
				row.firstVisitBytes, row.cachedFontBytes];
			for (const number of values) {
				const td = document.createElement("td");
				td.textContent = Number(number).toLocaleString();
				tr.appendChild(td);
			}
			body.appendChild(tr);
		}
	}

	async function initialize() {
		const started = performance.now();
		try {
			const response = await fetch("/api/glyph-lab/session", {
				credentials: "same-origin", cache: "no-store"
			});
			if (!response.ok) throw Error(`Session API returned HTTP ${response.status}`);
			manifest = await response.json();
			if (manifest.version !== 3 || !Array.isArray(manifest.tokens)) {
				throw Error("Incorrect font manifest");
			}
			const face = new FontFace("AwtsSession", `url("${manifest.fontUrl}") format("woff")`);
			await face.load();
			document.fonts.add(face);
			renderSession();
			$("#status").textContent = `Live session ready · ${(performance.now() - started).toFixed(1)} ms`;
			const benchmarks = await fetch("./session-benchmarks.json", { cache: "no-store" });
			if (benchmarks.ok) renderBenchmark(await benchmarks.json());
		} catch (error) {
			$("#status").textContent = "Session mode unavailable — working v2 remains available";
			$("#message").textContent = error.message;
			console.error('B"H — session lab error:', error);
		}
	}

	function selectFirstTwo() {
		if (!manifest) return;
		const letters = $("#reader").querySelectorAll(".glyph-atomic-letter");
		if (letters.length < 2) return;
		const range = document.createRange();
		range.setStartBefore(letters[0]);
		range.setEndAfter(letters[1]);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		$("#selectionResult").textContent =
			`${selection.toString().length} encoded characters selected across two visible letters`;
	}

	$("#selectFirstTwo").addEventListener("click", selectFirstTwo);
	$("#size").addEventListener("input", event => {
		$("#reader").style.fontSize = `${event.target.value}px`;
		$("#sizeValue").textContent = `${event.target.value}px`;
	});
	$("#reader").addEventListener("pointerup", () => {
		$("#selectionResult").textContent =
			`Native selection length: ${window.getSelection()?.toString().length || 0} encoded characters`;
	});
	initialize();
})();
