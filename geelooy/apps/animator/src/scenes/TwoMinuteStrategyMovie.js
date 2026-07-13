// B"H
// Boruch Hashem
// Blessed is He

import { CharacterFamilyGenerator } from '../character/generator/CharacterFamilyGenerator.js';
import { MoviePlanCompiler } from '../generator/compiler/MoviePlanCompiler.js';
import { CinematicMovieSchema } from '../generator/schema/CinematicMovieSchema.js';

/**
 * A meeting invents a strategy, the strategy grows legs, and the family must
 * negotiate with its own plan. This original two-minute comedy lets the
 * Awtsmoos animate camera grammar, emotion, walking, bubbles, and nested edits.
 */
export class TwoMinuteStrategyMovie {
	static create(seed = 'strategy-movie-v1') {
		const characters = CharacterFamilyGenerator.generate(seed);
		const id = role => characters.find(character => character.role === role).identityId;
		const sequences = this.sequences();
		const shots = this.shots(id);
		const dialogue = this.dialogue(id);
		const plan = {
			id: 'strategy_meeting_walked_away',
			title: 'The Strategy Meeting That Walked Away',
			duration: 120000,
			style: 'Original limited-animation adult-family comedy with bold outlines and cinematic staging.',
			strategy: 'Begin orderly, fracture the frame as the plan escapes, then restore symmetry through collaboration.',
			characters,
			sequences,
			shots,
			dialogue,
			performances: this.performances(id),
			bin: this.bin(),
			assetUses: this.assetUses(),
			settings: { width: 640, height: 360, fps: 12, bubbleSafeMargin: 24, backgroundMix: 'procedural-plus-video' }
		};
		plan.nle = MoviePlanCompiler.compile(plan);
		return CinematicMovieSchema.assert(plan);
	}

	static sequences() {
		return [
			['seq_briefing', 'The Impossibly Serious Briefing', 0, 24000, 'fade'],
			['seq_escape', 'The Plan Grows Legs', 24000, 24000, 'whip'],
			['seq_chase', 'Hallway Strategy Chase', 48000, 24000, 'matchCut'],
			['seq_negotiation', 'Negotiating With The Plan', 72000, 24000, 'dissolve'],
			['seq_tag', 'The Calendar Has Opinions', 96000, 24000, 'iris']
		].map(([id, name, start, duration, transition]) => ({ id, name, start, duration, transition }));
	}

	static shots(id) {
		const cast = [id('inventorParent'), id('practicalParent'), id('brainyKid'), id('wildToddler'), id('dryTalkingPet')];
		const data = [
			['s01', 'seq_briefing', 0, 'wide', 'eyeLevel', 'slowPush', 'fade', cast.slice(0, 4)],
			['s02', 'seq_briefing', 10000, 'closeUp', 'lowAngle', 'locked', 'cut', [cast[0]]],
			['s03', 'seq_briefing', 17000, 'insert', 'topDown', 'drift', 'cut', []],
			['s04', 'seq_escape', 24000, 'medium', 'threeQuarter', 'handheld', 'whip', [cast[2], cast[3]]],
			['s05', 'seq_escape', 34000, 'tracking', 'side', 'truckRight', 'cut', cast],
			['s06', 'seq_escape', 44000, 'reaction', 'dutch', 'snapZoom', 'cut', [cast[4]]],
			['s07', 'seq_chase', 48000, 'wide', 'lowAngle', 'truckLeft', 'matchCut', cast],
			['s08', 'seq_chase', 60000, 'overShoulder', 'threeQuarter', 'pushIn', 'cut', [cast[1], cast[0]]],
			['s09', 'seq_negotiation', 72000, 'twoShot', 'eyeLevel', 'locked', 'dissolve', [cast[0], cast[2]]],
			['s10', 'seq_negotiation', 84000, 'closeUp', 'highAngle', 'slowPush', 'cut', [cast[3]]],
			['s11', 'seq_tag', 96000, 'group', 'eyeLevel', 'pullBack', 'iris', cast],
			['s12', 'seq_tag', 108000, 'insert', 'topDown', 'tiltDown', 'cut', []]
		];
		return data.map((shot, index) => ({
			id: shot[0], sequenceId: shot[1], start: shot[2], duration: index === data.length - 1 ? 12000 : data[index + 1][2] - shot[2],
			camera: { size: shot[3], angle: shot[4], move: shot[5] }, transition: shot[6], characters: shot[7],
			composition: { thirdsBias: index % 2 ? 'right' : 'left', depthLayers: 3, motivatedFocus: true }
		}));
	}

	static dialogue(id) {
		const lines = [
			['d01', 'seq_briefing', 2500, 4300, 'inventorParent', 'Mira', 'Our strategy needs three phases and absolutely no legs.'],
			['d02', 'seq_briefing', 7800, 4200, 'practicalParent', 'Dov', 'That is an unusually specific safety rule.'],
			['d03', 'seq_briefing', 13500, 3900, 'brainyKid', 'Nomi', 'Too late. The bullet points are stretching.'],
			['d04', 'seq_escape', 25500, 4300, 'wildToddler', 'Pip', 'The plan is walking! I taught it confidence.'],
			['d05', 'seq_escape', 31500, 4700, 'dryTalkingPet', 'Quip', 'Great. Management has become ambulatory.'],
			['d06', 'seq_chase', 50500, 4500, 'inventorParent', 'Mira', 'Corner it before it schedules a follow-up meeting.'],
			['d07', 'seq_chase', 57500, 4200, 'practicalParent', 'Dov', 'Use the calendar. It fears accountability.'],
			['d08', 'seq_chase', 65000, 4200, 'brainyKid', 'Nomi', 'I can offer version control and a snack.'],
			['d09', 'seq_negotiation', 74500, 5200, 'inventorParent', 'Mira', 'Plan, what do you actually want?'],
			['d10', 'seq_negotiation', 81500, 5200, 'wildToddler', 'Pip', 'It says fewer meetings and more montage.'],
			['d11', 'seq_tag', 98500, 5100, 'dryTalkingPet', 'Quip', 'At last, a document with boundaries.'],
			['d12', 'seq_tag', 109500, 5200, 'practicalParent', 'Dov', 'Why is Tuesday now wearing shoes?']
		];
		return lines.map(([lineId, sequenceId, start, duration, role, speakerName, text]) => ({ id: lineId, sequenceId, start, duration, speakerId: id(role), speakerName, text, bubble: true }));
	}

	static performances(id) {
		return [
			['perf_walk', 'action', id('inventorParent'), 34000, 32000, 'Family chase walk cycle', { action: 'walk', armSwing: 0.8, walkSpeed: 1.1 }],
			['perf_annoyed', 'emotion', id('dryTalkingPet'), 30000, 18000, 'Annoyed reaction', { emotion: 'annoyed', gaze: [-0.6, 0] }],
			['perf_wave', 'gesture', id('wildToddler'), 76000, 9000, 'Negotiating wave', { gesture: 'wave', intensity: 0.9 }],
			['perf_happy', 'emotion', id('brainyKid'), 92000, 22000, 'Relieved smile', { emotion: 'laughing', gaze: [0.4, -0.1] }]
		].map(([performanceId, type, characterId, start, duration, name, payload]) => ({ id: performanceId, type, characterId, start, duration, name, payload, sequenceId: start < 48000 ? 'seq_escape' : start < 72000 ? 'seq_chase' : start < 96000 ? 'seq_negotiation' : 'seq_tag' }));
	}

	static bin() {
		return [
			{ id: 'procedural_office', type: 'proceduralScene', name: 'Vale Strategy Room' },
			{ id: 'real_video_plate', type: 'video', name: 'Optional Real Video Plate', source: null, enabled: false },
			{ id: 'score_strategy', type: 'audio', name: 'Procedural Strategy Score' }
		];
	}

	static assetUses() {
		return [{ id: 'video_plate_contract', trackId: 'track_video', start: 48000, duration: 24000, type: 'video', name: 'Optional hallway video mix', payload: { assetId: 'real_video_plate', enabled: false, blendMode: 'normal', opacity: 0.45, sequenceId: 'seq_chase' } }];
	}
}
