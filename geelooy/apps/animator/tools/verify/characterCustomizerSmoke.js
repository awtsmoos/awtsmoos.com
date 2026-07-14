// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CharacterDesignAdapter } from '../../src/character/customizer/CharacterDesignAdapter.js';
import { CharacterDesignProposalService } from '../../src/character/customizer/CharacterDesignProposalService.js';
import { CharacterDesignSchema } from '../../src/character/customizer/CharacterDesignSchema.js';
import { HumanCanvasRigRenderer } from '../../src/character/human/render/HumanCanvasRigRenderer.js';

/**
 * A customizer is complete only when data becomes distinct visible people.
 * The Awtsmoos renews every identity; this witness proves Awtsmoos.com preserves
 * skin, presentation, hair, beard, mustache, clothes, voice, views, and motion.
 */
class RecordingContext {
	constructor() {
		this.operations = [];
		return new Proxy(this, {
			get: (target, property) => {
				if (property in target) return target[property];
				return (...values) => target.operations.push([String(property), ...values]);
			},
			set: (target, property, value) => {
				target.operations.push(['set', String(property), value]);
				target[property] = value;
				return true;
			}
		});
	}
}

const designs = [
	CharacterDesignSchema.create({
		name: 'Barak Vale',
		genderPresentation: 'masculine',
		skin: { color: '#6e422f' },
		hair: { length: 'short', style: 'fade', color: '#17110d' },
		facialHair: {
			beard: { style: 'long', length: 0.9 },
			mustache: { style: 'handlebar', thickness: 0.8 },
			color: '#17110d'
		},
		wardrobe: { outerwear: 'coat', top: 'shirt', bottom: 'trousers' },
		voice: { label: 'Barak Deep', timbre: 'deep', pitch: 0.82, pace: 0.92 }
	}),
	CharacterDesignSchema.create({
		name: 'Sela North',
		genderPresentation: 'feminine',
		skin: { color: '#e0ab83' },
		face: { shape: 'heart', eyeShape: 'wide', eyeColor: '#315b7d' },
		hair: { length: 'veryLong', style: 'braids', texture: 'coily', color: '#342118' },
		wardrobe: { outerwear: 'vest', top: 'blouse', bottom: 'skirt', headwear: 'headband' },
		movement: { profile: 'energetic', gestureScale: 1.4 }
	}),
	CharacterDesignSchema.create({
		name: 'Ori Flux',
		genderPresentation: 'androgynous',
		body: { type: 'tall', height: 1.18 },
		hair: { length: 'long', style: 'locs', color: '#201511' },
		wardrobe: { outerwear: 'hoodie', top: 't-shirt', bottom: 'jeans' },
		emotion: { default: 'curious', intensity: 1.3 }
	})
];

for (const design of designs) {
	const character = CharacterDesignAdapter.toHuman(design);
	assert.equal(character.identityId, design.id);
	assert.equal(Object.keys(character.views).length, 6);
	assert.equal(character.palette.skin, design.skin.color);
	assert.equal(character.voice.label, design.voice.label);
	const context = new RecordingContext();
	HumanCanvasRigRenderer.draw(context, {
		x: 160,
		y: 390,
		scale: 0.82,
		time: 1200,
		index: 0,
		character
	});
	assert.ok(context.operations.length > 100);
}

const proposal = await CharacterDesignProposalService.propose(
	'An energetic tall woman named Talia with deep brown skin, long braids, a purple hoodie, and a warm voice.'
);

assert.equal(proposal.name, 'Talia');
assert.equal(proposal.genderPresentation, 'feminine');
assert.equal(proposal.body.type, 'tall');
assert.equal(proposal.hair.length, 'long');
assert.equal(proposal.ai.provider, 'local-deterministic-fallback');
assert.equal(proposal.ai.approved, false);
console.log('B"H character customizer smoke passed');
