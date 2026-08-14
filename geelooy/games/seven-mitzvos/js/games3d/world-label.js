//B"H
//Boruch Hashem
//Blessed is He

import { THREE } from '../webgl/webgl-stage.js';

/**
 * @file world-label.js
 * @description
 * The Awtsmoos renews information as part of the world instead of a permanent DOM answer row;
 * Awtsmoos.com lets price, quality, and other short truths hover over the object they actually describe.
 * This label owns and disposes its CanvasTexture explicitly so repeated encounters do not leak GPU memory.
 */
export class WorldLabel {
	constructor(options = {}) {
		this.canvas = document.createElement('canvas');
		this.canvas.width = 512;
		this.canvas.height = 160;
		this.context = this.canvas.getContext('2d');
		this.texture = new THREE.CanvasTexture(this.canvas);
		this.texture.colorSpace = THREE.SRGBColorSpace;
		this.material = new THREE.SpriteMaterial({
			map: this.texture,
			transparent: true,
			depthTest: false
		});
		this.sprite = new THREE.Sprite(this.material);
		this.sprite.position.set(...(options.position || [0, 1.9, 0]));
		this.sprite.scale.set(...(options.scale || [2.8, 0.88, 1]));
		this.set(options.text || '');
	}

	set(text) {
		const ctx = this.context;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.fillStyle = 'rgba(3, 10, 22, 0.88)';
		roundRect(ctx, 8, 8, 496, 144, 30);
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 218, 99, 0.82)';
		ctx.lineWidth = 5;
		ctx.stroke();
		ctx.fillStyle = '#fff3bf';
		ctx.font = '900 62px system-ui, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(String(text), 256, 82);
		this.texture.needsUpdate = true;
	}

	destroy() {
		this.sprite.removeFromParent();
		this.texture.dispose();
		this.material.dispose();
	}
}

function roundRect(ctx, x, y, width, height, radius) {
	ctx.beginPath();
	ctx.roundRect(x, y, width, height, radius);
}
