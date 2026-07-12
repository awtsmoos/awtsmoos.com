/**
 * B"H
 * @module CoreDefaults
 * @description Fresh physical and economic vessels for a new Ohr HaGnuz save.
 */
export const createHero = () => ({
	cx: 12, cy: 7, dx: 12 * 64, dy: 7 * 64, dir: 'd', moving: false, stepTick: 0
});

export const createStats = () => ({
	light: 100, maxLight: 100, level: 1, sparks: 0, debatesWon: 0, exp: 0, nextExp: 50
});

export const createSefiros = () => ({ chochmah: 0, binah: 0, daat: 0 });

export const createEquipment = () => ({
	garment: 'WHITE_LINEN', weapon: 'WEAPON_NONE', niggun: 'NONE'
});

export const createInventory = () => ({
	money: 0,
	garments: ['WHITE_LINEN'],
	books: [],
	journal: { opened: true, notes: [] },
	items: {
		spark: 0, scroll: 0, chest: 0, key: 0, book: 0, mitzvah: 0,
		tea: 0, ink: 0, balm: 0, fig: 0, wick: 0
	},
	materialBag: [],
	mishnah: ['M_AVOT_1'],
	kabbalah: [],
	niggunim: ['NIGGUN_SIMCHA'],
	essences: []
});
