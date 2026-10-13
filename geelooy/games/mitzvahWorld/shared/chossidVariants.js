// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chossidVariants.js
 * @description Builds multiple Chossid characters from the SAME canonical base
 * GLB: different clothes, beard vs no beard, glasses vs no glasses, hat styles.
 * Each variant gets freshly cloned PBR materials so outfits never leak across
 * characters. Also applies the realism pass (ACES tone mapping, soft shadows,
 * three-point lighting) used by the proof page and the game.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

export const CHOSSID_GLB = new URL(
	"../build/generated/assets/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb",
	import.meta.url
).href;

/** Named outfits: material name -> hex color. */
export const OUTFITS = {
	classic: {
		shirt: 0xf2efe8,
		"outer-shirt": 0xffffff,
		pants: 0x161616,
		jacket: 0x101010,
		"jacket.001": 0x101010,
		shoes: 0x0b0b0b,
		hair: 0x2a1d12,
	},
	navy: {
		shirt: 0xe8ecf2,
		"outer-shirt": 0xf7f9fc,
		pants: 0x1c2a44,
		jacket: 0x16233a,
		"jacket.001": 0x16233a,
		shoes: 0x0d0f14,
		hair: 0x1f150d,
	},
	chestnut: {
		shirt: 0xf5efe2,
		"outer-shirt": 0xfffdf6,
		pants: 0x2b2018,
		jacket: 0x4a3220,
		"jacket.001": 0x4a3220,
		shoes: 0x1c130c,
		hair: 0x3a2413,
	},
	slate: {
		shirt: 0xeef0f2,
		"outer-shirt": 0xffffff,
		pants: 0x2e3238,
		jacket: 0x3c4148,
		"jacket.001": 0x3c4148,
		shoes: 0x141518,
		hair: 0x241a10,
	},
	ivory: {
		shirt: 0xffffff,
		"outer-shirt": 0xfffef9,
		pants: 0x3a3a3a,
		jacket: 0x1e1e22,
		"jacket.001": 0x1e1e22,
		shoes: 0x101010,
		hair: 0x2a1d12,
	},
};

let baseGltf = null;
const loader = new GLTFLoader();

/** Loads the canonical base GLB once. */
export async function loadBaseChossid() {
	if (baseGltf) return baseGltf;
	baseGltf = await loader.loadAsync(CHOSSID_GLB);
	return baseGltf;
}

/** Finds a node by exact name inside a group (depth-first). */
export function findNode(root, name) {
	let found = null;
	root.traverse((o) => {
		if (!found && o.name === name) found = o;
	});
	return found;
}

/**
 * Finds the head bone. three.js GLTFLoader sanitizes bone names
 * ("mixamorig:Head" becomes "mixamorigHead"), so try both.
 */
export function findHeadBone(root) {
	return findNode(root, "mixamorigHead") || findNode(root, "mixamorig:Head");
}

/** Finds the first mesh using a material with the given name. */
export function findMeshByMaterial(root, matName) {
	let found = null;
	root.traverse((o) => {
		if (!found && o.isMesh) {
			const m = o.material;
			const name = m && m.name;
			if (name === matName) found = o;
		}
	});
	return found;
}

/** Sets visibility for a list of node names. */
function setVisible(root, names, visible) {
	for (const n of names) {
		const node = findNode(root, n);
		if (node) node.visible = visible;
	}
}

const BEARD_NODES = ["beard", "mustache"];
const GLASSES_NODES = ["BézierCurve003"]; // three.js strips dots from GLB node names
const TOPHAT_NODES = ["top-hat"];
const YARMULKE_NODES = ["yarmalka"];

/**
 * Creates one character variant from the canonical base model.
 * @param {object} opts
 * @param {boolean} [opts.beard=true] — show beard + mustache
 * @param {boolean} [opts.glasses=false] — show glasses
 * @param {"tophat"|"yarmulke"|"none"} [opts.hat="tophat"]
 * @param {string} [opts.outfit="classic"] — key of OUTFITS
 * @param {number} [opts.skinTone] — optional skin color override (hex)
 * @returns {Promise<{group: THREE.Group, nodes: object}>}
 */
export async function createChossidVariant(opts = {}) {
	const {
		beard = true,
		glasses = false,
		hat = "tophat",
		outfit = "classic",
		skinTone = null,
	} = opts;
	const gltf = await loadBaseChossid();
	// SkeletonUtils.clone keeps the skinned meshes bound to a cloned skeleton.
	const group = SkeletonUtils.clone(gltf.scene);

	// --- facial hair / glasses / hat toggles ---
	setVisible(group, BEARD_NODES, beard);
	setVisible(group, GLASSES_NODES, glasses);
	setVisible(group, TOPHAT_NODES, hat === "tophat");
	setVisible(group, YARMULKE_NODES, hat === "yarmulke");

	// --- outfit: clone every material, then recolor the clothing set ---
	const outfitColors = OUTFITS[outfit] || OUTFITS.classic;
	const materialMap = new Map();
	group.traverse((o) => {
		if (o.isMesh) {
			const mats = Array.isArray(o.material) ? o.material : [o.material];
			const clones = mats.map((m) => {
				if (!m) return m;
				if (!materialMap.has(m)) {
					const c = m.clone();
					const key = (c.name || "").trim();
					if (outfitColors[key] !== undefined && c.color) {
						c.color.setHex(outfitColors[key]);
					}
					if (key === "skin" && skinTone !== null && c.color) {
						c.color.setHex(skinTone);
					}
					// Realism pass on every cloned material.
					if ("roughness" in c && c.roughness > 0.9) c.roughness = 0.82;
					if (c.isMeshStandardMaterial) {
						c.envMapIntensity = 0.55;
					}
					materialMap.set(m, c);
				}
				return materialMap.get(m);
			});
			o.material = Array.isArray(o.material) ? clones : clones[0];
			o.castShadow = true;
			o.receiveShadow = true;
		}
	});

	const nodes = {
		head: findHeadBone(group),
		teeth: findNode(group, "teeth"),
		choytem: findNode(group, "choytem"),
		beard: findNode(group, "beard"),
		mustache: findNode(group, "mustache"),
		lips: findMeshByMaterial(group, "lips"),
	};
	return { group, nodes };
}

/**
 * Applies the cinematic realism pass to a renderer + scene: ACES tone mapping,
 * sRGB output, PCF soft shadows, and a three-point light rig with a ground
 * contact shadow catcher.
 * @returns {{key: THREE.Light, fill: THREE.Light, rim: THREE.Light}}
 */
export function applyRealismPass(renderer, scene, opts = {}) {
	const { groundY = 0, shadowSize = 2048 } = opts;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.12;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x2a2118, 0.55);
	scene.add(hemi);

	const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
	key.position.set(3.5, 6, 4);
	key.castShadow = true;
	key.shadow.mapSize.set(shadowSize, shadowSize);
	key.shadow.camera.near = 0.5;
	key.shadow.camera.far = 20;
	key.shadow.camera.left = -4;
	key.shadow.camera.right = 4;
	key.shadow.camera.top = 6;
	key.shadow.camera.bottom = -2;
	key.shadow.bias = -0.0004;
	key.shadow.normalBias = 0.02;
	scene.add(key);

	const fill = new THREE.DirectionalLight(0xbcd0ff, 0.7);
	fill.position.set(-4, 3, 2.5);
	scene.add(fill);

	const rim = new THREE.DirectionalLight(0xffe6c4, 1.1);
	rim.position.set(-1.5, 4.5, -4.5);
	scene.add(rim);

	// Soft contact-shadow catcher.
	const shadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(14, 14),
		shadowMat
	);
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = groundY;
	ground.receiveShadow = true;
	scene.add(ground);

	return { hemi, key, fill, rim, ground };
}
