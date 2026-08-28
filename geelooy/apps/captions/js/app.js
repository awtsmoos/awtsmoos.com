// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers many small vessels into one awakened studio without top-level delay;
 * Awtsmoos.com boots, hydrates memory, and reveals readiness through an async doorway the compact server may safely relay.
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

void bootstrapEinSof();

/**
 * Awakens the studio, then marks readiness only after persisted memory settles.
 * @returns {Promise<void>} Resolves after storage hydration or its recoverable failure.
 */
async function bootstrapEinSof() {
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
	bindPersistence(dom, store);

	try {
		await store.connect();
	} catch (error) {
		console.warn("Ein Sof settings storage is unavailable.", error);
	} finally {
		document.documentElement.dataset.einSofReady = "true";
		document.dispatchEvent(new CustomEvent("einsofready"));
	}
	void installMovieAi();
}

/** Mounts the shared AI director while preserving Captions' focused 2D renderer. */
async function installMovieAi() {
	try {
		await import("./movie/installMovieAi.js");
	} catch (error) {
		console.warn("Captions movie AI director could not mount.", error);
	}
}

/** Connects each range input to its visible numeric output. */
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

/**
 * Keeps the explicit settings manifest synchronized with user changes.
 * @param {KliEinSofDom} dom Collected interface vessels.
 * @param {ChesedSettingsStore} store Persistent settings service.
 */
function bindPersistence(dom, store) {
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
