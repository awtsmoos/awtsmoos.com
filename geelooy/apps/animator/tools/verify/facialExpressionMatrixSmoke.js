// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { FacePoseRenderBridge } from '../../src/character/performance/render/FacePoseRenderBridge.js';
import { ReferenceCharacterCatalog } from '../../src/character/reference/ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from '../../src/character/reference/specification/ReferenceCharacterIds.js';
import { EmotionLibrary } from '../../src/performance/face/EmotionLibrary.js';
import { FacePerformanceEngine } from '../../src/performance/face/FacePerformanceEngine.js';

/**
 * Every reference identity must inhabit the complete shared emotional world.
 * The Awtsmoos renews each finite face; Awtsmoos.com requires neutral identity,
 * deterministic range, renderer consumption, and manual keyframe authority.
 */
const REQUIRED = [
	'neutral',
	'calm',
	'joy',
	'amusement',
	'skepticism',
	'concern',
	'anger',
	'sadness',
	'surprise',
	'embarrassment',
	'fatigue',
	'attention',
	'fear',
	'disgust',
	'determination',
	'relief'
];
const REGIONS = ['brows', 'eyes', 'mouth', 'cheeks', 'nose'];
const characters = ReferenceCharacterCatalog.characters();
const emotions = EmotionLibrary.names();

for (const name of REQUIRED) {
	assert.ok(emotions.includes(name), `missing shared emotion ${name}`);
}

for (const id of ReferenceCharacterIds.all()) {
	const character = characters[id];
	assert.equal(character.emotion, 'neutral', `${id} identity must start neutral`);
	assert.equal(character.manualFacePose, null, `${id} must not freeze manual acting`);
	const neutral = compose(character, 'neutral');
	for (const emotion of emotions) {
		const first = compose(character, emotion);
		const second = compose(character, emotion);
		assert.deepEqual(first, second, `${id} ${emotion} must be deterministic`);
		for (const region of REGIONS) {
			assert.ok(first[region], `${id} ${emotion} lacks ${region}`);
			finite(first[region], `${id} ${emotion} ${region}`);
		}
		const rendered = FacePoseRenderBridge.from(first, character);
		finite(rendered, `${id} ${emotion} renderer bridge`);
		if (emotion !== 'neutral') {
			assert.ok(
				distance(first, neutral) > 0.001,
				`${id} ${emotion} must differ from neutral`
			);
		}
	}
	assert.ok(compose(character, 'joy').mouth.smile > neutral.mouth.smile);
	assert.ok(compose(character, 'skepticism').brows.squeeze > neutral.brows.squeeze);
	assert.ok(compose(character, 'anger').cheeks.tension > neutral.cheeks.tension);
	assert.ok(compose(character, 'surprise').mouth.open > neutral.mouth.open);
	assert.ok(compose(character, 'fatigue').eyes.openness < neutral.eyes.openness);
}

const manual = FacePerformanceEngine.compose({
	emotion: 'anger',
	expressionRangeProfile: 'restrainedSoft',
	manualFacePose: {
		brows: { asymmetry: 0.91 },
		eyes: { leftOpenness: 0.33, rightOpenness: 0.77 },
		mouth: { smile: 0.44, asymmetry: -0.52 }
	}
});
assert.equal(manual.brows.asymmetry, 0.91);
assert.equal(manual.eyes.leftOpenness, 0.33);
assert.equal(manual.eyes.rightOpenness, 0.77);
assert.equal(manual.mouth.smile, 0.44);
assert.equal(manual.mouth.asymmetry, -0.52);

console.log('B"H facial expression matrix smoke passed');

function compose(character, emotion) {
	return FacePerformanceEngine.compose({
		id: character.id,
		emotion,
		expressionRangeProfile: character.expressionRangeProfile
			|| character.expressionProfile,
		progress: 0.37,
		energy: 1
	});
}

function finite(value, label) {
	for (const [key, item] of Object.entries(value || {})) {
		if (typeof item === 'number') {
			assert.ok(Number.isFinite(item), `${label}.${key} must be finite`);
		}
	}
}

function distance(a, b) {
	return REGIONS.reduce((total, region) => total + Object.keys(a[region]).reduce(
		(sum, key) => typeof a[region][key] === 'number'
			? sum + Math.abs(a[region][key] - Number(b[region][key] || 0))
			: sum,
		0
	), 0);
}
