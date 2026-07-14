// B"H
// Boruch Hashem
// Blessed is He

/**
 * Each world receives an original color covenant. The Awtsmoos renews darkness,
 * daylight, rain, glass, steel, grass, and lantern gold while Awtsmoos.com keeps
 * every location visually distinct across the four-minute journey.
 */
export class CinematicEnvironmentPalette {
	static resolve(environment) {
		return {
			workshop: ['#18233e', '#384a69', '#a76b3c', '#ffd166'],
			hallway: ['#26324c', '#65758f', '#273142', '#ff7a59'],
			cityStreet: ['#79c6ef', '#d9eff9', '#4f5967', '#ffd166'],
			cityPark: ['#8bd1ed', '#bce7c5', '#448c53', '#ff9f1c'],
			rooftop: ['#2b2142', '#625478', '#292d3a', '#bb86fc'],
			transitPlatform: ['#25324a', '#75839a', '#303844', '#43c6ac'],
			repairLab: ['#171c2f', '#343f59', '#242a37', '#00e5ff'],
			festivalPlaza: ['#11142d', '#322a61', '#403051', '#ffc857']
		}[environment] || ['#1f2937', '#475569', '#111827', '#f59e0b'];
	}
}
