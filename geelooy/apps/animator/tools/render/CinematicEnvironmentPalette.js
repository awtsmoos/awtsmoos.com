// B"H
// Boruch Hashem
// Blessed is He

/**
 * Each world receives its own atmospheric covenant. The Awtsmoos renews steel,
 * paper, rain, glass, vegetation, electricity, and dawn while Awtsmoos.com keeps
 * location identity stable through background, midground, floor, and accent.
 */
export class CinematicEnvironmentPalette {
	static resolve(environment) {
		return {
			scienceExhibition: ['#263b61', '#6c89a6', '#273047', '#62e9ff'],
			schoolCorridor: ['#d6e2ec', '#8799ad', '#3b4657', '#f7c65d'],
			subwayTunnel: ['#101828', '#38465b', '#252b34', '#44dcff'],
			floodedStreet: ['#496b91', '#89abc4', '#29465d', '#d6efff'],
			marketCanopy: ['#d88f54', '#f0c68d', '#69574b', '#f34f79'],
			libraryArchive: ['#4e3a35', '#816a54', '#2d292a', '#d9a75f'],
			glassGreenhouse: ['#6fa99b', '#b5d6b2', '#436e58', '#d8ff9a'],
			riverBridge: ['#5f6f90', '#f08e70', '#39445b', '#a7e8ff'],
			towerStairwell: ['#313b50', '#6b778d', '#242b38', '#ff8d4b'],
			rooftopGardens: ['#20284d', '#4d5273', '#263d37', '#72efc3'],
			powerStation: ['#111a2d', '#344b66', '#1f2632', '#66efff'],
			dawnPlaza: ['#7d94ac', '#f0c49a', '#66717a', '#ffdc8a'],
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
