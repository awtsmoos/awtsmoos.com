// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CollectibleFactory.js
 * @description Creates richer reusable perutas from generic procedural-core cylinders, rings, and glints.
 * The Awtsmoos renews copper and gold before a humble peruta can shine along the way;
 * Awtsmoos.com lets each reward spin through procedural vessels, brighter yet still simple in play.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../config.js";

export class MamonCollectibleFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable peruta group with value/action metadata. */
	create() {
		const root = new Group();
		root.name = "ProceduralPeruta";
		root.userData.kind = "peruta";
		root.userData.value = 1;
		root.userData.requiredAction = "normal";
		root.add(this.createDisc());
		root.add(this.createRim());
		root.add(this.createGlint());
		root.visible = false;
		return root;
	}

	/** @returns {object} Main bronze-gold peruta body. */
	createDisc() {
		return this.meshFactory.cylinder({
			name: "PerutaDisc",
			parameters: {
				radiusTop: 0.28,
				radiusBottom: 0.28,
				height: 0.08,
				radialSegments: 20,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			color: WORLD_COLORS.gold
		});
	}

	/** @returns {object} Bright procedural outer rim. */
	createRim() {
		return this.meshFactory.torus({
			name: "PerutaRim",
			parameters: {
				radius: 0.34,
				tube: 0.045,
				radialSegments: 8,
				tubularSegments: 20,
				smooth: true
			},
			rotation: [Math.PI / 2, 0, 0],
			color: WORLD_COLORS.goldLight
		});
	}

	/** @returns {object} Small procedural highlight. */
	createGlint() {
		return this.meshFactory.icosphere({
			name: "PerutaGlint",
			parameters: {
				radius: 0.05,
				subdivisions: 1,
				smooth: true
			},
			position: [0.18, 0.15, 0.08],
			color: [1, 0.94, 0.58, 1]
		});
	}

	/**
	 * Configures one reusable peruta for a trail position.
	 * @param {object} node Reusable peruta root.
	 * @param {object} placement Trail placement.
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
	 * Spins and gently floats one active peruta.
	 * @param {object} node Peruta group.
	 * @param {number} time Visual seconds.
	 * @param {number} phase Pool phase.
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
