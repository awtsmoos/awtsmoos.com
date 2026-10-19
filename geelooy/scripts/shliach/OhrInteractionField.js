//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos lets a fine pointer move only the light, never the vessel;
* Awtsmoos.com keeps interaction responsive without spending a frame when nothing moves.
* @module OhrInteractionField
*/

const REACTIVE_SELECTOR = ".shliach-card, .shliach-logo-stage";

/**
* @param {Window} windowRoot Browser window used to test motion capability.
* @returns {boolean} Whether pointer light should run.
*/
function canUsePointerLight(windowRoot) {
	const finePointer = windowRoot.matchMedia?.("(pointer: fine)").matches;
	const reduceMotion = windowRoot.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	return Boolean(finePointer && !reduceMotion);
}

export class OhrInteractionField {
	/** @param {Document} documentRoot Document containing reactive vessels. */
	constructor(documentRoot = document) {
		this.documentRoot = documentRoot;
		this.windowRoot = documentRoot.defaultView ?? window;
		this.activeNode = null;
		this.activeRect = null;
		this.pendingPoint = null;
		this.frame = 0;
	}

	/** @returns {OhrInteractionField} Connected field. */
	connect() {
		if (!canUsePointerLight(this.windowRoot)) {
			return this;
		}
		this.nodes = [...this.documentRoot.querySelectorAll(REACTIVE_SELECTOR)];
		this.nodes.forEach((node) => {
			node.addEventListener("pointerenter", (event) => this.enter(event));
			node.addEventListener("pointermove", (event) => this.move(event));
			node.addEventListener("pointerleave", () => this.reset());
		});
		this.windowRoot.addEventListener("blur", () => this.reset());
		return this;
	}

	/** @param {PointerEvent} event Pointer entering one vessel. */
	enter(event) {
		this.activeNode = event.currentTarget;
		this.activeRect = this.activeNode.getBoundingClientRect();
		this.activeNode.dataset.shliachReactive = "active";
	}

	/** @param {PointerEvent} event Latest pointer position. */
	move(event) {
		if (event.currentTarget !== this.activeNode) {
			this.enter(event);
		}
		this.pendingPoint = { x: event.clientX, y: event.clientY };
		if (!this.frame) {
			this.frame = this.windowRoot.requestAnimationFrame(() => this.flush());
		}
	}

	/** Writes one normalized light position for the latest frame. */
	flush() {
		this.frame = 0;
		if (!this.activeNode || !this.activeRect || !this.pendingPoint) {
			return;
		}
		const clamp = (value) => Math.max(0, Math.min(100, value));
		const x = clamp(((this.pendingPoint.x - this.activeRect.left) / this.activeRect.width) * 100);
		const y = clamp(((this.pendingPoint.y - this.activeRect.top) / this.activeRect.height) * 100);
		this.activeNode.style.setProperty("--shliach-x", `${x.toFixed(1)}%`);
		this.activeNode.style.setProperty("--shliach-y", `${y.toFixed(1)}%`);
	}

	/** Returns the active vessel to its calm center. */
	reset() {
		if (this.frame) {
			this.windowRoot.cancelAnimationFrame(this.frame);
		}
		if (this.activeNode) {
			delete this.activeNode.dataset.shliachReactive;
			this.activeNode.style.setProperty("--shliach-x", "50%");
			this.activeNode.style.setProperty("--shliach-y", "50%");
		}
		this.frame = 0;
		this.activeNode = null;
		this.activeRect = null;
		this.pendingPoint = null;
	}
}
