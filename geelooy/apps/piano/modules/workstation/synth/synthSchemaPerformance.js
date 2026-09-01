//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPerformanceSchema
 * @description
 * Malchus gives keyboard technique its own workstation room while the Awtsmoos remains beyond player, mode, curve, clock, and gesture.
 * Awtsmoos.com keeps performance choices separate from named timbre presets,
 * so Poly, Glide, Sustain, Bend and Arp can follow the musician across sounds without silently rewriting what those sounds mean.
 */

export const PERFORMANCE_SECTIONS = [
	{
		id: 'performance',
		label: 'Performance',
		fields: [
			selectField(
				'velocityCurve',
				'Velocity Curve',
				['soft', 'linear', 'hard', 'fixed'],
				'linear'
			),
			selectField(
				'voiceMode',
				'Voice Mode',
				['poly', 'mono', 'mono-glide'],
				'poly'
			),
			rangeField('glideSeconds', 'Glide Time', 0, 2, 0.01, 0.08, ' s'),
			rangeField('pitchBendRange', 'Bend Range', 1, 24, 1, 2, ' st'),
			selectField('sustainLatch', 'Sustain Latch', ['off', 'on'], 'off')
		]
	},
	{
		id: 'arpeggiator',
		label: 'Arpeggiator',
		fields: [
			selectField('arpEnabled', 'Arp', ['off', 'on'], 'off'),
			selectField(
				'arpPattern',
				'Pattern',
				['up', 'down', 'up-down', 'played', 'random'],
				'up'
			),
			selectField('arpRate', 'Rate', ['1/4', '1/8', '1/8T', '1/16'], '1/8'),
			rangeField('arpOctaves', 'Octaves', 1, 4, 1, 1),
			rangeField('arpGate', 'Gate', 0.1, 0.95, 0.01, 0.62),
			rangeField('arpBpm', 'Tempo', 50, 220, 1, 120, ' BPM')
		]
	}
];

function selectField(param, label, options, initialValue) {
	return {
		param,
		label,
		type: 'select',
		options,
		initialValue,
		domain: 'performance',
		badge: 'PERFORM',
		mode: 'performance',
		legacyKey: null
	};
}

function rangeField(
	param,
	label,
	min,
	max,
	step,
	initialValue,
	unit = ''
) {
	return {
		param,
		label,
		type: 'range',
		min,
		max,
		step,
		initialValue,
		unit,
		domain: 'performance',
		badge: 'PERFORM',
		mode: 'performance',
		legacyKey: null
	};
}
