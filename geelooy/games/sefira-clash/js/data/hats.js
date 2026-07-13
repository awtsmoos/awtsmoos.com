//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hats vessel in this instant, revealing
 * its focused js data service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Hat class data.
 *
 * Chapter 206: hats stop being decoration only. Each covering becomes a tiny
 * class modifier: movement, knockback, recovery, charge, jump, or defense.
 */
export const HATS = {
	kippah: hat('kippah', 'Yarmulke', {
		knock: 1,
		charge: 1,
		airDrift: 1,
		recovery: 1,
		defense: 1,
		extraJump: 0
	}),
	blackhat: hat('blackhat', 'Black Hat', {
		knock: 1.16,
		charge: 0.96,
		airDrift: 0.98,
		recovery: 1,
		defense: 1.02,
		extraJump: 0
	}),
	tophat: hat('tophat', 'Top Hat', {
		knock: 1,
		charge: 1.24,
		airDrift: 1,
		recovery: 1,
		defense: 0.98,
		extraJump: 0
	}),
	cap: hat('cap', 'Cap', {
		knock: 0.98,
		charge: 1,
		airDrift: 1.12,
		recovery: 1,
		defense: 1,
		extraJump: 0
	}),
	beanie: hat('beanie', 'Beanie', {
		knock: 0.96,
		charge: 1.05,
		airDrift: 1.06,
		recovery: 1.05,
		defense: 1,
		extraJump: 0
	}),
	crown: hat('crown', 'Crown', {
		knock: 1.05,
		charge: 0.9,
		airDrift: 1,
		recovery: 1,
		defense: 0.96,
		extraJump: 1
	}),
	helmet: hat('helmet', 'Helmet', {
		knock: 0.92,
		charge: 0.94,
		airDrift: 0.92,
		recovery: 0.96,
		defense: 1.18,
		extraJump: 0
	}),
	turban: hat('turban', 'Wrap', {
		knock: 1,
		charge: 1.05,
		airDrift: 1.05,
		recovery: 1.12,
		defense: 1,
		extraJump: 0
	})
};

function hat(id, label, stats) {
	return { id, label, stats };
}
