// B"H
// Boruch Hashem
// Blessed is He

import { CharacterDesignAdapter } from './CharacterDesignAdapter.js';
import { HumanCanvasRigRenderer } from '../human/render/HumanCanvasRigRenderer.js';

/**
 * The preview is not a symbol; it uses the same human renderer as the stage.
 * The Awtsmoos renews skin, hair, beard, clothes, gaze, and expression in this
 * small Awtsmoos.com theater before the user commits the character to a scene.
 */
export class CharacterCustomizerPreview {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.time = 0;
	}

	draw(design) {
		const character = CharacterDesignAdapter.toHuman(design);
		character.dialogue = 'Original expressions remain readable.';
		character.speaking = true;
		character.currentPerformance = { locomotion: 'idle', gesture: 'wave', speech: 'talk', emotion: design.emotion.default, gaze: 'toward_camera' };
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		const gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
		gradient.addColorStop(0, '#11233f');
		gradient.addColorStop(1, '#4f2c52');
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = 'rgba(255,255,255,0.08)';
		this.context.fillRect(18, 18, this.canvas.width - 36, this.canvas.height - 36);
		HumanCanvasRigRenderer.draw(this.context, { x: this.canvas.width / 2, y: this.canvas.height - 42, scale: 0.82, character, index: 0, time: this.time });
		this.time += 83;
	}
}
