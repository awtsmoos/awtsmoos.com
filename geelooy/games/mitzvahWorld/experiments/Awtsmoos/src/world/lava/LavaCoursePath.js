//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaCoursePath.js
 * @description Generates the deterministic forgiving platform path crossing the extended lava sea.
 * Route shape remains gameplay-owned and renderer-neutral so collision and visuals consume the same finite coordinates.
 */

/**
 * Creates the complete ordered platform-center path from entry shelf through the final landing.
 * @returns {Array<{x:number,y:number,z:number,sx:number,sz:number,yaw:number}>} Stable platform path.
 */
export function createLavaCourseNodes() {
	const nodes = [
		{
			x: -62,
			y: 0.48,
			z: 42,
			sx: 6.2,
			sz: 5.2,
			yaw: 0
		}
	];

	for (let index = 1; index <= 30; index += 1) {
		nodes.push(createIntermediateNode(index));
	}

	nodes.push({
		x: 39.5,
		y: 1.02,
		z: 43,
		sx: 7.4,
		sz: 5.6,
		yaw: 0.08
	});

	return nodes;
}

/**
 * Creates one bounded intermediate platform with periodic recovery-sized shelves.
 * @param {number} index One-based intermediate platform index.
 * @returns {{x:number,y:number,z:number,sx:number,sz:number,yaw:number}} Platform descriptor.
 */
function createIntermediateNode(index) {
	const x = -62 + index * 3.2;
	const z = 42
		+ Math.sin(index * 0.48) * 6.4
		+ Math.cos(index * 0.21) * 2.2;
	const big = index % 5 === 0 || index % 7 === 0;

	return {
		x,
		y: 0.56 + (index % 4) * 0.08,
		z,
		sx: big ? 4.4 : 3.0,
		sz: index % 3 === 0
			? 3.8
			: (big ? 4.1 : 2.85),
		yaw: index * 0.08
	};
}
