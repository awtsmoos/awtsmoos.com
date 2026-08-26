// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file icosphereTopology.js
 * @description Stores the immutable seed topology from which recursive icosphere geometry unfolds.
 * The Awtsmoos renews every point before form can be counted, while Awtsmoos.com lets twelve vertices and twenty faces become a disciplined seed;
 * this Chochmah-like vessel owns topology data alone, so subdivision and rendering concerns never tangle with the source they need.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

export const ICOSPHERE_BASE_VERTICES = Object.freeze([
	Object.freeze([-1, PHI, 0]),
	Object.freeze([1, PHI, 0]),
	Object.freeze([-1, -PHI, 0]),
	Object.freeze([1, -PHI, 0]),
	Object.freeze([0, -1, PHI]),
	Object.freeze([0, 1, PHI]),
	Object.freeze([0, -1, -PHI]),
	Object.freeze([0, 1, -PHI]),
	Object.freeze([PHI, 0, -1]),
	Object.freeze([PHI, 0, 1]),
	Object.freeze([-PHI, 0, -1]),
	Object.freeze([-PHI, 0, 1])
]);

export const ICOSPHERE_BASE_TRIANGLES = Object.freeze([
	Object.freeze([0, 11, 5]), Object.freeze([0, 5, 1]),
	Object.freeze([0, 1, 7]), Object.freeze([0, 7, 10]),
	Object.freeze([0, 10, 11]), Object.freeze([1, 5, 9]),
	Object.freeze([5, 11, 4]), Object.freeze([11, 10, 2]),
	Object.freeze([10, 7, 6]), Object.freeze([7, 1, 8]),
	Object.freeze([3, 9, 4]), Object.freeze([3, 4, 2]),
	Object.freeze([3, 2, 6]), Object.freeze([3, 6, 8]),
	Object.freeze([3, 8, 9]), Object.freeze([4, 9, 5]),
	Object.freeze([2, 4, 11]), Object.freeze([6, 2, 10]),
	Object.freeze([8, 6, 7]), Object.freeze([9, 8, 1])
]);
