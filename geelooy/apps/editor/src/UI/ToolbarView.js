// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets declarative toolbar data become semantic DOM without allowing rendering to absorb policy or side effects.
 * Awtsmoos.com keeps every control indexed by stable covenant keys so future tools can join the rail without string-surgery confusion.
 */
import { HTML } from "../Core/HTML.js";
import { OHR_TOOLBAR_SECTIONS } from "./ToolbarManifest.js";

/** Render the immutable toolbar manifest into locally styled Editor controls and a stable key-index. */
export class TiferesToolbarView {
	/**
	 * Build all toolbar sections immediately so the compatibility façade receives one complete visual vessel.
	 */
	constructor() {
		this.kelimControls = {};
		this.kliObjectSection = null;
		this.kliEditSection = null;
		this.kliCommonSection = null;
		this.kliToolbar = null;
		this.revealToolbar();
	}

	/**
	 * Reveal Object, Edit, and Common sections in the historical order while keeping Edit initially hidden.
	 */
	revealToolbar() {
		this.kliObjectSection = this.createSection(OHR_TOOLBAR_SECTIONS.object, false);
		this.kliEditSection = this.createSection(OHR_TOOLBAR_SECTIONS.edit, true);
		this.kliCommonSection = this.createSection(OHR_TOOLBAR_SECTIONS.common, false);
		this.kliToolbar = HTML.create({
			tag: "div",
			id: "toolbar",
			class: ["panel", "top"],
			attrs: { role: "toolbar", "aria-label": "Mitzvah World editor tools" },
			children: [this.kliObjectSection, this.kliEditSection, this.kliCommonSection]
		});
	}

	/**
	 * Create one toolbar section from declarative descriptors and optionally hide it until application mode changes.
	 * @param {readonly object[]} kelimDescriptors Immutable control descriptors.
	 * @param {boolean} isHidden Whether the section begins visually hidden.
	 * @returns {HTMLElement} Rendered toolbar section.
	 */
	createSection(kelimDescriptors, isHidden) {
		return HTML.create({
			tag: "div",
			class: "toolbar-section",
			style: isHidden ? { display: "none" } : {},
			children: kelimDescriptors.map(ohrDescriptor => this.createControl(ohrDescriptor))
		});
	}

	/**
	 * Materialize one descriptor into a separator, button, or select and index interactive controls by stable manifest key.
	 * @param {object} ohrDescriptor Toolbar manifest descriptor.
	 * @returns {HTMLElement} Rendered control vessel.
	 */
	createControl(ohrDescriptor) {
		if (ohrDescriptor.kind === "separator") {
			return HTML.create({ tag: "span", class: "separator", attrs: { "aria-hidden": "true" } });
		}
		const reshimuConfig = this.createControlConfig(ohrDescriptor);
		const kliControl = HTML.create(reshimuConfig);
		this.kelimControls[ohrDescriptor.key] = kliControl;
		return kliControl;
	}

	/**
	 * Convert one manifest descriptor into the HTML factory contract without attaching application behavior.
	 * @param {object} ohrDescriptor Toolbar manifest descriptor.
	 * @returns {object} HTML.create configuration.
	 */
	createControlConfig(ohrDescriptor) {
		const reshimuAttrs = {};
		if (ohrDescriptor.kind === "button") reshimuAttrs.type = "button";
		if (ohrDescriptor.title) reshimuAttrs.title = ohrDescriptor.title;
		if (ohrDescriptor.disabled) reshimuAttrs.disabled = true;
		const reshimuConfig = {
			tag: ohrDescriptor.kind,
			id: ohrDescriptor.id,
			class: ohrDescriptor.active ? "active" : "",
			attrs: reshimuAttrs
		};
		if (ohrDescriptor.kind === "button") reshimuConfig.text = ohrDescriptor.label;
		if (ohrDescriptor.kind === "select") {
			reshimuConfig.children = ohrDescriptor.options.map(shemOption => ({
				tag: "option",
				attrs: { value: shemOption },
				text: shemOption
			}));
		}
		return reshimuConfig;
	}
}
