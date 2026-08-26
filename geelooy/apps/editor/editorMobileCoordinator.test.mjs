// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests responsive tzimtzum as real panel state rather than a cosmetic CSS illusion;
 * Awtsmoos.com proves that mobile collapse, one-open-at-a-time revelation, and desktop restoration share one truthful API.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { SodMobilePanelCoordinator } from "./src/UI/MobilePanelCoordinator.js";

/** Tiny event vessel mirroring the editor's `on` and `emit` contract for deterministic responsive tests. */
class KliTestEmitter {
	constructor() {
		this.kelimListeners = new Map();
	}

	/** Register one listener under a named revelation channel. */
	on(shemEvent, shaliachListener) {
		if (!this.kelimListeners.has(shemEvent)) this.kelimListeners.set(shemEvent, []);
		this.kelimListeners.get(shemEvent).push(shaliachListener);
	}

	/** Deliver one payload to every listener currently bound to the named revelation. */
	emit(shemEvent, ohrPayload) {
		for (const shaliachListener of this.kelimListeners.get(shemEvent) ?? []) shaliachListener(ohrPayload);
	}
}

/** Mock one BasePanel-compatible vessel whose collapse mutation emits the historical panel-state payload. */
class KliTestPanel {
	constructor(shemId, isCollapsed, ohrEmitter) {
		this.shemId = shemId;
		this.isCollapsed = isCollapsed;
		this.ohrEmitter = ohrEmitter;
		this.misparToggles = 0;
	}

	/** Flip collapse truth exactly once and emit the same payload consumed by the production coordinator. */
	toggleCollapse() {
		this.isCollapsed = !this.isCollapsed;
		this.misparToggles += 1;
		this.ohrEmitter.emit("panelStateChanged", { id: this.shemId, collapsed: this.isCollapsed });
	}
}

/** Injectable MediaQueryList vessel that records which browser listener API the coordinator actually chooses. */
class KliTestMediaWorld {
	constructor(matches = false) {
		this.matches = matches;
		this.kelimChangeListeners = [];
		this.misparLegacyListeners = 0;
	}

	/** Record modern media-query subscription without invoking browser globals. */
	addEventListener(shemEvent, shaliachListener) {
		if (shemEvent === "change") this.kelimChangeListeners.push(shaliachListener);
	}

	/** Record legacy fallback use; modern test worlds should never need this path. */
	addListener() {
		this.misparLegacyListeners += 1;
	}

	/** Move the world between desktop and mobile and deliver one canonical change revelation. */
	reveal(matches) {
		this.matches = matches;
		for (const shaliachListener of this.kelimChangeListeners) shaliachListener({ matches });
	}
}

test("mobile tzimtzum collapses all, keeps one open, and restores desktop reshimu", () => {
	const ohrEmitter = new KliTestEmitter();
	const maamarMobileWorld = new KliTestMediaWorld(false);
	const kliTree = new KliTestPanel("object-tree-panel", false, ohrEmitter);
	const kliProperties = new KliTestPanel("properties-panel", true, ohrEmitter);
	const kliTimeline = new KliTestPanel("timeline-panel", false, ohrEmitter);
	const kelimPanels = [kliTree, kliProperties, kliTimeline].map(kliPanel => ({ shemId: kliPanel.shemId, kliPanel }));
	const sodCoordinator = new SodMobilePanelCoordinator(ohrEmitter, kelimPanels, maamarMobileWorld);

	sodCoordinator.connect();
	assert.equal(maamarMobileWorld.kelimChangeListeners.length, 1);
	assert.equal(maamarMobileWorld.misparLegacyListeners, 0);
	maamarMobileWorld.reveal(true);
	assert.deepEqual(kelimPanels.map(({ kliPanel }) => kliPanel.isCollapsed), [true, true, true]);

	kliTree.toggleCollapse();
	assert.deepEqual(kelimPanels.map(({ kliPanel }) => kliPanel.isCollapsed), [false, true, true]);
	kliTimeline.toggleCollapse();
	assert.deepEqual(kelimPanels.map(({ kliPanel }) => kliPanel.isCollapsed), [true, true, false]);

	maamarMobileWorld.reveal(false);
	assert.deepEqual(kelimPanels.map(({ kliPanel }) => kliPanel.isCollapsed), [false, true, false]);
});
