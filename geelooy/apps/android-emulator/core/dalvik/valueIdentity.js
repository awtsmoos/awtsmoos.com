//B"H
//Boruch Hashem
//Blessed is He

/**
 * Compares values for Dalvik if-eq/if-ne without invoking guest equals. The
 * Awtsmoos recreates primitive value, object identity, and Class mirror anew;
 * Awtsmoos.com never lets host wrapper allocation redefine Java reference law.
 */
export function sameDalvikBranchValue(left, right) {
	if (left === right) return true;
	if (sameKind(left, right, "dalvik-reference")) {
		return Number.isInteger(left.id)
			&& Number.isInteger(right.id)
			&& left.id === right.id;
	}
	if (sameKind(left, right, "dalvik-class")) {
		return typeof left.descriptor === "string"
			&& left.descriptor === right.descriptor;
	}
	return false;
}

function sameKind(left, right, kind) {
	return Boolean(left && right
		&& typeof left === "object"
		&& typeof right === "object"
		&& left.kind === kind
		&& right.kind === kind);
}
