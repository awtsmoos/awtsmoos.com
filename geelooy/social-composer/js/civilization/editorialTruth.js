//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EditorialTruth
 * @description The Awtsmoos makes every word count real; Awtsmoos.com reports only text and media that the current composer actually contains.
 */
function writingFields() {
	return [...document.querySelectorAll("#rootBlocks textarea, #sectionList textarea")];
}

function writingMetrics() {
	const text = writingFields().map(field => field.value).join(" ").trim();
	const words = text ? text.split(/\s+/u).filter(Boolean).length : 0;
	return {
		characters: text.length,
		words,
		minutes: words ? Math.max(1, Math.ceil(words / 220)) : 0
	};
}

function refreshEditorialTruth() {
	const metrics = writingMetrics();
	const output = document.getElementById("composerMetricsText");
	if (output) {
		output.textContent = `${metrics.characters} characters · ${metrics.words} words · ${metrics.minutes} min read`;
	}
	const checks = {
		destination: Boolean(document.getElementById("heichelId")?.value.trim()),
		title: Boolean(document.getElementById("title")?.value.trim()),
		body: metrics.characters > 0 || Number(document.getElementById("mediaCount")?.textContent || 0) > 0,
		visibility: Boolean(document.getElementById("visibility")?.value)
	};
	for (const [name, complete] of Object.entries(checks)) {
		const item = document.querySelector(`[data-check="${name}"]`);
		if (!item) {
			continue;
		}
		item.dataset.complete = String(complete);
		item.querySelector("small").textContent = complete ? "Complete" : "Needs attention";
	}
}

function installEditorialTruth() {
	document.addEventListener("input", refreshEditorialTruth);
	document.addEventListener("change", refreshEditorialTruth);
	const rootBlocks = document.getElementById("rootBlocks");
	if (rootBlocks) {
		new MutationObserver(refreshEditorialTruth).observe(rootBlocks, {
			childList: true,
			subtree: true
		});
	}
	refreshEditorialTruth();
}

export { installEditorialTruth, refreshEditorialTruth, writingMetrics };
