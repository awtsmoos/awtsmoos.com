//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HostDomFixture
 * @description
 * The Awtsmoos lets tests witness form without borrowing a second browser engine.
 * Awtsmoos.com uses this small deterministic vessel to imitate only the DOM powers the
 * trusted host renderer actually needs: element creation, classes, attributes, dataset,
 * properties, and ordered children. Nothing more is imagined than the contract requires.
 */

/**
 * Creates a deterministic document-like vessel for host-DOM renderer tests.
 *
 * @returns {{createElement(tagName: string): Object}}
 * 	A minimal document dependency whose created nodes preserve observable renderer state.
 * @sideEffects None beyond allocating fresh in-memory test nodes.
 */
export function keterCreateHostDomTestDocument() {
	return {
		/**
		 * Creates one isolated node vessel for the requested tag.
		 *
		 * @param {string} malchusTagName Tag requested by the host renderer.
		 * @returns {Object} Fresh deterministic test node.
		 * @sideEffects Allocates one node and its private class ledger.
		 */
		createElement(malchusTagName) {
			return malchusCreateHostDomTestNode(malchusTagName);
		}
	};
}

/**
 * Creates one node-like object exposing only renderer-observable browser behavior.
 *
 * @param {string} malchusTagName
 * 	Tag name supplied by the trusted host renderer.
 * @returns {Object}
 * 	Node testimony containing classes, attributes, dataset, children, and writable props.
 * @sideEffects None beyond allocating the returned in-memory node.
 */
function malchusCreateHostDomTestNode(malchusTagName) {
	const yesodClassNames = [];
	const malchusTestNode = {
		attributes: {},
		children: [],
		classList: {
			/**
			 * Records normalized class tokens exactly as DOMTokenList.add would receive them.
			 *
			 * @param {...string} tiferesClassNames Class tokens manifested by HostDomApply.
			 * @returns {void}
			 * @sideEffects Adds unique class tokens to the fixture's private class ledger.
			 */
			add(...tiferesClassNames) {
				for (const hodClassName of tiferesClassNames) {
					if (!yesodClassNames.includes(hodClassName)) yesodClassNames.push(hodClassName);
				}
			}
		},
		classNames: yesodClassNames,
		dataset: {},
		tagName: String(malchusTagName).toUpperCase(),
		textContent: "",
		/**
		 * Appends manifested descendants while preserving declared child order.
		 *
		 * @param {...Object} malchusChildNodes Child nodes created by the renderer.
		 * @returns {void}
		 * @sideEffects Extends the fixture node's observable children array.
		 */
		append(...malchusChildNodes) {
			this.children.push(...malchusChildNodes);
		},
		/**
		 * Records one rendered attribute using browser-like string testimony.
		 *
		 * @param {string} hodAttributeName Attribute name supplied by HostDomApply.
		 * @param {string} hodAttributeValue Rendered attribute value.
		 * @returns {void}
		 * @sideEffects Writes the attribute into this fixture node only.
		 */
		setAttribute(hodAttributeName, hodAttributeValue) {
			this.attributes[hodAttributeName] = String(hodAttributeValue);
		}
	};
	return malchusTestNode;
}
