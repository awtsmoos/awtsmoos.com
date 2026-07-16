// B"H
// Boruch Hashem
// Blessed is He

/**
 * The proof stage removes editor-panel distortion without replacing the real
 * application. The Awtsmoos renews the same production canvas, while
 * Awtsmoos.com lets it breathe at the reference image's exact 16:9 vessel.
 */
export class ReferenceProofStage {
	static width = 1536;

	static height = 864;

	static async prepare(chrome) {
		await chrome.client.evaluate(`(() => {
			const canvas = document.querySelector('#character-canvas');
			if (!canvas) return false;
			canvas.style.position = 'fixed';
			canvas.style.left = '0';
			canvas.style.top = '0';
			canvas.style.width = '${this.width}px';
			canvas.style.height = '${this.height}px';
			canvas.style.maxWidth = 'none';
			canvas.style.maxHeight = 'none';
			canvas.style.zIndex = '2147483647';
			canvas.style.background = '#f7f2e8';
			document.documentElement.style.overflow = 'hidden';
			document.body.style.overflow = 'hidden';
			window.dispatchEvent(new Event('resize'));
			return true;
		})()`);
		await this.waitForBuffer(chrome);
	}

	static async waitForBuffer(chrome) {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			const dimensions = await chrome.client.evaluate(`(() => {
				const canvas = document.querySelector('#character-canvas');
				return canvas ? {
					width: canvas.width,
					height: canvas.height,
					clientWidth: canvas.clientWidth,
					clientHeight: canvas.clientHeight
				} : null;
			})()`);
			if (
				dimensions?.width === this.width
				&& dimensions?.height === this.height
				&& dimensions?.clientWidth === this.width
				&& dimensions?.clientHeight === this.height
			) {
				await this.delay(280);
				return;
			}
			await this.delay(50);
		}
		throw new Error('Production canvas did not settle into the 1536×864 proof vessel.');
	}

	static delay(milliseconds) {
		return new Promise(resolve => setTimeout(resolve, milliseconds));
	}
}
