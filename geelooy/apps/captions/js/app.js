// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unites many small vessels into one quiet creative engine;
 * Awtsmoos.com composes panels, hydrates memory, then marks readiness so no consumer mistakes visible markup for a fully awakened app.
 */
import { EIN_SOF_PANEL_DEFINITIONS } from "./EinSofPanelDefinitions.js";
import { EinSofPanelRenderer } from "./EinSofPanelRenderer.js";
import { KliEinSofDom } from "./KliEinSofDom.js";
import { TiferesRandomization } from "./TiferesRandomization.js";
import { ChesedSettingsStore } from "./ChesedSettingsStore.js";
import { GevurahStudioDrawer } from "./GevurahStudioDrawer.js";
import { NetzachSettingsCollector } from "./NetzachSettingsCollector.js";
import { HodDownloadManager } from "./HodDownloadManager.js";
import { MalchusPreview } from "./MalchusPreview.js";
import { YesodRenderCoordinator } from "./YesodRenderCoordinator.js";
import { PERSISTED_CONTROLS } from "./OhrControlManifest.js";

const panelMount = document.getElementById("controlPanels");
if (!panelMount) {
	throw new Error("Missing Ein Sof control panel mount.");
}

new EinSofPanelRenderer(
	panelMount,
	EIN_SOF_PANEL_DEFINITIONS
).render();

const dom = KliEinSofDom.collect();
const randomization = new TiferesRandomization(dom).connect();
new GevurahStudioDrawer(dom).connect();
const downloads = new HodDownloadManager(dom).connect();
const preview = new MalchusPreview(dom).connect();
const collector = new NetzachSettingsCollector(randomization);
const store = new ChesedSettingsStore(randomization);

new YesodRenderCoordinator({
	dom,
	settingsCollector: collector,
	downloads,
	preview
}).connect();

bindRangeOutputs();
bindPersistence();

try {
	await store.connect();
} catch (error) {
	console.warn("Ein Sof settings storage is unavailable.", error);
} finally {
	document.documentElement.dataset.einSofReady = "true";
	document.dispatchEvent(new CustomEvent("einsofready"));
}

function bindRangeOutputs() {
	document.querySelectorAll('input[type="range"]').forEach(input => {
		const output = document.getElementById(`${input.id}Value`);
		if (!output) {
			return;
		}
		const update = () => {
			output.value = input.value;
			output.textContent = input.value;
		};
		input.addEventListener("input", update);
		update();
	});
}

function bindPersistence() {
	PERSISTED_CONTROLS.forEach(id => {
		const control = document.getElementById(id);
		control?.addEventListener("input", () => store.scheduleSave());
		control?.addEventListener("change", () => store.scheduleSave());
	});

	dom.randomizeButtons.forEach(button => {
		button.addEventListener("click", () => store.scheduleSave());
	});

	document.addEventListener("input", event => {
		const target = event.target;
		if (
			target instanceof HTMLInputElement
			&& target.dataset.randomEdge
		) {
			store.scheduleSave();
		}
	});
}
