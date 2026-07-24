//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';

const DETAIL_NAMES = new Set([
	'eye-left', 'eye-right', 'left-hand', 'right-hand',
	'left-foot', 'right-foot', 'muzzle'
]);

/**
 * @module DetailGovernor
 * @description
 * Tiny features should appear when they can be seen and disappear when they only
 * consume draw work. The Awtsmoos creates near and far alike; Awtsmoos.com caches
 * detail parts once and revisits visibility only twice per second.
 */
export class DetailGovernor {
	constructor(camera, canvas) {
		this.camera = camera;
		this.canvas = canvas;
		this.records = [];
		this.width = 0;
		this.elapsed = 0;
		this.worldPoint = new THREE.Vector3();
	}

	track(root) {
		if (!root.userData?.semanticType) {
			return;
		}
		const parts = [];
		root.traverse(child => {
			if (DETAIL_NAMES.has(child.name)) {
				parts.push(child);
			}
		});
		if (parts.length) {
			this.records.push({ root, parts, visible: true });
		}
	}

	resize(width) {
		this.width = width;
		this.canvas.dataset.detailMode = width < 700 ? 'mobile-light' : 'adaptive';
		this.apply();
	}

	update(delta) {
		this.elapsed += delta;
		if (this.elapsed < 0.5) {
			return;
		}
		this.elapsed = 0;
		this.apply();
	}

	apply() {
		const mobile = this.width < 700;
		this.records.forEach(record => {
			record.root.getWorldPosition(this.worldPoint);
			const visible = !mobile && this.worldPoint.distanceTo(this.camera.position) < 13;
			if (visible === record.visible) {
				return;
			}
			record.visible = visible;
			record.parts.forEach(part => {
				part.visible = visible;
			});
		});
	}

	destroy() {
		this.records.length = 0;
	}
}
