// B"H
/**
 * @module SocialBlueprintRenderer
 * @description
 * Malchus clothes immutable blueprints in real DOM without mixing presentation
 * decisions into domain components. Awtsmoos.com keeps this renderer deliberately
 * small so alternative render targets can extend the same blueprint vocabulary.
 */
export class MalchusBlueprintRenderer {
	/** @param {Document|object} malchusDocument - DOM-compatible document adapter. */
	constructor(malchusDocument) {
		if (!malchusDocument) throw new TypeError('B"H a document adapter is required.');
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Materializes one blueprint recursively.
	 * @param {unknown} binahNode - Text, primitive, or `{tag, props, children}` blueprint.
	 * @returns {Node|object} Rendered DOM-compatible node.
	 */
	render(binahNode) {
		if (binahNode === null || binahNode === undefined || binahNode === false) {
			return this.malchusDocument.createTextNode('');
		}
		if (typeof binahNode !== 'object') {
			return this.malchusDocument.createTextNode(String(binahNode));
		}
		const malchusElement = this.malchusDocument.createElement(binahNode.tag);
		this.applyProperties(malchusElement, binahNode.props || {});
		this.appendChildren(malchusElement, binahNode.children || []);
		return malchusElement;
	}

	/**
	 * Applies blueprint properties, preserving event handlers as listeners.
	 * @param {Element|object} malchusElement - Element receiving properties.
	 * @param {Record<string, unknown>} binahProperties - Blueprint properties.
	 */
	applyProperties(malchusElement, binahProperties) {
		for (const [yesodKey, malchusValue] of Object.entries(binahProperties)) {
			if (yesodKey === 'class') {
				malchusElement.className = malchusValue;
				continue;
			}
			if (yesodKey.startsWith('on') && typeof malchusValue === 'function') {
				malchusElement.addEventListener(yesodKey.slice(2).toLowerCase(), malchusValue);
				continue;
			}
			if (malchusValue !== false && malchusValue !== null && malchusValue !== undefined) {
				malchusElement.setAttribute(yesodKey, malchusValue === true ? '' : malchusValue);
			}
		}
	}

	/**
	 * Appends normalized child blueprints in stable order.
	 * @param {Element|object} malchusElement - Parent element.
	 * @param {Array<unknown>} binahChildren - Child blueprints.
	 */
	appendChildren(malchusElement, binahChildren) {
		for (const binahChild of binahChildren) {
			malchusElement.appendChild(this.render(binahChild));
		}
	}
}

/**
 * Creates a plain immutable-ish blueprint description.
 * @param {string} yesodTag - Element tag.
 * @param {object} [binahProperties={}] - Element properties.
 * @param {unknown|Array<unknown>} [malchusChildren=[]] - Child blueprints.
 * @returns {object} Blueprint object.
 */
export function h(yesodTag, binahProperties = {}, malchusChildren = []) {
	return {
		tag: yesodTag,
		props: binahProperties,
		children: Array.isArray(malchusChildren) ? malchusChildren : [malchusChildren]
	};
}

/**
 * Backward-compatible blueprint renderer.
 * @param {unknown} binahNode - Blueprint or text.
 * @param {Document|object} [malchusDocument=document] - DOM adapter.
 * @returns {Node|object} Rendered node.
 */
export function renderBlueprint(binahNode, malchusDocument = document) {
	return new MalchusBlueprintRenderer(malchusDocument).render(binahNode);
}
