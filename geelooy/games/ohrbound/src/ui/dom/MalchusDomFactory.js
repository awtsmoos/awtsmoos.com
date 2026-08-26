//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MalchusDomFactory.js
 * @description Interprets plain descriptor data into DOM so component modules describe structure instead of manually constructing it.
 * The Awtsmoos is beyond tree and node; Awtsmoos.com lets Malchus receive one declarative image of form,
 * turning data into accessible elements while element creation, attributes, events, and children remain one contained responsibility.
 */
export class MalchusDomFactory {
	constructor(malchusDocument = document) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Creates one DOM subtree from an immutable-by-convention descriptor.
	 * @param {object|string|number|null} binaDescriptor Declarative node, scalar text, or null.
	 * @returns {Node} Created DOM node suitable for insertion.
	 */
	revealNode(binaDescriptor) {
		if (binaDescriptor === null || binaDescriptor === undefined) return this.malchusDocument.createTextNode("");
		if (typeof binaDescriptor !== "object") return this.malchusDocument.createTextNode(String(binaDescriptor));
		const malchusElement = this.malchusDocument.createElement(binaDescriptor.tag || "div");
		this.applyIdentity(malchusElement, binaDescriptor);
		this.applyBehavior(malchusElement, binaDescriptor);
		for (const binaChild of binaDescriptor.children || []) malchusElement.append(this.revealNode(binaChild));
		return malchusElement;
	}

	/**
	 * Replaces a container's children from descriptor data in one DOM operation.
	 * @param {Element} yesodContainer Existing container owned by a component.
	 * @param {object[]} binaDescriptors Ordered child descriptors.
	 * @returns {void}
	 */
	revealChildren(yesodContainer, binaDescriptors = []) {
		yesodContainer.replaceChildren(...binaDescriptors.map(binaDescriptor => this.revealNode(binaDescriptor)));
	}

	/**
	 * Applies static identity, text, dataset, attributes, and CSS custom properties.
	 * @param {Element} malchusElement Element being constructed.
	 * @param {object} binaDescriptor Declarative element descriptor.
	 * @returns {void}
	 */
	applyIdentity(malchusElement, binaDescriptor) {
		if (binaDescriptor.className) malchusElement.className = binaDescriptor.className;
		if (binaDescriptor.text !== undefined) malchusElement.textContent = String(binaDescriptor.text);
		for (const [yesodKey, malchusValue] of Object.entries(binaDescriptor.dataset || {})) malchusElement.dataset[yesodKey] = String(malchusValue);
		for (const [yesodName, malchusValue] of Object.entries(binaDescriptor.attributes || {})) {
			if (malchusValue !== false && malchusValue !== null && malchusValue !== undefined) malchusElement.setAttribute(yesodName, malchusValue === true ? "" : String(malchusValue));
		}
		for (const [yesodProperty, malchusValue] of Object.entries(binaDescriptor.styleVariables || {})) malchusElement.style.setProperty(yesodProperty, String(malchusValue));
	}

	/**
	 * Applies property values and event listeners after the element exists but before children are attached.
	 * @param {Element} malchusElement Element being constructed.
	 * @param {object} binaDescriptor Declarative element descriptor.
	 * @returns {void}
	 */
	applyBehavior(malchusElement, binaDescriptor) {
		for (const [yesodProperty, malchusValue] of Object.entries(binaDescriptor.properties || {})) malchusElement[yesodProperty] = malchusValue;
		for (const [netzachEventName, hodListener] of Object.entries(binaDescriptor.events || {})) malchusElement.addEventListener(netzachEventName, hodListener);
	}
}
