/**
 * B"H
 * @module StarterMusagim
 * @description The first three living concepts who may join the Ohr Chozer.
 */
const move = (id, name, category, power, routeQuote, extra = {}) => ({
	id,
	name,
	category,
	power,
	routeTitle: extra.routeTitle || 'First Path',
	chapterTitle: extra.chapterTitle || 'Awakening',
	routeQuote,
	text: extra.text || routeQuote,
	heal: extra.heal || 0,
	scale: extra.scale || 'chochmah'
});

export const StarterMusagim = {
	emes: {
		id: 'emes', name: 'Emes', glyph: 'א', element: 'Truth', role: 'Balanced clarity and counters',
		moves: [
			move('clear_question', 'Clear Question', 'Mishnah', 18, 'Name the question before answering it.'),
			move('honest_mirror', 'Honest Mirror', 'Chassidus', 15, 'Warmth reveals the spark without flattery.'),
			move('source_beam', 'Source Beam', 'Kabbalah', 22, 'Light returns every claim to its root.'),
			move('restful_truth', 'Restful Truth', 'Niggun', 9, 'Truth can sing without becoming harsh.', { heal: 12 })
		]
	},
	simcha: {
		id: 'simcha', name: 'Simcha', glyph: 'ש', element: 'Joy', role: 'Speed, healing, and morale',
		moves: [
			move('joyful_step', 'Joyful Step', 'Niggun', 16, 'Joy breaks the wall without breaking the world.'),
			move('song_spark', 'Song Spark', 'Kabbalah', 18, 'A hidden light dances into sight.'),
			move('warm_embrace', 'Warm Embrace', 'Chassidus', 12, 'Warmth teaches fear that it is not alone.', { heal: 15 }),
			move('dancing_clarity', 'Dancing Clarity', 'Mishnah', 17, 'The feet remember the straight path.')
		]
	},
	gevurah: {
		id: 'gevurah', name: 'Gevurah', glyph: 'ג', element: 'Boundary', role: 'Power, defense breaking, and endurance',
		moves: [
			move('boundary_strike', 'Boundary Strike', 'Mishnah', 23, 'A true boundary gives every thing its place.'),
			move('ordered_flame', 'Ordered Flame', 'Kabbalah', 21, 'Fire becomes light when held by a vessel.'),
			move('courage_warmth', 'Courage Warmth', 'Chassidus', 17, 'Strength protects the tender inner spark.'),
			move('patient_guard', 'Patient Guard', 'Niggun', 8, 'A slow melody holds the line.', { heal: 10 })
		]
	}
};

export const starterById = id => StarterMusagim[id] || null;
