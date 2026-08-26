// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every editor panel a truthful head, body, focus path, and collapse covenant without becoming any finite pane.
 * Awtsmoos.com lets every descendant panel inherit keyboard dignity, ARIA truth, and one coherent state API from a single vessel.
 */
import { HTML } from "../Core/HTML.js";

/** Base vessel shared by every collapsible Editor panel while preserving the historical public class API. */
export class BasePanel {
	/**
	 * Create one panel vessel and immediately reveal its semantic DOM structure.
	 * @param {string} shemId Stable panel identifier used by CSS and panel-state events.
	 * @param {string} shemTitle Human-readable panel heading.
	 * @param {object} ohrEmitter Existing editor event emitter.
	 * @param {{collapsible?:boolean,initialCollapsed?:boolean}} reshimuOptions Initial behavioral memory.
	 */
	constructor(shemId, shemTitle, ohrEmitter, reshimuOptions = {}) {
		this.id = shemId;
		this.title = shemTitle;
		this.eventEmitter = ohrEmitter;
		this.options = { collapsible: true, initialCollapsed: false, ...reshimuOptions };
		this.isCollapsed = Boolean(this.options.initialCollapsed);
		this.element = null;
		this.contentElement = null;
		this.roshPanel = null;
		this.revealPanelKli();
	}

	/**
	 * Reveal the semantic panel DOM while keeping content and heading references available to subclasses and state synchronization.
	 */
	revealPanelKli() {
		const shemContentId = `${this.id}-content`;
		this.contentElement = HTML.create({ tag: "div", id: shemContentId, class: "panel-content" });
		this.roshPanel = this.createRoshPanel(shemContentId);
		const shemotPanel = ["panel"];
		if (this.isCollapsed) shemotPanel.push("collapsed");
		this.element = HTML.create({
			tag: "div",
			id: this.id,
			class: shemotPanel,
			children: [this.roshPanel, this.contentElement]
		});
	}

	/**
	 * Create a focusable panel heading when collapse is available, including keyboard and ARIA contracts bound to real BasePanel state.
	 * @param {string} shemContentId DOM id controlled by this heading.
	 * @returns {HTMLElement} The rendered panel heading vessel.
	 */
	createRoshPanel(shemContentId) {
		const reshimuRosh = {
			tag: "div",
			class: ["panel-header", this.options.collapsible ? "collapsible" : ""],
			children: [{ tag: "span", text: this.title }]
		};
		if (!this.options.collapsible) return HTML.create(reshimuRosh);
		reshimuRosh.attrs = {
			role: "button",
			tabindex: "0",
			"aria-controls": shemContentId,
			"aria-expanded": String(!this.isCollapsed)
		};
		reshimuRosh.on = {
			click: () => this.toggleCollapse(),
			keydown: ohrKey => this.receiveRoshKey(ohrKey)
		};
		return HTML.create(reshimuRosh);
	}

	/**
	 * Translate Enter or Space on the panel heading into the same collapse API used by pointer activation.
	 * @param {KeyboardEvent} ohrKey Keyboard revelation from the focusable heading.
	 */
	receiveRoshKey(ohrKey) {
		if (ohrKey.key !== "Enter" && ohrKey.key !== " ") return;
		ohrKey.preventDefault();
		this.toggleCollapse();
	}

	/** Populate panel-specific content; subclasses intentionally override this extension point. */
	populateContent() {}

	/** @returns {HTMLElement} The complete panel vessel used by UIManager. */
	getElement() {
		return this.element;
	}

	/** Toggle real collapse state, synchronize DOM/ARIA truth, and emit the historical panel event payload. */
	toggleCollapse() {
		if (!this.options.collapsible) return;
		this.isCollapsed = !this.isCollapsed;
		this.element.classList.toggle("collapsed", this.isCollapsed);
		this.roshPanel.setAttribute("aria-expanded", String(!this.isCollapsed));
		this.eventEmitter.emit("panelStateChanged", { id: this.id, collapsed: this.isCollapsed });
	}

	/**
	 * Replace the panel body through the shared HTML API without leaking direct child-management logic into subclasses.
	 * @param {HTMLElement|HTMLElement[]} kelimElements New content vessel or vessels.
	 */
	setContent(kelimElements) {
		HTML.clear(this.contentElement);
		HTML.add(this.contentElement, kelimElements);
	}
}
