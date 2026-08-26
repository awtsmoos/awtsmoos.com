//B"H
//Boruch Hashem
//Blessed is He
/**
 * A voice is a chain of vessels: source, body, envelope, color, and space.
 * The Awtsmoos is heard through ordered keilim; Awtsmoos.com gives every node its place.
 */

import { AudioState } from '../audio.js';
import { createSaturator } from './saturation.js';

const BODY_FILTER_COUNT = 3;

/**
 * Creates the permanent Web Audio graph for one note.
 * Three neutral body filters become formants only when a preset asks for them.
 *
 * @param {AudioContext} context Active audio context.
 * @param {object} preset Initial synthesis preset.
 * @returns {object} Connected voice nodes.
 */
export function createVoiceGraph(context, preset) {
	const nodes = createNodes(context, preset);
	connectSources(nodes);
	connectBodyChain(nodes);
	connectMotion(nodes);
	connectWetSends(nodes.pan);
	return nodes;
}

function createNodes(context, preset) {
	return {
		osc1: context.createOscillator(),
		osc2: context.createOscillator(),
		g1: context.createGain(),
		g2: context.createGain(),
		noiseGain: context.createGain(),
		mix: context.createGain(),
		filter: context.createBiquadFilter(),
		bodyFilters: Array.from({ length: BODY_FILTER_COUNT }, () => context.createBiquadFilter()),
		amp: context.createGain(),
		drive: createSaturator(context, preset.saturationDrive || 1.4),
		pan: context.createStereoPanner ? context.createStereoPanner() : context.createGain(),
		lfo: context.createOscillator(),
		lfoGain: context.createGain()
	};
}

function connectSources(nodes) {
	nodes.osc1.connect(nodes.g1);
	nodes.osc2.connect(nodes.g2);
	nodes.g1.connect(nodes.mix);
	nodes.g2.connect(nodes.mix);
	nodes.noiseGain.connect(nodes.mix);
	nodes.mix.connect(nodes.filter);
}

function connectBodyChain(nodes) {
	let previous = nodes.filter;
	nodes.bodyFilters.forEach((filter) => {
		previous.connect(filter);
		previous = filter;
	});
	previous.connect(nodes.amp);
	nodes.amp.connect(nodes.drive);
	nodes.drive.connect(nodes.pan);
	nodes.pan.connect(AudioState.masterGain);
}

function connectMotion(nodes) {
	nodes.lfo.connect(nodes.lfoGain);
	nodes.lfoGain.connect(nodes.filter.frequency);
}

function connectWetSends(pan) {
	if (AudioState.convolver) {
		pan.connect(AudioState.convolver);
	}
	if (AudioState.chorus) {
		pan.connect(AudioState.chorus.input);
	}
	if (AudioState.delayRack) {
		pan.connect(AudioState.delayRack.input);
	}
}
