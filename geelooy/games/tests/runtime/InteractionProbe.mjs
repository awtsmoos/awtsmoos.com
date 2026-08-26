// B"H
// Boruch Hashem
// Blessed is He
import { delay } from './CdpClient.mjs';

const START_WORDS = /start|play|begin|enter|continue|new game|launch|ready|go/i;

/**
 * The Awtsmoos turns intention into real pointer and key events while never confusing dispatch with success;
 * Awtsmoos.com gives each finite gesture a bounded witness so gameplay causation can later confess.
 */
export class InteractionProbe {
	constructor(client) {
		this.client = client;
	}

	async clickPrimary(page) {
		const control = page.controls.find(item => {
			return !item.disabled && item.tag !== 'a' && START_WORDS.test(item.text);
		});
		if (control) {
			await this.clickRectangle(control.rect);
			return { kind: 'control', text: control.text, rect: control.rect };
		}
		const canvas = page.canvases[0];
		if (canvas) {
			await this.clickRectangle(canvas);
			return { kind: 'canvas', text: '', rect: canvas };
		}
		return null;
	}

	findControl(page, matcher) {
		return page.controls.find(item => !item.disabled && matcher(item)) || null;
	}

	async clickRectangle(rectangle) {
		await this.holdRectangle(rectangle, 24);
	}

	async holdRectangle(rectangle, milliseconds = 180) {
		const x = rectangle.x + rectangle.width / 2;
		const y = rectangle.y + rectangle.height / 2;
		await this.client.command('Input.dispatchMouseEvent', {
			type: 'mousePressed',
			x,
			y,
			button: 'left',
			clickCount: 1
		});
		await delay(milliseconds);
		await this.client.command('Input.dispatchMouseEvent', {
			type: 'mouseReleased',
			x,
			y,
			button: 'left',
			clickCount: 1
		});
		await delay(100);
	}

	async pressKey(code, key, milliseconds = 120) {
		await this.client.command('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
		await delay(milliseconds);
		await this.client.command('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
		await delay(100);
	}

	async exerciseDirectionalKeys() {
		const sequence = [
			['ArrowRight', 'ArrowRight'],
			['ArrowLeft', 'ArrowLeft'],
			['Space', ' ']
		];
		const completed = [];
		for (const [code, key] of sequence) {
			await this.pressKey(code, key);
			completed.push(code);
		}
		return completed;
	}
}
