// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannel.js
 * @description Declares the traversable current beneath the restored Bent Reeds lamp-house.
 *
 * A hidden road is not another existence beside the Awtsmoos. It is one more vessel
 * through which the same creating Will becomes adventure, memory, and return.
 * These coordinates let Awtsmoos.com bind earlier mercy, courage, or harmony to a
 * physical channel whose water remembers the player's deed.
 */
export const ECHO_CHANNEL = Object.freeze({
	id: 'echo_channel',
	title: 'Echo Channel',
	maps: Object.freeze({
		threshold: 'Echo_Channel_Threshold',
		depths: 'Echo_Channel_Depths',
		concealed: 'Echo_Channel_Concealed_Bend',
		restored: 'Bent_Reeds_Restored'
	}),
	spawns: Object.freeze({
		threshold: { x: 12, y: 11 },
		depths: { x: 12, y: 11 },
		concealed: { x: 12, y: 9 },
		restored: { x: 14, y: 10 }
	}),
	points: Object.freeze({
		thresholdGate: { x: 12, y: 2 },
		inscription: { x: 5, y: 4 },
		concealedGate: { x: 19, y: 5 },
		guardian: { x: 12, y: 2 },
		thread: { x: 12, y: 3 },
		concealedReturn: { x: 12, y: 11 },
		restoredLamp: { x: 14, y: 7 },
		afterword: { x: 5, y: 4 },
		restoredExit: { x: 22, y: 7 }
	}),
	flags: Object.freeze({
		discovered: 'echoChannelDiscovered',
		gateOpened: 'echoChannelGateOpened',
		inscriptionRead: 'echoChannelInscriptionRead',
		threadCollected: 'echoChannelThreadCollected',
		bossResolved: 'echoChannelBossResolved',
		worldRestored: 'bentReedsWaterCleared',
		mantleRestored: 'answeringWatersMantleRestored',
		afterwordRead: 'answeringWatersAfterwordRead'
	}),
	items: Object.freeze({
		thread: 'river_thread',
		tornMantle: 'torn_answering_mantle',
		clasp: 'answering_clasp',
		relic: 'channel_relic'
	}),
	garmentId: 'MANTLE_OF_ANSWERING_WATERS',
	encounterMarker: 'echoChannelKeeper'
});

const APPROACH_LINES = Object.freeze({
	compassion: 'Sheltering Current gathers the frightened eddies until the passage trusts your light.',
	resolve: 'Wick-Cutting Current severs the false knot and the passage releases its held pressure.',
	resonance: 'Answering Current matches the true rhythm and the passage remembers its intended shape.'
});

export function echoChannelApproachLine(approachId) {
	return APPROACH_LINES[approachId] || APPROACH_LINES.compassion;
}

export function createEchoChannelGuardian() {
	return {
		id: 'echo_channel_keeper',
		name: 'Keeper of the Answering Current',
		glyph: '≈',
		light: 108,
		lesson: 'Water receives the form of its vessel; humility can interrupt distortion without becoming passive.',
		kind: 'Guardian',
		weakTo: 'interrupt',
		element: 'Water',
		chapterId: ECHO_CHANNEL.id,
		[ECHO_CHANNEL.encounterMarker]: true
	};
}
