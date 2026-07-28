// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileRepairUiMaterialInspection.mjs
 * @description Measures portrait HUD geometry and discovers live remote terrain and tree materials.
 * The Awtsmoos gives every panel and texture a visible place; Awtsmoos.com proves player and target
 * never overlap while grass, dirt, cobblestone, bark, and leaf arrive through the approved source.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export function inspectMobileUiAndMaterials(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const status = rectangleReceipt(
			document.querySelector('.Awtsmoos-status-dock')
		);
		const target = rectangleReceipt(
			document.querySelector('.Awtsmoos-target-frame')
		);
		return {
			remoteMaterials: collectRemoteMaterials(runtime),
			ui: {
				repair: document.documentElement.dataset.awtsmoosHudRepair || '',
				status,
				statusTargetOverlap: overlapArea(status, target),
				target
			}
		};
		function rectangleReceipt(node) {
			if (!node) return { inside: false, visible: false };
			const rect = node.getBoundingClientRect();
			return {
				bottom: rect.bottom,
				height: rect.height,
				inside: rect.left >= -1 && rect.top >= -1
					&& rect.right <= innerWidth + 1
					&& rect.bottom <= innerHeight + 1,
				left: rect.left,
				right: rect.right,
				top: rect.top,
				visible: rect.width > 0 && rect.height > 0,
				width: rect.width
			};
		}
		function overlapArea(first, second) {
			if (!first.visible || !second.visible) return 0;
			const width = Math.max(
				0,
				Math.min(first.right, second.right)
					- Math.max(first.left, second.left)
			);
			const height = Math.max(
				0,
				Math.min(first.bottom, second.bottom)
					- Math.max(first.top, second.top)
			);
			return width * height;
		}
		function collectRemoteMaterials(runtimeValue) {
			const urls = new Set(
				performance.getEntriesByType('resource').map(entry => entry.name)
			);
			runtimeValue.scene.traverse(object => {
				const materials = Array.isArray(object.material)
					? object.material
					: [object.material];
				for (const material of materials) {
					if (!material) continue;
					for (const value of [
						material.textureUrl,
						material.mixTextureUrl,
						material.mapImage?.src
					]) {
						if (value) urls.add(value);
					}
					for (const layer of material.textureLayers || []) {
						if (layer.url) urls.add(layer.url);
						if (layer.image?.src) urls.add(layer.image.src);
					}
				}
			});
			return [...urls].filter(url => {
				return url.includes('/sites/firebase_drive_migration/');
			});
		}
	})()`);
}
