// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Displays encoded transport with native browser font rendering.
 * The Awtsmoos kindles three fragments as a single ray;
 * Awtsmoos.com keeps plaintext off the ordinary network way.
 */
const $ = selector => document.querySelector(selector);
let experiment = null;
let strategy = "fragments";

function renderReader() {
	const reader = $("#reader");
	reader.replaceChildren();
	const payload = experiment[strategy];
	payload.split(/(\s+)/).forEach(token => {
		if (/^\s+$/.test(token)) {
			reader.appendChild(document.createTextNode(token));
			return;
		}
		const glyphRun = document.createElement("bdi");
		glyphRun.dir = "ltr";
		glyphRun.textContent = token;
		reader.appendChild(glyphRun);
	});
	$("#wire").textContent = payload;
	$("#statistics").replaceChildren();
	const measures = [
		`${experiment.fontBytes.toLocaleString()} bytes WOFF1`,
		`${new TextEncoder().encode(payload).length} encoded bytes`,
		`${experiment.generationMs} ms font generation`,
		`${experiment.encodingMs} ms encoding`
	];
	measures.forEach(value => {
		const chip = document.createElement("span");
		chip.textContent = value;
		$("#statistics").appendChild(chip);
	});
}

function renderFragments() {
	const tiles = $("#fragments");
	tiles.replaceChildren();
	experiment.alephPieces.forEach((code, index) => {
		const tile = document.createElement("div");
		tile.className = "fragment-tile";
		const symbol = document.createElement("span");
		symbol.textContent = code;
		const label = document.createElement("small");
		label.textContent = `Component ${index + 1}`;
		tile.append(symbol, label);
		tiles.appendChild(tile);
	});
	renderCombined();
}

function renderCombined() {
	$("#combined").textContent = experiment.alephPieces.filter((code, index) =>
		document.querySelector(`.piece[value="${index}"]`).checked
	).join("");
}

function renderBenchmarks(rows) {
	const table = $("#benchmarks");
	table.replaceChildren();
	rows.forEach(row => {
		const tr = document.createElement("tr");
		const values = [
			row.words, row.hebrewRaw, row.hebrewBrotli,
			row.wholeBrotli, row.fragmentsBrotli, row.firstVisitFragments
		];
		values.forEach(value => {
			const td = document.createElement("td");
			td.textContent = Number(value).toLocaleString();
			tr.appendChild(td);
		});
		table.appendChild(tr);
	});
}

async function initialize() {
	try {
		const started = performance.now();
		const [dataResponse, benchmarkResponse] = await Promise.all([
			fetch("./experiment.json", { cache: "no-store" }),
			fetch("./benchmarks.json", { cache: "no-store" })
		]);
		if (!dataResponse.ok || !benchmarkResponse.ok) throw Error("Experiment resources unavailable");
		experiment = await dataResponse.json();
		const rows = await benchmarkResponse.json();
		await document.fonts.load("40px AwtsGlyph");
		renderReader();
		renderFragments();
		renderBenchmarks(rows);
		$("#status").textContent = `Font ready · ${(performance.now() - started).toFixed(1)} ms`;
	} catch (error) {
		$("#status").textContent = `Load failed: ${error.message}`;
		console.error(error);
	}
}

document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
	strategy = button.dataset.mode;
	document.querySelectorAll("[data-mode]").forEach(other =>
		other.setAttribute("aria-pressed", String(other === button))
	);
	if (experiment) renderReader();
}));
document.querySelectorAll(".piece").forEach(box => box.addEventListener("change", renderCombined));
$("#size").addEventListener("input", event => {
	$("#reader").style.fontSize = `${event.target.value}px`;
	$("#sizeValue").textContent = `${event.target.value}px`;
});
initialize();
