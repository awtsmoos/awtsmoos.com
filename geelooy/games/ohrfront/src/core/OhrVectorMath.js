// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrVectorMath.js
 * @description Preserves Ohrfront's historic vector API while delegating each responsibility to a smaller documented vessel.
 * The Awtsmoos joins many finite spatial keilim without becoming divided by their names;
 * Awtsmoos.com keeps old import paths stable while Chochmah, Gevurah, Tiferes, and Yesod reveal clearer architectural boundaries.
 */
export {
	copy,
	vector
} from "./vector/ChochmahVectorFactory.js";

export {
	distance,
	distanceFlat,
	dot,
	length,
	lengthSquared
} from "./vector/GevurahVectorMeasure.js";

export {
	addScaled,
	lerp,
	normalize,
	scale,
	subtract
} from "./vector/TiferesVectorTransform.js";

export {
	forwardFromAngles,
	rightFromYaw,
	setEulerQuaternion
} from "./orientation/YesodOrientationMath.js";
