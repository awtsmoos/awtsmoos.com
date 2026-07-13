// B"H
// Boruch Hashem
// Blessed is He

export const taharotQuests = Object.freeze({
	mikvaot_1_pure_waters: {
		id: 'mikvaot_1_pure_waters',
		name: 'Waters of Knowledge',
		desc: 'The Echo of Rambam speaks of a spiritual impurity clouding the caverns.',
		status: 'locked',
		objectives: [
			{ id: 'find_chamber', text: 'Find the hidden Chamber of Pure Waters.', completed: false },
			{ id: 'defeat_drawn_water', text: 'Overcome the concept of Drawn Water.', completed: false, target: { type: 'defeat', musagId: 'drawn_water_elemental', count: 1 } },
			{ id: 'learn_mikveh_law', text: 'Find the lost page on Hilchot Mikvaot.', completed: false, target: { type: 'acquire', itemId: 'rambam_page_mikvaot' } },
			{ id: 'purify_chamber', text: 'Use true knowledge to purify the chamber.', completed: false }
		],
		rewards: { musagim: [{ id: 'benevolent_stream', level: 10 }] }
	}
});

/** A legacy ascent kept intact while the authored campaign grows beside it. */
export const towerQuests = Object.freeze({
	climb_1234: {
		id: 'climb_1234',
		name: 'The Tower of 1234',
		desc: 'Reach the summit of the tower and gather its numbered sparks.',
		status: 'available',
		objectives: [
			{ id: 'collect_spark_100', text: 'Reach Floor 100.', completed: false, target: { type: 'collect', itemId: 'spark_tohu_100', count: 1 } },
			{ id: 'collect_spark_500', text: 'Reach Floor 500.', completed: false, target: { type: 'collect', itemId: 'spark_tohu_500', count: 1 } },
			{ id: 'collect_spark_1000', text: 'Reach Floor 1000.', completed: false, target: { type: 'collect', itemId: 'spark_tohu_1000', count: 1 } },
			{ id: 'reach_top', text: 'Acquire Spark #1234.', completed: false, target: { type: 'collect', itemId: 'spark_tohu_1234', count: 1 } }
		],
		rewards: { money: { perutah: 12340 }, xp: 50000 }
	}
});
