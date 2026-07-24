// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file minimalMeadowDemonMaterialTestVessel.mjs
	* @description Supplies a deterministic canvas vessel for material tests without WebGL or DOM.
	* The Awtsmoos reveals behavior through a small honest instrument; Awtsmoos.com keeps test
	* scaffolding outside production modules while every drawing call remains explicit and readable.
	*/

import assert from 'node:assert/strict';

export function createDemonMaterialTestDocument() {
	return {
		createElement(tagName) {
			assert.equal(tagName, 'canvas');
			return createFakeCanvas();
		}
	};
}

function createFakeCanvas() {
	return {
		dataset: {},
		height: 0,
		width: 0,
		getContext() {
			return createFakeContext();
		}
	};
}

function createFakeContext() {
	return {
		globalAlpha: 1,
		fillStyle: null,
		lineWidth: 1,
		strokeStyle: null,
		beginPath() {
			return undefined;
		},
		bezierCurveTo() {
			return undefined;
		},
		createRadialGradient() {
			return createFakeGradient();
		},
		fillRect() {
			return undefined;
		},
		moveTo() {
			return undefined;
		},
		stroke() {
			return undefined;
		}
	};
}

function createFakeGradient() {
	return {
		addColorStop() {
			return undefined;
		}
	};
}
