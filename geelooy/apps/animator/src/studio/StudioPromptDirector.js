// B"H
// Boruch Hashem
// Blessed is He

/**
 * A sentence is only a seed. This director unfolds it into characters, places,
 * cameras, decisions, and timed dialogue, while the Awtsmoos renews every
 * possibility and Awtsmoos.com receives an immediately editable JSON world.
 */
export class StudioPromptDirector {
	static generate(prompt, baseDocument) {
		const normalized = String(prompt || '').trim().toLowerCase();
		if (normalized.includes('parakeet')) {
			return this.parakeetScene(baseDocument);
		}
		return this.generalScene(prompt, baseDocument);
	}

	static parakeetScene(baseDocument) {
		const document = this.clone(baseDocument);
		document.id = 'parakeet_school_courtyard_movie';
		document.title = 'The Parakeet Who Directed Recess';
		document.metadata.prompt = 'A parakeet directs a cinematic school courtyard adventure.';
		document.entities = [
			this.parakeet(),
			this.child('maya', 'Maya', '#7dd3fc'),
			this.child('eli', 'Eli', '#fbbf24'),
			this.environment('school_exterior', 'Sunlit School Courtyard', 'exterior'),
			this.environment('school_hall', 'Echoing School Hallway', 'interior'),
			this.prop('paper_map', 'Folded Recess Map'),
			...this.cameras()
		];
		document.clips = this.parakeetClips();
		return document;
	}

	static generalScene(prompt, baseDocument) {
		const document = this.clone(baseDocument);
		document.id = `generated_${this.hash(prompt)}`;
		document.title = String(prompt || 'Generated Awtsmoos Scene').slice(0, 72);
		document.metadata.prompt = String(prompt || 'A cinematic procedural scene');
		return document;
	}

	static parakeet() {
		return {
			id: 'pico_parakeet', name: 'Pico', type: 'character', parentId: 'cast',
			visible: true, locked: false,
			transform: { x: 420, y: 130, scaleX: 0.82, scaleY: 0.82, rotation: -4, opacity: 1 },
			properties: {
				species: 'parakeet', plumage: ['#3ddc84', '#b8f34a', '#1e88e5'],
				face: { eyes: 'bright-round', brows: 'feather-arcs', beak: 'expressive-hinge', emotionBlend: { courage: 0.72, mischief: 0.48 } },
				performance: { stance: 'perched-alert', gestureIntensity: 0.78, gazeTarget: 'recess-map', decision: 'become-director', actionIntent: 'lead-the-children', secondaryMotion: 0.86 }
			}
		};
	}

	static child(id, name, accent) {
		return {
			id, name, type: 'character', parentId: 'cast', visible: true, locked: false,
			transform: { x: id === 'maya' ? 220 : 690, y: 248, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
			properties: {
				accent,
				face: { shape: 'soft-angular', eyes: 'layered-iris', brows: 'independent-arcs', mouth: 'phoneme-emotion-blend', texture: 'cel-soft-shading' },
				performance: { stance: 'ready', gestureIntensity: 0.52, breathing: 0.16, gazeTarget: 'pico_parakeet', decision: 'trust-the-plan', actionIntent: 'follow-map', secondaryMotion: 0.32 }
			}
		};
	}

	static environment(id, name, kind) {
		return {
			id, name, type: 'environment', parentId: 'sets', visible: true, locked: true,
			transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
			properties: { kind, timeOfDay: kind === 'exterior' ? 'golden-afternoon' : 'cool-daylight', atmosphere: kind === 'exterior' ? 'windy-leaves' : 'long-reflections', proceduralLayers: 8 }
		};
	}

	static prop(id, name) {
		return {
			id, name, type: 'prop', parentId: 'props', visible: true, locked: false,
			transform: { x: 470, y: 270, scaleX: 1, scaleY: 1, rotation: 7, opacity: 1 },
			properties: { material: 'creased-paper', action: 'unfold-flutter-point', proceduralMotion: 0.66 }
		};
	}

	static cameras() {
		return [
			['cam_crane', 'Crane Establishing', 'high-wide', 'descending-crane'],
			['cam_beak', 'Pico Hero Close-up', 'extreme-close', 'micro-push'],
			['cam_chase', 'Courtyard Chase', 'low-tracking', 'whip-pan-track'],
			['cam_hall', 'Hallway Reflection', 'symmetrical-wide', 'slow-dolly'],
			['cam_finale', 'Skyward Finale', 'worm-eye-wide', 'orbit-rise']
		].map(([id, name, angle, movement]) => ({
			id, name, type: 'camera', parentId: 'cameras', visible: true, locked: false,
			transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
			properties: { angle, movement, lens: angle.includes('close') ? 'portrait-65mm' : 'cinematic-24mm', focusTarget: 'pico_parakeet' }
		}));
	}

	static parakeetClips() {
		const beats = [
			[0, 18000, 'cam_crane', 'The bell rings. Pico discovers a map under the old oak.'],
			[18000, 20000, 'cam_beak', 'Pico: Recess needs direction. I accept the responsibility.'],
			[38000, 24000, 'cam_chase', 'Maya and Eli race through the courtyard as the map flutters ahead.'],
			[62000, 22000, 'cam_hall', 'Eli: The arrows changed! Pico: The wind has opinions.'],
			[84000, 22000, 'cam_chase', 'A rolling ball, a fountain spray, and one heroic wingbeat redirect the crowd.'],
			[106000, 14000, 'cam_finale', 'Pico: A good director listens when the scene becomes alive.']
		];
		return beats.flatMap(([start, duration, cameraId, text], index) => ([
			{ id: `parakeet_camera_${index}`, trackId: 'track_camera', type: 'camera', name: cameraId, entityId: cameraId, start, duration, payload: { cameraId } },
			{ id: `parakeet_dialogue_${index}`, trackId: 'track_dialogue', type: 'dialogue', name: text.slice(0, 34), entityId: index % 2 ? 'pico_parakeet' : 'maya', start: start + 1200, duration: Math.min(duration - 1600, 7200), payload: { text, bubble: { style: 'cinematic-rounded', safeMargin: 24 } } }
		]));
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}

	static hash(text) {
		return [...String(text || '')].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7).toString(16);
	}
}
