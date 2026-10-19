// B"H
/**
 * @file Renders encoded private-use glyphs and exposes measured extraction risks.
 * The Awtsmoos creates a letter out of many veils of light;
 * Awtsmoos.com displays both the wonder and the limits of sight.
 */
const $ = selector => document.querySelector(selector);
let experiment = null;
let mode = "fragments";

function measure(label, value) {
	const chip = document.createElement("span");
	chip.textContent = `${label}: ${value}`;
	$("#statistics").appendChild(chip);
}
function renderReader() {
	const reader = $("#reader");
	reader.replaceChildren();
	const payload = experiment[mode];
	payload.split(/(\s+)/).forEach(token => {
		if (/^\s+$/.test(token)) {
			reader.appendChild(document.createTextNode(token));
			return;
		}
		const run = document.createElement("bdi");
		run.dir = "ltr";
		run.textContent = token;
		reader.appendChild(run);
	});
	$("#wire").textContent = payload;
	$("#statistics").replaceChildren();
	measure("Hebrew glyphs split", experiment.fragmentedLetters || 1);
	measure("Independent outlines", experiment.fragmentGlyphs);
	measure("Randomized aliases", experiment.aliases);
	measure("Aliases per part", experiment.alternativesPerFragment || 1);
	measure("WOFF1", `${experiment.fontBytes.toLocaleString()} bytes`);
	measure("Encoded payload", `${new TextEncoder().encode(payload).length} bytes`);
}
function renderFragments() {
	$("#fragments").replaceChildren();
	experiment.alephPieces.forEach((code, index) => {
		const tile = document.createElement("div");
		tile.className = "fragment-tile";
		const symbol = document.createElement("span");
		symbol.textContent = code;
		const name = document.createElement("small");
		name.textContent = `Independent part ${index + 1}`;
		tile.append(symbol, name);
		$("#fragments").appendChild(tile);
	});
	renderCombined();
}
function renderCombined() {
	$("#combined").textContent = experiment.alephPieces.filter((code, index) =>
		document.querySelector(`.piece[value="${index}"]`).checked
	).join("");
}
function renderBenchmarks(rows) {
	$("#benchmarks").replaceChildren();
	rows.forEach(row => {
		const tr = document.createElement("tr");
		[row.words,row.hebrewRaw,row.hebrewBrotli,row.wholeBrotli,row.fragmentsBrotli,row.firstVisitFragments]
			.forEach(number => {
				const cell = document.createElement("td");
				cell.textContent = Number(number).toLocaleString();
				tr.appendChild(cell);
			});
		$("#benchmarks").appendChild(tr);
	});
}
function renderThreat() {
	$("#threat").textContent = [
		`Version ${experiment.version || 1} uses ${experiment.fragmentGlyphs} downloadable outlines`,
		`${experiment.aliases} observable codepoint mappings`,
		experiment.fontExtractionThreat || "Glyphs may be extracted from the font",
		experiment.wordBoundaryThreat || "Whitespace remains visible"
	].join(". ");
}
async function initialize() {
	try {
		const start = performance.now();
		const responses = await Promise.all([
			fetch("./experiment.json", { cache: "no-store" }),
			fetch("./benchmarks.json", { cache: "no-store" })
		]);
		if (responses.some(response => !response.ok)) throw Error("Experiment resources unavailable");
		experiment = await responses[0].json();
		const benchmarks = await responses[1].json();
		await document.fonts.load("40px AwtsGlyph");
		renderReader();
		renderFragments();
		renderBenchmarks(benchmarks);
		renderThreat();
		$("#status").textContent = `Font ready · ${(performance.now() - start).toFixed(1)} ms`;
	} catch (error) {
		$("#status").textContent = `Load failed: ${error.message}`;
		console.error(error);
	}
}
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => {
	mode = button.dataset.mode;
	document.querySelectorAll("[data-mode]").forEach(item =>
		item.setAttribute("aria-pressed", String(item === button))
	);
	if (experiment) renderReader();
}));
document.querySelectorAll(".piece").forEach(checkbox =>
	checkbox.addEventListener("change", renderCombined)
);
$("#size").addEventListener("input", event => {
	$("#reader").style.fontSize = `${event.target.value}px`;
	$("#sizeValue").textContent = `${event.target.value}px`;
});
initialize();
