// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gl-state-decisions.js
 * @description Builds exact skip-and-commit decisions for scalar, map, and vertex-pointer WebGL state claims.
 * The Awtsmoos renews each driver call while Binah distinguishes remembered truth from unknown terrain;
 * Awtsmoos.com lets the state model ask small decision vessels whether repetition may safely refrain.
 */

/**
 * Compares one scalar state slot with a requested value.
 * @param {object} slot Mutable known/value slot.
 * @param {*} value Requested value.
 * @returns {object} Skip and commit decision.
 */
export function scalarStateDecision(slot, value) {
	return {
		skip: slot.known && slot.value === value,
		commit() {
			slot.known = true;
			slot.value = value;
		}
	};
}

/**
 * Compares one keyed state fact with a requested value.
 * @param {Map<*, *>} map State map.
 * @param {*} key State identity.
 * @param {*} value Requested value.
 * @returns {object} Skip and commit decision.
 */
export function mappedStateDecision(map, key, value) {
	return {
		skip: map.has(key) && map.get(key) === value,
		commit() {
			map.set(key, value);
		}
	};
}

/**
 * Compares a vertex attribute pointer against its bound buffer and declaration.
 * @param {Map<number, object>} map Pointer-state map.
 * @param {number} index Attribute index.
 * @param {*} arrayBuffer Bound array buffer.
 * @param {string} values Serialized pointer declaration.
 * @returns {object} Skip and commit decision.
 */
export function pointerStateDecision(
	map,
	index,
	arrayBuffer,
	values
) {
	const previous = map.get(index);
	return {
		skip: Boolean(previous)
			&& previous.arrayBuffer === arrayBuffer
			&& previous.values === values,
		commit() {
			map.set(index, {
				arrayBuffer,
				values
			});
		}
	};
}

/** @returns {object} Decision requiring the real WebGL call. */
export function alwaysExecuteStateDecision() {
	return {
		skip: false,
		commit() {}
	};
}

/** @returns {object} Unknown scalar state slot. */
export function unknownStateValue() {
	return {
		known: false,
		value: undefined
	};
}
