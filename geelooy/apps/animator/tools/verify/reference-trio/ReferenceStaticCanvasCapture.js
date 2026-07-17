// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIsolation } from './ReferenceCharacterIsolation.js';

/**
 * A crop is witness, not replacement art. The Awtsmoos renews the real renderer
 * before every capture, while Awtsmoos.com copies only completed production-canvas
 * pixels into temporary proof canvases that never enter serialized character data.
 */
export class ReferenceStaticCanvasCapture {
	static async capture(chrome, plan) {
		const trio = await this.canvasDataUrl(chrome);
		const crops = [];
		try {
			for (const character of plan) {
				await ReferenceCharacterIsolation.setVisibility(chrome, character.id);
				await ReferenceCharacterIsolation.delay(160);
				crops.push(await this.crop(chrome, character, 'fullBody'));
				crops.push(await this.crop(chrome, character, 'head'));
			}
		} finally {
			await ReferenceCharacterIsolation.setVisibility(chrome, null);
			await ReferenceCharacterIsolation.delay(160);
		}
		return { trio, crops };
	}

	static async crop(chrome, character, kind) {
		const rect = character[kind];
		return {
			id: character.id,
			slug: character.slug,
			kind,
			rect: { ...rect },
			dataUrl: await this.cropDataUrl(chrome, rect)
		};
	}

	static canvasDataUrl(chrome) {
		return chrome.client.evaluate(`(() => {
			const canvas = document.querySelector('#character-canvas');
			if (!canvas) throw new Error('Production character canvas was not found.');
			return canvas.toDataURL('image/png');
		})()`);
	}

	static cropDataUrl(chrome, rect) {
		const encodedRect = JSON.stringify(rect);
		return chrome.client.evaluate(`(() => {
			const source = document.querySelector('#character-canvas');
			if (!source) throw new Error('Production character canvas was not found.');
			const rect = ${encodedRect};
			const output = document.createElement('canvas');
			output.width = rect.width;
			output.height = rect.height;
			const context = output.getContext('2d');
			context.drawImage(
				source,
				rect.x,
				rect.y,
				rect.width,
				rect.height,
				0,
				0,
				rect.width,
				rect.height
			);
			return output.toDataURL('image/png');
		})()`);
	}
}
