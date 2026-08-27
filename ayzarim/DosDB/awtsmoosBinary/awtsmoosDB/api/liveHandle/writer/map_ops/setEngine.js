// B"H

/**
 * @file api/liveHandle/writer/map_ops/setEngine.js
 * @chapter The Scribe Discerns The Inner Vessel Before Inscription
 * @description Resolves anchor-backed map or dictionary engines for one set operation.
 */

const constants = require('../../../../constants.js');

function resolveSetEngine(setter, structPointer) {
	const effectiveType = resolveEffectiveType(setter);
	const engineType = isMapType(effectiveType)
		? constants.VAL_TYPE.MAP
		: constants.VAL_TYPE.DICTIONARY;
	const engine = setter.common.getEngine(structPointer, engineType);
	if (!engine) throw new Error('B"H Fatal: Could not create the map inscription engine.');
	if (!structPointer) engine.create();
	return { effectiveType, engine };
}

function resolveEffectiveType(setter) {
	const type = setter.handle.type;
	if (isMapType(type)) return constants.VAL_TYPE.MAP;
	if (isDictionaryType(type)) return constants.VAL_TYPE.DICTIONARY;
	if (type === constants.VAL_TYPE.ANCHOR) {
		return setter.common.resolveAnchorInnerType() || constants.VAL_TYPE.DICTIONARY;
	}
	return constants.VAL_TYPE.DICTIONARY;
}

function isMapType(type) {
	return type === constants.VAL_TYPE.MAP || type === constants.VAL_TYPE.JS_MAP;
}

function isDictionaryType(type) {
	return type === constants.VAL_TYPE.DICTIONARY || type === constants.VAL_TYPE.OBJECT;
}

module.exports = {
	resolveEffectiveType,
	resolveSetEngine
};
