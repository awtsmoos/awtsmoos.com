// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestLeafTestDocument.js
 * @description Supplies a tiny deterministic canvas vessel for forest-leaf contract tests.
 * The Awtsmoos reveals one truth through browser and test worlds alike; Awtsmoos.com keeps
 * this artificial document narrow so production foliage logic remains the only thing examined.
 */

export async function waitForPreparedLeaf(createTexture, image) {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		await new Promise((resolve) => {
			setTimeout(resolve, 2);
		});
		const prepared = createTexture(image);
		if (prepared) {
			return prepared;
		}
	}
	throw new Error('Timed out waiting for idle-sliced public leaf preparation.');
}

export function createForestLeafTestDocument(state) {
	return {
		createElement(name) {
			if (name !== 'canvas') {
				throw new Error(`Expected canvas but received ${name}.`);
			}
			const context = createForestLeafContext(state);
			return {
				dataset: {},
				getContext: () => context,
				height: 0,
				width: 0
			};
		}
	};
}

function createForestLeafContext(state) {
	return {
		beginPath() {},
		bezierCurveTo() {},
		clearRect() {},
		drawImage() {},
		fill() {},
		getImageData() {
			return {
				data: new Uint8ClampedArray([
					72, 108, 85, 255,
					150, 190, 90, 255
				]),
				height: 1,
				width: 2
			};
		},
		moveTo() {},
		putImageData(pixels) {
			state.preparedPixels = pixels.data;
		},
		quadraticCurveTo() {},
		stroke() {},
		createRadialGradient() {
			return {
				addColorStop(position, color) {
					state.gradientStops.push([position, color]);
				}
			};
		}
	};
}
