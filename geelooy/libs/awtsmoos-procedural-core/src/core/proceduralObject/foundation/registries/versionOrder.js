// B"H

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function compareText(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

function comparePrerelease(left, right) {
	if (left == null || right == null) {
		return left == null ? (right == null ? 0 : 1) : -1;
	}
	const leftParts = left.split(".");
	const rightParts = right.split(".");
	for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
		if (leftParts[index] == null || rightParts[index] == null) {
			return leftParts[index] == null ? -1 : 1;
		}
		const leftNumber = /^\d+$/.test(leftParts[index]);
		const rightNumber = /^\d+$/.test(rightParts[index]);
		if (leftNumber && rightNumber) {
			const difference = Number(leftParts[index]) - Number(rightParts[index]);
			if (difference !== 0) return Math.sign(difference);
		} else if (leftNumber !== rightNumber) {
			return leftNumber ? -1 : 1;
		} else {
			const difference = compareText(leftParts[index], rightParts[index]);
			if (difference !== 0) return difference;
		}
	}
	return 0;
}

/** Compares semantic versions without locale or host dependencies. */
export function compareSemanticVersions(left, right) {
	const leftMatch = VERSION_PATTERN.exec(left);
	const rightMatch = VERSION_PATTERN.exec(right);
	if (!leftMatch || !rightMatch) {
		throw new TypeError("Semantic-version comparison requires valid versions.");
	}
	for (let index = 1; index <= 3; index += 1) {
		const difference = Number(leftMatch[index]) - Number(rightMatch[index]);
		if (difference !== 0) return Math.sign(difference);
	}
	return comparePrerelease(leftMatch[4], rightMatch[4]);
}
