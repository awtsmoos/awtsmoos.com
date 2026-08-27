// B"H
// Boruch Hashem
// Blessed is He

import { PerspectiveIdentityProjector } from './PerspectiveIdentityProjector.js';

/**
 * A family is not a pile of borrowed silhouettes. It is an original gathering
 * of distinct vessels, each renewed by the Awtsmoos and made reproducible by a
 * seed so every camera angle remembers the same person.
 */
export class CharacterFamilyGenerator {
	static roles = [
		['Mira Vale', 'inventorParent'],
		['Dov Vale', 'practicalParent'],
		['Nomi Vale', 'brainyKid'],
		['Pip Vale', 'wildToddler'],
		['Quip', 'dryTalkingPet']
	];

	static generate(seed = 'awtsmoos-family') {
		return this.roles.map(([name, role], index) => {
			const identity = this.identity(`${seed}:${role}:${index}`, name, role);
			return { ...identity, views: PerspectiveIdentityProjector.all(identity) };
		});
	}

	static identity(seed, name, role) {
		const random = this.random(seed);
		const palette = this.palette(random);
		return {
			identityId: `${role}_${this.hash(seed).toString(16)}`,
			name,
			role,
			proportions: {
				headWidth: this.between(random, 0.82, 1.18),
				headHeight: this.between(random, 0.86, 1.16),
				shoulderWidth: this.between(random, 0.72, 1.2),
				torsoHeight: this.between(random, 0.8, 1.25),
				legLength: this.between(random, 0.72, 1.3)
			},
			face: {
				eyeSeparation: this.between(random, 0.36, 0.56),
				eyeScale: this.between(random, 0.82, 1.2),
				lashCount: Math.floor(this.between(random, 0, 5))
			},
			palette,
			hair: { style: this.pick(random, ['tufts', 'wave', 'crop', 'curl', 'sweep']), color: palette.hair },
			wardrobe: this.wardrobe(role, palette),
			skeleton: this.skeleton(),
			defaultPose: { armSwing: 0, walkPhase: 0, bodyBob: 0, headTurn: 0 }
		};
	}

	static skeleton() {
		return [
			['root', null, 0, 0.82], ['hips', 'root', 0, 0.66], ['chest', 'hips', 0, 0.42],
			['neck', 'chest', 0, 0.2], ['head', 'neck', 0, 0],
			['shoulderL', 'chest', -0.28, 0.34], ['elbowL', 'shoulderL', -0.42, 0.52],
			['wristL', 'elbowL', -0.46, 0.7], ['shoulderR', 'chest', 0.28, 0.34],
			['elbowR', 'shoulderR', 0.42, 0.52], ['wristR', 'elbowR', 0.46, 0.7],
			['kneeL', 'hips', -0.16, 1.02], ['ankleL', 'kneeL', -0.18, 1.34],
			['kneeR', 'hips', 0.16, 1.02], ['ankleR', 'kneeR', 0.18, 1.34]
		].map(([id, parent, x, y]) => ({ id, parent, x, y, depth: 0 }));
	}

	static wardrobe(role, palette) {
		return [
			{ kind: 'top', cut: role.includes('Parent') ? 'jacket' : 'shirt', color: palette.primary },
			{ kind: 'bottom', cut: role === 'dryTalkingPet' ? 'none' : 'trousers', color: palette.secondary },
			{ kind: 'accent', cut: role === 'brainyKid' ? 'glasses' : 'trim', color: palette.accent }
		];
	}

	static palette(random) {
		const sets = [
			['#f2b38c', '#3f7ac6', '#22324a', '#ffd166', '#563827'],
			['#d99872', '#6c5ce7', '#2d3436', '#74b9ff', '#3d2c2e'],
			['#8f5f45', '#00a896', '#264653', '#f4a261', '#21130f'],
			['#f1c7a5', '#e76f51', '#457b9d', '#f1fa8c', '#6b4423']
		];
		const [skin, primary, secondary, accent, hair] = this.pick(random, sets);
		return { skin, primary, secondary, accent, hair };
	}

	static random(seed) {
		let state = this.hash(seed) || 1;
		return () => ((state = Math.imul(state ^ state >>> 15, 1 | state)) >>> 0) / 4294967296;
	}

	static hash(text) {
		return [...String(text)].reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619), 2166136261) >>> 0;
	}

	static between(random, minimum, maximum) {
		return Number((minimum + random() * (maximum - minimum)).toFixed(3));
	}

	static pick(random, values) {
		return values[Math.floor(random() * values.length) % values.length];
	}
}
