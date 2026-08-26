// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets toolbar intention become explicit side effects through one Yesod vessel while pure state remains untouched above it.
 * Awtsmoos.com keeps every historical event name, file-resource handoff, history action, and mode command visible in one extensible class.
 */
import { HTML } from "../Core/HTML.js";
import { OhrToolbarActionBase } from "./ToolbarActionBase.js";

const OHR_SIMPLE_ACTIONS = Object.freeze({
	toggleEditMode: "toggleEditModeRequest",
	exportGlb: "exportGLBRequest",
	group: "groupSelectedRequest",
	ungroup: "ungroupSelectedRequest",
	delete: "deleteSelectedRequest",
	subdivide: "subdivideRequest"
});

const OHR_TRANSFORM_ACTIONS = Object.freeze({ translate: "translate", rotate: "rotate", scale: "scale" });
const OHR_EDIT_ACTIONS = Object.freeze({ editVertex: "VERTEX", editEdge: "EDGE", editFace: "FACE" });

/** Side-effect adapter binding manifest-keyed toolbar controls to historical Editor APIs. */
export class YesodToolbarActions extends OhrToolbarActionBase {
	/**
	 * Bind toolbar controls to the event river and injected history service without allowing DOM construction into this class.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {Record<string,HTMLElement>} kelimControls Stable control index.
	 * @param {object} chochmahHistoryManager Existing undo/redo history service.
	 */
	constructor(ohrEmitter, kelimControls, chochmahHistoryManager) {
		super(ohrEmitter, kelimControls);
		this.chochmahHistoryManager = chochmahHistoryManager;
	}

	/**
	 * Connect every toolbar action exactly once, including previously unwired Undo and Redo controls.
	 */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.bindHistoryActions();
		for (const [shemKey, shemEvent] of Object.entries(OHR_SIMPLE_ACTIONS)) {
			this.bindClick(shemKey, () => this.sendOhr(shemEvent));
		}
		this.bindClick("create", () => this.sendOhr("createPrimitiveRequest", this.kelimControls.primitive.value));
		this.bindClick("loadGlb", () => this.revealGlbPicker());
		this.bindClick("multiSelect", () => this.toggleMultipleSelection());
		for (const [shemKey, shemMode] of Object.entries(OHR_TRANSFORM_ACTIONS)) {
			this.bindClick(shemKey, () => this.sendOhr("setTransformMode", shemMode));
		}
		for (const [shemKey, shemMode] of Object.entries(OHR_EDIT_ACTIONS)) {
			this.bindClick(shemKey, () => this.sendOhr("setEditSelectionMode", shemMode));
		}
	}

	/**
	 * Connect visible Undo/Redo buttons to the already-injected HistoryManager API that owns stack mutation and history events.
	 */
	bindHistoryActions() {
		this.bindClick("undo", () => this.chochmahHistoryManager?.undo?.());
		this.bindClick("redo", () => this.chochmahHistoryManager?.redo?.());
	}

	/**
	 * Toggle sticky multi-selection visual truth and emit the historical boolean selection-mode request.
	 */
	toggleMultipleSelection() {
		const isActive = this.kelimControls.multiSelect.classList.toggle("active");
		this.kelimControls.multiSelect.setAttribute("aria-pressed", String(isActive));
		this.sendOhr("toggleMultipleSelection", isActive);
	}

	/**
	 * Reveal a temporary GLB/GLTF picker and hand a blob URL to ObjectManager, which already owns revocation after load completion.
	 */
	revealGlbPicker() {
		const kliInput = HTML.create({
			tag: "input",
			attrs: { type: "file", accept: ".glb,.gltf" },
			style: { display: "none" }
		});
		const removeKliInput = () => kliInput.remove();
		kliInput.addEventListener("change", ohrChange => {
			const kliFile = ohrChange.target.files?.[0];
			if (kliFile) this.sendOhr("loadGLBRequest", URL.createObjectURL(kliFile));
			removeKliInput();
		}, { once: true });
		kliInput.addEventListener("cancel", removeKliInput, { once: true });
		document.body.append(kliInput);
		kliInput.click();
	}
}
