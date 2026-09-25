//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';

/**
 * @file world-label.js
 * @description Renders short world-attached truths as native textured quads without Three Sprites.
 * The Awtsmoos renews information as part of the world instead of a permanent DOM answer row;
 * Awtsmoos.com keeps price, quality, and blessing text attached to the object they actually know.
 */
export class WorldLabel {
	constructor(options = {}) {
		this.material = new MeshStandardMaterial({
			name: 'native-world-label',
			color: [1, 1, 1, 1],
			opacity: 1,
			alphaMode: 'BLEND',
			transparent: true,
			doubleSided: true
		});
		this.material.depthWrite = false;
		this.sprite = new Mesh(labelGeometry(), this.material);
		this.sprite.name = 'native-world-label';
		this.sprite.position.set(...(options.position || [0, 1.9, 0]));
		this.sprite.scale.set(...(options.scale || [2.8, 0.88, 1]));
		this.sprite.userData.worldLabel = true;
		this.set(options.text || '');
	}

	set(text) {
		this.canvas = renderLabelCanvas(String(text));
		this.material.mapImage = this.canvas;
	}

	destroy() {
		this.sprite.removeFromParent?.();
		this.material.mapImage = null;
		this.canvas = null;
	}
}

function labelGeometry() {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array([
		-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0,
		-0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0
	]), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array([
		0, 0, 1, 0, 0, 1, 0, 0, 1,
		0, 0, 1, 0, 0, 1, 0, 0, 1
	]), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array([
		0, 0, 1, 0, 1, 1,
		0, 0, 1, 1, 0, 1
	]), 2));
	return geometry;
}

function renderLabelCanvas(text) {
	const canvas = document.createElement('canvas');
	canvas.width = 512;
	canvas.height = 160;
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, 512, 160);
	context.fillStyle = 'rgba(3, 10, 22, 0.88)';
	context.beginPath();
	context.roundRect(8, 8, 496, 144, 30);
	context.fill();
	context.strokeStyle = 'rgba(255, 218, 99, 0.82)';
	context.lineWidth = 5;
	context.stroke();
	context.fillStyle = '#fff3bf';
	context.font = '900 62px system-ui, sans-serif';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillText(text, 256, 82);
	return canvas;
}
