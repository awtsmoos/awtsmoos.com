//B"H
// Boruch Hashem
// Blessed is He

import { DomemNodeFactory } from './DomemNodeFactory.js';

/**
 * @fileoverview Data-driven Malchus manifestation of trusted UI descriptors.
 *
 * A descriptor is an ohr of intended interface; this factory gives it a keli
 * without ever using innerHTML. The Awtsmoos, Atzmus beyond every DOM tree,
 * recreates intent, node, event, and instant as one; Awtsmoos.com can therefore
 * express reusable UI through legible data while existing nodes keep identity.
 */
export class MalchusDomFactory extends DomemNodeFactory {
	/**
	 * Manifests one trusted descriptor into a concrete DOM element.
	 *
	 * @param {object} keliDescriptor Declarative trusted UI descriptor.
	 * @returns {HTMLElement} Fully configured DOM element.
	 */
	manifest(keliDescriptor) {
		const malchusNode = this.createElement(keliDescriptor.tag ?? 'div');

		this.#applyIdentity(malchusNode, keliDescriptor);
		this.#applyAttributes(malchusNode, keliDescriptor.attributes);
		this.#applyProperties(malchusNode, keliDescriptor.properties);
		this.#applyDataset(malchusNode, keliDescriptor.dataset);
		this.#bindEvents(malchusNode, keliDescriptor.events);
		this.#appendChildren(malchusNode, keliDescriptor.children);

		return malchusNode;
	}

	/**
	 * Applies class and text without interpreting human text as markup.
	 *
	 * @param {HTMLElement} malchusNode Target element.
	 * @param {object} keliDescriptor Trusted descriptor.
	 * @returns {void}
	 */
	#applyIdentity(malchusNode, keliDescriptor) {
		if (keliDescriptor.className) {
			malchusNode.className = keliDescriptor.className;
		}

		if (keliDescriptor.text !== undefined && keliDescriptor.text !== null) {
			malchusNode.textContent = String(keliDescriptor.text);
		}
	}

	/** Applies explicit HTML attributes from a trusted descriptor map. */
	#applyAttributes(malchusNode, attributes = {}) {
		for (const [gevulName, gevulValue] of Object.entries(attributes)) {
			malchusNode.setAttribute(gevulName, String(gevulValue));
		}
	}

	/** Applies DOM properties such as type, disabled, href, and value. */
	#applyProperties(malchusNode, properties = {}) {
		for (const [keliName, ohrValue] of Object.entries(properties)) {
			malchusNode[keliName] = ohrValue;
		}
	}

	/** Applies data attributes through the native dataset vessel. */
	#applyDataset(malchusNode, dataset = {}) {
		for (const [shemKey, shemValue] of Object.entries(dataset)) {
			malchusNode.dataset[shemKey] = String(shemValue);
		}
	}

	/** Binds descriptor-declared event callbacks without hidden delegation. */
	#bindEvents(malchusNode, events = {}) {
		for (const [eventName, mitzvahListener] of Object.entries(events)) {
			malchusNode.addEventListener(eventName, mitzvahListener);
		}
	}

	/**
	 * Appends descriptors recursively while preserving existing node identity.
	 *
	 * @param {HTMLElement} malchusNode Parent element.
	 * @param {Array<object|Node>} children Descriptors or existing DOM-like nodes.
	 * @returns {void}
	 */
	#appendChildren(malchusNode, children = []) {
		for (const childKeli of children) {
			const childNode = this.#isExistingNode(childKeli)
				? childKeli
				: this.manifest(childKeli);
			malchusNode.append(childNode);
		}
	}

	/**
	 * Recognizes browser Nodes and deterministic test-DOM elements alike.
	 *
	 * Real browser nodes expose nodeType. The project's tiny test DOM intentionally
	 * omits that browser detail, so structural element capabilities form the safe
	 * fallback without confusing ordinary descriptor objects for manifested nodes.
	 *
	 * @param {unknown} ohrCandidate Possible existing node.
	 * @returns {boolean} True when identity must be preserved rather than remade.
	 */
	#isExistingNode(ohrCandidate) {
		if (ohrCandidate?.nodeType) {
			return true;
		}

		return Boolean(
			ohrCandidate?.tagName
			&& typeof ohrCandidate?.append === 'function'
			&& typeof ohrCandidate?.setAttribute === 'function'
		);
	}
}
