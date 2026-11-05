// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CharacterVariants.js
 * @description One canonical Chossid, many characters. Yaakov's rule: the same
 * base model (chossid.glb) wears every identity — beard or clean-shaven,
 * mustache or bare lip, glasses or clear eyes, tophat or yamulka or bare head,
 * black coat or modern jacket, tefillin or plain. Plus a realism material pass
 * that lifts the whole figure beyond flat game-asset looks.
 *
 * Node names below are the LOADED scene node names (GLTFLoader uses node names,
 * not mesh names): Cube005 = long beard, mustache, top-hat, yarmalka, teeth.
 */

export const NODES = Object.freeze({
	beard: 'Cube005',
	mustache: 'mustache',
	hair: 'hairPlaceholder',
	browLeft: 'eyeBrowLeft',
	browRight: 'eyeBrowRight',
	topHat: 'top-hat',
	yamulka: 'yarmalka',
	teeth: 'teeth'
});

export const MATERIALS = Object.freeze({
	glassesFrame: 'glasses-frame',
	glassesGlass: 'glasses-glass',
	tefillinStrap: 'teffilinStrap',
	tefillinBayis: 'teffilinBayis',
	tefillinShin: 'teffilinShin',
	jacket: 'jacket',
	jacketAlt: 'jacket.001',
	shirt: 'shirt',
	outerShirt: 'outer-shirt',
	pants: 'pants',
	shoes: 'shoes',
	skin: 'skin',
	hair: 'hair',
	lips: 'lips',
	gums: 'gums',
	tophat: 'tophat',
	yamulka: 'yamulka',
	eyeWhite: 'eye-white',
	eyeColor: 'eye-color',
	pupil: 'pupil'
});

const TEFILLIN_MATS = [MATERIALS.tefillinStrap, MATERIALS.tefillinBayis, MATERIALS.tefillinShin];
const GLASS_MATS = [MATERIALS.glassesFrame, MATERIALS.glassesGlass];

/** Four launch characters on the same bones. */
export const VARIANTS = Object.freeze({
	classic: Object.freeze({
		label: 'Classic Chossid',
		beard: true, mustache: true, glasses: false, hat: 'tophat', tefillin: false,
		outfit: Object.freeze({ jacket: 0x161616, shirt: 0xf2f2f2, pants: 0x1b1b1b, shoes: 0x0c0c0c, hat: 0x101010 })
	}),
	scholar: Object.freeze({
		label: 'Scholar',
		beard: true, mustache: true, glasses: true, hat: 'yamulka', tefillin: true,
		outfit: Object.freeze({ jacket: 0x1e1a14, shirt: 0xf6f1e7, pants: 0x232323, shoes: 0x111111, hat: 0x0d0d0d })
	}),
	modern: Object.freeze({
		label: 'Modern',
		beard: false, mustache: true, glasses: true, hat: 'yamulka', tefillin: false,
		outfit: Object.freeze({ jacket: 0x1f2a44, shirt: 0xe8edf5, pants: 0x2a2f3a, shoes: 0x14161c, hat: 0x101418 })
	}),
	casual: Object.freeze({
		label: 'Casual',
		beard: false, mustache: false, glasses: false, hat: 'none', tefillin: false,
		outfit: Object.freeze({ jacket: 0x3a3f4a, shirt: 0xdfe6ee, pants: 0x333a45, shoes: 0x1a1c22, hat: 0x101010 })
	})
});

function eachMesh(model, fn) {
	model.traverse(object => {
		if (object.isMesh || object.isSkinnedMesh) fn(object);
	});
}

function setNodeVisible(model, name, visible) {
	eachMesh(model, object => {
		if (object.name === name) object.visible = visible !== false;
	});
}

function setMaterialVisible(model, materialName, visible) {
	eachMesh(model, object => {
		if (object.material && object.material.name === materialName) {
			object.visible = visible !== false;
		}
	});
}

/** Beard on/off. The long beard is its own node, so the face stays intact. */
export function setBeard(model, on) {
	setNodeVisible(model, NODES.beard, on);
	return Boolean(on);
}

/** Mustache on/off (independent of the beard). */
export function setMustache(model, on) {
	setNodeVisible(model, NODES.mustache, on);
	return Boolean(on);
}

/** Glasses on/off (frames + lenses together). */
export function setGlasses(model, on) {
	for (const mat of GLASS_MATS) setMaterialVisible(model, mat, on);
	return Boolean(on);
}

/** Hat: 'tophat' | 'yamulka' | 'none'. */
export function setHat(model, which) {
	setNodeVisible(model, NODES.topHat, which === 'tophat');
	setNodeVisible(model, NODES.yamulka, which === 'yamulka');
	return which;
}

/** Tefillin (straps + boxes + shin) on/off. */
export function setTefillin(model, on) {
	for (const mat of TEFILLIN_MATS) setMaterialVisible(model, mat, on);
	return Boolean(on);
}

/**
 * Recolors the outfit. Clones materials first so one character's clothes never
 * bleed into another instance sharing the GLB.
 */
export function setOutfit(model, outfit = {}) {
	const targets = {
		[MATERIALS.jacket]: outfit.jacket,
		[MATERIALS.jacketAlt]: outfit.jacket,
		[MATERIALS.shirt]: outfit.shirt,
		[MATERIALS.outerShirt]: outfit.shirt,
		[MATERIALS.pants]: outfit.pants,
		[MATERIALS.shoes]: outfit.shoes,
		[MATERIALS.tophat]: outfit.hat,
		[MATERIALS.yamulka]: outfit.hat
	};
	eachMesh(model, object => {
		const name = object.material && object.material.name;
		if (name && targets[name] !== undefined) {
			if (!object.userData.AwtsmoosVariantCloned) {
				object.material = object.material.clone();
				object.userData.AwtsmoosVariantCloned = true;
			}
			object.material.color.setHex(targets[name]);
			object.material.needsUpdate = true;
		}
	});
}

/**
 * Realism pass: lifts the flat authored materials into believable PBR without
 * touching geometry. Skin gets soft sheen, hair gets deep matte, eyes get wet
 * gloss, teeth get enamel white, fabric gets cloth roughness. Also repairs the
 * teeth node, which ships with no material.
 */
export function enhanceRealism(model) {
	const tweaks = {
		[MATERIALS.skin]: { roughness: 0.55, metalness: 0.0 },
		[MATERIALS.hair]: { roughness: 0.9, metalness: 0.0 },
		[MATERIALS.lips]: { roughness: 0.45, metalness: 0.0 },
		[MATERIALS.gums]: { roughness: 0.5, metalness: 0.0 },
		[MATERIALS.jacket]: { roughness: 0.95, metalness: 0.0 },
		[MATERIALS.jacketAlt]: { roughness: 0.95, metalness: 0.0 },
		[MATERIALS.shirt]: { roughness: 0.9, metalness: 0.0 },
		[MATERIALS.outerShirt]: { roughness: 0.9, metalness: 0.0 },
		[MATERIALS.pants]: { roughness: 0.9, metalness: 0.0 },
		[MATERIALS.shoes]: { roughness: 0.35, metalness: 0.1 },
		[MATERIALS.eyeWhite]: { roughness: 0.25, metalness: 0.0 },
		[MATERIALS.eyeColor]: { roughness: 0.15, metalness: 0.0 },
		[MATERIALS.pupil]: { roughness: 0.1, metalness: 0.0 },
		[MATERIALS.glassesFrame]: { roughness: 0.3, metalness: 0.6 },
		[MATERIALS.glassesGlass]: { roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.28 },
		[MATERIALS.tophat]: { roughness: 0.7, metalness: 0.0 },
		[MATERIALS.yamulka]: { roughness: 0.85, metalness: 0.0 },
		[MATERIALS.tefillinBayis]: { roughness: 0.4, metalness: 0.05 },
		[MATERIALS.tefillinStrap]: { roughness: 0.8, metalness: 0.0 }
	};
	eachMesh(model, object => {
		const mat = object.material;
		if (!mat) return;
		// Repair the teeth: authored with no material at all.
		if (object.name === NODES.teeth && !mat.name) {
			object.material = makeTeethMaterial(object);
			return;
		}
		const tweak = tweaks[mat.name];
		if (!tweak) return;
		if (tweak.roughness !== undefined && 'roughness' in mat) mat.roughness = tweak.roughness;
		if (tweak.metalness !== undefined && 'metalness' in mat) mat.metalness = tweak.metalness;
		if (tweak.transparent !== undefined) mat.transparent = tweak.transparent;
		if (tweak.opacity !== undefined) mat.opacity = tweak.opacity;
		mat.needsUpdate = true;
	});
	// Gentle proportion rescue: the authored tophat ships oversized and swallows
	// the face at gameplay distance. A slight scale keeps the silhouette honest.
	eachMesh(model, object => {
		if (object.name === NODES.topHat && !object.userData.AwtsmoosHatRescaled) {
			object.scale.multiplyScalar(0.88);
			object.userData.AwtsmoosHatRescaled = true;
		}
	});
}

function makeTeethMaterial(referenceObject) {
	// The teeth ship with an unnamed default material; give them enamel.
	let base = null;
	const root = referenceObject.parent;
	if (root && root.traverse) {
		root.traverse(o => {
			if (!base && o.material && o.material.name === MATERIALS.gums) base = o.material;
		});
	}
	const mat = base ? base.clone() : newObjectMaterial(referenceObject);
	try {
		if (mat.color && mat.color.setHex) mat.color.setHex(0xf7f3e8);
		if ('roughness' in mat) mat.roughness = 0.22;
		if ('metalness' in mat) mat.metalness = 0.0;
		mat.name = 'teeth';
		mat.needsUpdate = true;
	} catch { /* keep best effort */ }
	return mat;
}

function newObjectMaterial(referenceObject) {
	// Last resort: reuse the constructor of any sibling material.
	let ctor = null;
	const root = referenceObject.parent;
	if (root && root.traverse) {
		root.traverse(o => {
			if (!ctor && o.material && o.material.constructor && o.material.color) {
				ctor = o.material.constructor;
			}
		});
	}
	return ctor ? new ctor({ color: 0xf7f3e8 }) : { color: { setHex() {} }, needsUpdate: false };
}

/** Applies a full named variant in one call. Returns the resolved variant. */
export function applyVariant(model, name) {
	const variant = VARIANTS[name] || VARIANTS.classic;
	setBeard(model, variant.beard);
	setMustache(model, variant.mustache);
	setGlasses(model, variant.glasses);
	setHat(model, variant.hat);
	setTefillin(model, variant.tefillin);
	setOutfit(model, variant.outfit);
	model.userData.AwtsmoosVariant = name;
	return variant;
}

/** Lists available variant names. */
export function variantNames() {
	return Object.keys(VARIANTS);
}

/**
 * Quality pass 2 — pushes the model beyond flat game-asset looks.
 * - Beard: narrows the traffic-cone silhouette, natural auburn color.
 * - Eyes: adds catchlights for living eyes.
 * - Skin: upgrades to physical material with sheen for lifelike response.
 * All runtime-only; the authored GLB is never modified.
 */
export function refineFeatures(model, THREE) {
	// Beard: the authored beard ships as a wide cone; narrow + reshape it.
	eachMesh(model, object => {
		if (object.name === NODES.beard && !object.userData.AwtsmoosBeardRefined) {
			object.scale.set(0.72, 0.92, 0.78);
			object.userData.AwtsmoosBeardRefined = true;
		}
		if (object.material && object.material.name === MATERIALS.hair) {
			if (!object.userData.AwtsmoosHairRecolored) {
				if (!object.userData.AwtsmoosVariantCloned) {
					object.material = object.material.clone();
					object.userData.AwtsmoosVariantCloned = true;
				}
				// Natural auburn instead of traffic-cone orange.
				object.material.color.setHex(0x8a4a1e);
				object.material.needsUpdate = true;
				object.userData.AwtsmoosHairRecolored = true;
			}
		}
	});
	// Eye catchlights: tiny bright spheres parented in front of each pupil.
	const eyeTargets = [];
	eachMesh(model, object => {
		if (object.material && object.material.name === MATERIALS.pupil) eyeTargets.push(object);
	});
	for (const pupil of eyeTargets) {
		if (pupil.userData.AwtsmoosCatchlight) continue;
		const geo = new THREE.SphereGeometry(0.012, 8, 8);
		const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const dot = new THREE.Mesh(geo, mat);
		// Place slightly forward and up from the pupil center.
		const bb = new THREE.Box3().setFromObject(pupil);
		const c = bb.getCenter(new THREE.Vector3());
		pupil.parent.worldToLocal(c);
		dot.position.copy(c);
		dot.position.z += 0.035;
		dot.position.y += 0.012;
		dot.userData.AwtsmoosCatchlight = true;
		pupil.userData.AwtsmoosCatchlight = true;
		pupil.parent.add(dot);
	}
	// Skin: physical material with sheen for a lifelike response.
	eachMesh(model, object => {
		const mat = object.material;
		if (mat && mat.name === MATERIALS.skin && !object.userData.AwtsmoosSkinUpgraded) {
			if (!object.userData.AwtsmoosVariantCloned) {
				object.material = object.material.clone();
				object.userData.AwtsmoosVariantCloned = true;
			}
			const m = object.material;
			try {
				if (THREE.MeshPhysicalMaterial && !(m instanceof THREE.MeshPhysicalMaterial)) {
					const phys = new THREE.MeshPhysicalMaterial({
						color: m.color ? m.color.clone() : new THREE.Color(0xd9a066),
						roughness: 0.5, metalness: 0.0,
						sheen: 0.5, sheenRoughness: 0.6,
						sheenColor: new THREE.Color(0xffd9b0)
					});
					phys.name = MATERIALS.skin;
					object.material = phys;
				} else {
					if ('sheen' in m) { m.sheen = 0.5; m.sheenRoughness = 0.6; }
				}
				m.needsUpdate = true;
			} catch { /* keep best effort */ }
			object.userData.AwtsmoosSkinUpgraded = true;
		}
	});
}
