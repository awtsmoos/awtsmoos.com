// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews many street vessels while one neighborhood remains whole;
 * Awtsmoos.com lets building, nature, detail, lamp, and arch compose without stealing each role.
 */

import { WORLD_COLORS } from "../config.js";

export class OlamStreetscapeFactory {
	/** @param {object} dependencies Three.js, procedural mesh factory, and detailed world factories. */
	constructor(dependencies) {
		this.THREE = dependencies.THREE;
		this.meshFactory = dependencies.meshFactory;
		this.buildingFactory = dependencies.buildingFactory;
		this.natureFactory = dependencies.natureFactory;
		this.detailFactory = dependencies.detailFactory;
	}

	/** @param {number} index Deterministic chunk index. @returns {object} Detailed procedural streetscape group. */
	create(index) {
		const root = new this.THREE.Group();
		root.name = "DetailedProceduralStreetscape";
		root.add(this.buildingFactory.create(index, -1));
		root.add(this.buildingFactory.create(index + 3, 1));
		root.add(this.detailFactory.create(index));
		root.add(this.createLamp(-5.88, -4.2), this.createLamp(5.88, 4.0));
		root.add(this.natureFactory.createTree(-1, 3.3, index));
		if (index % 2 === 0) {
			root.add(this.natureFactory.createTree(1, -3.5, index + 5));
		}
		if (index % 5 === 3) {
			root.add(this.createArch());
		}
		return root;
	}

	/** @param {number} x Lamp X. @param {number} z Lamp Z. @returns {object} Procedural street lamp group. */
	createLamp(x, z) {
		const root = new this.THREE.Group();
		root.add(this.meshFactory.cylinder({
			name: "LampPost",
			parameters: {
				radiusTop: 0.055,
				radiusBottom: 0.095,
				height: 3.55,
				radialSegments: 10,
				smooth: true
			},
			position: [x, 1.78, z],
			material: { type: "standard", color: WORLD_COLORS.metal, metalness: 0.46, roughness: 0.44 }
		}));
		root.add(this.meshFactory.icosphere({
			name: "LampGlow",
			parameters: { radius: 0.18, subdivisions: 1, smooth: true },
			position: [x, 3.6, z],
			material: { type: "standard", color: 0xffedb5, emissive: 0x8d5b16, roughness: 0.12 },
			castShadow: false
		}));
		return root;
	}

	/** @returns {object} Occasional ceremonial street arch built through the procedural core. */
	createArch() {
		const root = new this.THREE.Group();
		for (const x of [-5.45, 5.45]) {
			root.add(this.meshFactory.cube({
				name: "ArchPost",
				scale: [0.3, 5.25, 0.3],
				position: [x, 2.63, 0],
				material: { type: "standard", color: WORLD_COLORS.buildingC, roughness: 0.72 }
			}));
		}
		root.add(this.meshFactory.cube({
			name: "ArchBeam",
			scale: [11.2, 0.36, 0.36],
			position: [0, 5.1, 0],
			material: { type: "standard", color: WORLD_COLORS.goldLight, metalness: 0.16, roughness: 0.46 }
		}));
		return root;
	}
}
