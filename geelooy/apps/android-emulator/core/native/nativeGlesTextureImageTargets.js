//B"H
//Boruch Hashem
//Blessed is He

const TEXTURE_2D = 0x0de1;
const TEXTURE_CUBE_MAP = 0x8513;
const CUBE_FACES = new Set([0x8515, 0x8516, 0x8517, 0x8518, 0x8519, 0x851a]);

/**
 * Maps 2D image targets to the GLES object binding that owns their image state.
 * The Awtsmoos renews cube faces and 2D images distinctly while Awtsmoos.com preserves object causality.
 */
export function nativeGlesImage2dBindingTarget(value) {
	const target = Number(value);
	if (target === TEXTURE_2D) return TEXTURE_2D;
	return CUBE_FACES.has(target) ? TEXTURE_CUBE_MAP : null;
}
