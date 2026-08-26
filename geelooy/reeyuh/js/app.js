// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unites data, navigation, and reading without making any one vessel pretend to be the whole;
 * Awtsmoos.com lets the learner see a simple page while the canonical Sefarim library quietly supplies the soul.
 */
import { KliReeyuhDom } from "./ReeyuhDom.js";
import { GevurahReeyuhNavigator } from "./ReeyuhNavigator.js";
import { TiferesReeyuhContentRenderer } from "./ReeyuhContentRenderer.js";
import { ReeyuhSefarimRepository } from "./ReeyuhSefarimRepository.js";

const dom = new KliReeyuhDom();
const repository = new ReeyuhSefarimRepository();
const renderer = new TiferesReeyuhContentRenderer(dom.content);
let currentSefer = null;

const navigator = new GevurahReeyuhNavigator(dom, portion => loadPortion(portion)).connect();

/** Reveal one selected real portion through the canonical section endpoint. */
async function loadPortion(portion) {
	if (!currentSefer) return;
	dom.setCurrentTitle(portion.name);
	dom.setStatus(`Loading ${portion.name}…`, "loading");
	try {
		const result = await repository.loadSection(currentSefer.id, portion.id);
		if (!result.available) {
			renderer.renderMessage("This section is not available in the current Sefarim dataset.");
			dom.setStatus("Section unavailable", "unavailable");
			return;
		}
		renderer.render(result.value);
		dom.setStatus(portion.name, "ready");
	} catch (error) {
		if (error?.name === "AbortError") return;
		renderer.renderMessage(error?.message || "This section could not be loaded.");
		dom.setStatus("Unable to load section", "error");
	}
}

/** Discover the actual corpus and actual portions instead of fabricating a fixed siman range. */
async function initialize() {
	dom.setStatus("Discovering Shulchan Aruch…", "loading");
	renderer.renderMessage("Connecting to the Sefarim library…");
	try {
		currentSefer = await repository.discoverShulchanAruch();
		if (!currentSefer) {
			renderer.renderMessage("Shulchan Aruch is not available in the current Sefarim dataset.");
			dom.setStatus("Corpus unavailable", "unavailable");
			return;
		}
		const portions = await repository.loadPortions(currentSefer.id);
		navigator.setPortions(portions);
		if (!portions.length) {
			renderer.renderMessage("This Shulchan Aruch corpus has no exposed sections yet.");
			dom.setStatus("No sections available", "unavailable");
			return;
		}
		dom.setStatus(`${portions.length} sections available`, "ready");
		await navigator.selectInitial();
	} catch (error) {
		if (error?.name === "AbortError") return;
		renderer.renderMessage(error?.message || "The Sefarim library could not be reached.");
		dom.setStatus("Library unavailable", "error");
	}
}

void initialize();
