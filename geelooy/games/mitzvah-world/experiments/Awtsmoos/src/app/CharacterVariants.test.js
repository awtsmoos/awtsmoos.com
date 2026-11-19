// B"H
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	VARIANTS, variantNames, NODES, MATERIALS,
	applyVariant, enhanceRealism, setGlasses, setOutfit, setTefillin
} from './CharacterVariants.js';
import { speakText, canTalk } from './TalkingMouth.js';

describe('CharacterVariants', () => {
	it('exposes four named variants', () => {
		assert.deepEqual(variantNames().sort(), ['casual', 'classic', 'modern', 'scholar']);
	});
	it('every variant declares beard/glasses/hat/tefillin/outfit', () => {
		for (const name of variantNames()) {
			const v = VARIANTS[name];
			assert.equal(typeof v.beard, 'boolean', name);
			assert.equal(typeof v.glasses, 'boolean', name);
			assert.ok(['tophat', 'yamulka', 'none'].includes(v.hat), name);
			assert.equal(typeof v.tefillin, 'boolean', name);
			assert.ok(v.outfit && typeof v.outfit.jacket === 'number', name);
		}
	});
	it('variants differ from each other', () => {
		const sig = v => [v.beard, v.glasses, v.hat, v.tefillin].join('|');
		const sigs = new Set(variantNames().map(n => sig(VARIANTS[n])));
		assert.ok(sigs.size >= 3, 'variants must be visually distinct');
	});
	it('node names match the authored GLB', () => {
		assert.equal(NODES.beard, 'Cube005');
		assert.equal(NODES.mustache, 'mustache');
		assert.equal(NODES.topHat, 'top-hat');
		assert.equal(NODES.yamulka, 'yarmalka');
	});
});

describe('TalkingMouth', () => {
	it('speakText returns a timed controller', () => {
		const fake = { traverse() {} };
		const t = speakText(fake, 'Shalom!');
		assert.ok(t.duration > 0.5, 'duration scales with text');
		assert.equal(typeof t.update, 'function');
		assert.equal(typeof t.stop, 'function');
		t.stop();
	});
	it('canTalk is false without morphs', () => {
		assert.equal(canTalk({ traverse() {} }), false);
	});
	it('canTalk detects the O morph', () => {
		const fake = { traverse(fn) { fn({ isMesh: true, morphTargetDictionary: { O: 0, S: 1 } }); } };
		assert.equal(canTalk(fake), true);
	});
});

/** One material as the outfit palette leaves it: `authored-name@#color`. */
function resolvedMaterial(name) {
	const material = {
		name,
		color: { hex: null, setHex(value) { this.hex = value; } },
		roughness: 1,
		metalness: 0,
		needsUpdate: false,
		clone() {
			const copy = resolvedMaterial(this.name);
			copy.color.hex = this.color.hex;
			return copy;
		}
	};
	return material;
}

function resolvedMesh(name, materialName) {
	return {
		isMesh: true,
		name,
		visible: true,
		material: resolvedMaterial(materialName),
		userData: {},
		scale: { multiplyScalar() {} }
	};
}

/** A player GLB as the palette resolver loads it: suffixed material names. */
function resolvedPlayer() {
	const meshes = [
		resolvedMesh('Cube005', 'hair@#4b2410'),
		resolvedMesh('mustache', 'hair@#4b2410'),
		resolvedMesh('top-hat', 'tophat@#101010'),
		resolvedMesh('yarmalka', 'yamulka@#101010'),
		resolvedMesh('glasses-left', 'glasses-frame@#26384a'),
		resolvedMesh('glasses-lens', 'glasses-glass@#26384a'),
		resolvedMesh('teffilin-strap', 'teffilinStrap@#1d1710'),
		resolvedMesh('teffilin-box', 'teffilinBayis@#1d1710'),
		resolvedMesh('jacket-mesh', 'jacket@#23252b'),
		resolvedMesh('skin-mesh', 'skin@#c98f6a')
	];
	const byName = Object.fromEntries(meshes.map(mesh => [mesh.name, mesh]));
	return { byName, meshes, model: { traverse(fn) { for (const mesh of meshes) fn(mesh); } } };
}

describe('palette-resolved materials', () => {
	it('setGlasses hides glasses whose material name carries a palette suffix', () => {
		const { byName, model } = resolvedPlayer();
		setGlasses(model, false);
		assert.equal(byName['glasses-left'].visible, false);
		assert.equal(byName['glasses-lens'].visible, false);
		assert.equal(byName['skin-mesh'].visible, true);
		setGlasses(model, true);
		assert.equal(byName['glasses-left'].visible, true);
	});
	it('setTefillin hides straps and boxes whose material name carries a palette suffix', () => {
		const { byName, model } = resolvedPlayer();
		setTefillin(model, false);
		assert.equal(byName['teffilin-strap'].visible, false);
		assert.equal(byName['teffilin-box'].visible, false);
		assert.equal(byName['jacket-mesh'].visible, true);
	});
	it('setOutfit recolors a jacket whose material name carries a palette suffix', () => {
		const { byName, model } = resolvedPlayer();
		setOutfit(model, { jacket: 0x161616 });
		assert.equal(byName['jacket-mesh'].material.color.hex, 0x161616);
		assert.equal(byName['skin-mesh'].material.color.hex, null);
	});
	it('enhanceRealism still finds skin through the palette suffix', () => {
		const { byName, model } = resolvedPlayer();
		enhanceRealism(model);
		assert.equal(byName['skin-mesh'].material.roughness, 0.55);
	});
	it('applyVariant classic on a resolved model hides glasses and tefillin and shows the tophat', () => {
		const { byName, model } = resolvedPlayer();
		applyVariant(model, 'classic');
		assert.equal(byName['top-hat'].visible, true);
		assert.equal(byName['yarmalka'].visible, false);
		assert.equal(byName['glasses-left'].visible, false);
		assert.equal(byName['teffilin-strap'].visible, false);
		assert.equal(byName['jacket-mesh'].material.color.hex, 0x161616);
	});
});
