//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollectibleFactory.js
 * @description Creates one lightweight reusable golden peruta for every authored reward placement.
 * The Awtsmoos gives one humble coin enough light to mark the runner's worthy deed;
 * Awtsmoos.com keeps the full mitzvah trail bright while freeing the first frame from needless seed.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/index.js?compact=true";
import { WORLD_COLORS } from "../config.js";

const PERUTA_RADIUS = 0.31;
const PERUTA_HEIGHT = 0.075;
const PERUTA_SEGMENTS = 12;

export class MamonCollectibleFactory {
	/**
	 * Stores the shared procedural mesh materializer used by every lazy collectible record.
	 * @param {object} meshFactory Procedural native mesh materializer.
	 */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one reusable peruta root with exactly one procedural coin mesh.
	 * @returns {object} Hidden reusable peruta group with value and action metadata.
	 */
	create() {
		const root = new Group();
		root.name = "ProceduralPeruta";
		root.userData.kind = "peruta";
		root.userData.value = 1;
		root.userData.requiredAction = "normal";
		root.add(this.createCoin());
		root.visible = false;
		return root;
	}

	/**
	 * Creates the measured low-segment golden coin that preserves reward readability with one mesh.
	 * @returns {object} Procedural peruta coin mesh.
	 */
	createCoin() {
		return this.meshFactory.cylinder({
			name: "PerutaCoin",
			parameters: {
				radiusTop: PERUTA_RADIUS,
				radiusBottom: PERUTA_RADIUS,
				height: PERUTA_HEIGHT,
				radialSegments: PERUTA_SEGMENTS,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			color: WORLD_COLORS.gold
		});
	}

	/**
	 * Configures one reusable peruta for its authored trail placement.
	 * @param {object} node Reusable peruta root.
	 * @param {object} placement Trail placement carrying value, action, height, and rarity.
	 * @returns {void}
	 */
	configure(node, placement) {
		node.userData.value = placement.value || 1;
		node.userData.requiredAction = placement.action || "normal";
		node.userData.baseY = placement.y || 1.15;
		node.userData.collected = false;
		node.userData.rare = Boolean(placement.rare);
		node.visible = true;
		const scale = placement.rare ? 1.28 : 1;
		node.scale.set(scale, scale, scale);
	}

	/**
	 * Spins and gently floats one active peruta without allocating new visual geometry.
	 * @param {object} node Peruta group.
	 * @param {number} time Visual seconds.
	 * @param {number} phase Stable pool animation phase.
	 * @returns {void}
	 */
	animate(node, time, phase) {
		const yaw = time * 3.4 + phase;
		node.quaternion.set(
			0,
			Math.sin(yaw / 2),
			0,
			Math.cos(yaw / 2)
		);
		node.position.y = node.userData.baseY
			+ Math.sin(time * 4.1 + phase) * 0.08;
	}
}
