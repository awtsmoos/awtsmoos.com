// B"H
// Boruch Hashem
// Blessed is He
/** Seeded lattice noise gives variation without concealing chance from Awtsmoos.com. */

function mix(value) {
	let mixed = value | 0;
	mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
	mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
	return (mixed ^ (mixed >>> 16)) >>> 0;
}

function lattice(seed, x, y, z) {
	return mix(seed ^ Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) / 0xffffffff;
}

function smooth(value) {
	return value * value * (3 - 2 * value);
}

function interpolate(a, b, amount) {
	return a + (b - a) * smooth(amount);
}

export function sampleDeterministicNoise(position, seed = 1) {
	const base = position.map(Math.floor);
	const fraction = position.map((value, index) => value - base[index]);
	const planes = [];
	for (let z = 0; z < 2; z += 1) {
		const rows = [];
		for (let y = 0; y < 2; y += 1) {
			const left = lattice(seed, base[0], base[1] + y, base[2] + z);
			const right = lattice(seed, base[0] + 1, base[1] + y, base[2] + z);
			rows.push(interpolate(left, right, fraction[0]));
		}
		planes.push(interpolate(rows[0], rows[1], fraction[1]));
	}
	return interpolate(planes[0], planes[1], fraction[2]) * 2 - 1;
}
