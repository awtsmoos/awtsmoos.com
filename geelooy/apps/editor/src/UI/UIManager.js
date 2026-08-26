// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos orders many editor vessels without becoming any one panel, toolbar, timeline, or scene.
 * Awtsmoos.com preserves the historical UIManager API while revealing a smaller data-driven inner architecture.
 */
import { HTML } from "../Core/HTML.js";
import { ObjectTreePanel } from "./ObjectTreePanel.js";
import { PropertiesPanel } from "./PropertiesPanel.js";
import { TimelinePanel } from "./TimelinePanel.js";
import { Toolbar } from "./Toolbar.js";
import { SodMobilePanelCoordinator } from "./MobilePanelCoordinator.js";

/** Coordinate the editor's visible vessels while preserving its existing external construction contract. */
export class UIManager {
	/**
	 * Bind existing editor services to the UI vessel and immediately reveal the panel graph.
	 * @param {HTMLElement} kliContainer Root UI container receiving generated panels.
	 * @param {object} ohrEmitter Existing event emitter shared across editor domains.
	 * @param {object} olamObjectManager Existing scene-object service.
	 * @param {object} netzachTimelineManager Existing animation/timeline service.
	 * @param {object} gevurahTransformManager Existing transform service retained for compatibility.
	 * @param {object} chochmahHistoryManager Existing undo/redo history service.
	 */
	constructor(kliContainer, ohrEmitter, olamObjectManager, netzachTimelineManager, gevurahTransformManager, chochmahHistoryManager) {
		this.container = kliContainer;
		this.eventEmitter = ohrEmitter;
		this.objectManager = olamObjectManager;
		this.timelineManager = netzachTimelineManager;
		this.transformManager = gevurahTransformManager;
		this.historyManager = chochmahHistoryManager;
		this.kelim = {};
		this.panels = this.kelim;
		this.sodMobileCoordinator = null;
		this.initUI();
		console.log('B"H - UIManager Initialized');
	}

	/**
	 * Compatibility entry retained for callers that expect `initUI`, delegating to the clearer vessel-revelation flow.
	 */
	initUI() {
		this.revealKelim();
		this.bindMobileTzimtzum();
		this.seedInitialRevelation();
	}

	/**
	 * Rebuild the generated toolbar and three advanced panels in the same order as the historical implementation.
	 */
	revealKelim() {
		HTML.clear(this.container);
		this.kelim.toolbar = new Toolbar(this.eventEmitter, this.historyManager, this.objectManager);
		this.kelim.objectTree = new ObjectTreePanel(this.eventEmitter, this.objectManager);
		this.kelim.properties = new PropertiesPanel(this.eventEmitter, this.objectManager, this.timelineManager, this.historyManager);
		this.kelim.timeline = new TimelinePanel(this.eventEmitter, this.timelineManager);
		for (const kliPanel of [this.kelim.toolbar, this.kelim.objectTree, this.kelim.properties, this.kelim.timeline]) {
			HTML.add(this.container, kliPanel.getElement());
		}
	}

	/**
	 * Connect the existing BasePanel state API to one data-driven responsive covenant without touching editor-domain logic.
	 */
	bindMobileTzimtzum() {
		const kelimAdvanced = [
			{ shemId: "object-tree-panel", kliPanel: this.kelim.objectTree },
			{ shemId: "properties-panel", kliPanel: this.kelim.properties },
			{ shemId: "timeline-panel", kliPanel: this.kelim.timeline }
		];
		this.sodMobileCoordinator = new SodMobilePanelCoordinator(this.eventEmitter, kelimAdvanced);
		this.sodMobileCoordinator.connect();
	}

	/**
	 * Populate initial tree, timeline, and history-button truth after every visual vessel exists.
	 */
	seedInitialRevelation() {
		this.kelim.objectTree.updateTree(this.objectManager.getAllObjects());
		this.kelim.timeline.updateTimeline();
		this.kelim.toolbar.updateHistoryButtons({ canUndo: false, canRedo: false });
	}
}
