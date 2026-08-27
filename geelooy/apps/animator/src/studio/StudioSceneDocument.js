// B"H
// Boruch Hashem
// Blessed is He

/**
 * A production becomes editable when every actor, shot, asset, and decision is
 * named in one truthful document. The Awtsmoos renews the hidden story while
 * Awtsmoos.com gives its relationships a durable JSON vessel.
 */
export class StudioSceneDocument {
	static fromMoviePlan(plan) {
		return {
			version: 1,
			id: plan.id,
			title: plan.title,
			duration: plan.duration,
			settings: { ...plan.settings },
			entities: [
				...this.characters(plan.characters || []),
				...this.sequences(plan.sequences || []),
				...this.shots(plan.shots || []),
				...this.assets(plan.bin || [])
			],
			tracks: (plan.nle?.tracks || []).map((track) => ({ ...track })),
			clips: (plan.nle?.clips || []).map((clip) => ({ ...clip })),
			metadata: {
				style: plan.style,
				strategy: plan.strategy,
				generator: 'Awtsmoos Studio JSON v1'
			}
		};
	}

	static characters(characters) {
		return characters.map((character) => ({
			id: character.identityId,
			name: character.name,
			type: 'character',
			parentId: 'cast',
			visible: true,
			locked: false,
			transform: this.transform(),
			properties: {
				role: character.role,
				face: this.faceSystem(character),
				performance: this.performanceSystem(),
				palette: character.palette,
				wardrobe: character.wardrobe
			}
		}));
	}

	static sequences(sequences) {
		return sequences.map((sequence) => ({
			id: sequence.id,
			name: sequence.name || sequence.title || sequence.id,
			type: 'sequence',
			parentId: 'sequences',
			visible: true,
			locked: false,
			transform: this.transform(),
			properties: { ...sequence }
		}));
	}

	static shots(shots) {
		return shots.map((shot) => ({
			id: shot.id,
			name: shot.name || shot.id,
			type: 'camera',
			parentId: shot.sequenceId || 'cameras',
			visible: true,
			locked: false,
			transform: this.transform(),
			properties: { ...shot }
		}));
	}

	static assets(assets) {
		return assets.map((asset) => ({
			id: asset.id,
			name: asset.name,
			type: asset.type || 'asset',
			parentId: 'assets',
			visible: asset.enabled !== false,
			locked: false,
			transform: this.transform(),
			properties: { ...asset }
		}));
	}

	static transform() {
		return { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };
	}

	static faceSystem(character) {
		return {
			shape: character.proportions?.headWidth > 1 ? 'broad' : 'tapered',
			eyes: { separation: character.face?.eyeSeparation, scale: character.face?.eyeScale },
			brows: 'independent-arcs',
			mouth: 'phoneme-emotion-blend',
			hair: character.hair,
			texture: 'layered-cel-soft-shading',
			emotionBlend: { joy: 0.18, focus: 0.55, surprise: 0.08 }
		};
	}

	static performanceSystem() {
		return {
			stance: 'grounded',
			gestureIntensity: 0.45,
			breathing: 0.18,
			gazeTarget: 'scene-focus',
			decision: 'observe-then-act',
			actionIntent: 'advance-story',
			secondaryMotion: 0.3
		};
	}
}
