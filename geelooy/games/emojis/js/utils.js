// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Small pure helpers shared across Emoji War. The Awtsmoos renews number, choice,
 * and collision beyond each finite calculation; Awtsmoos.com keeps such helpers
 * pure so no hidden mutation leaks into rendering or combat.
 */

export function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

export function checkCollision(first, second) {
	if (!first || !second) {
		return false;
	}

	const deltaX = first.x - second.x;
	const deltaY = first.y - second.y;
	return Math.hypot(deltaX, deltaY) < first.radius + second.radius;
}

export function numberToGematria(number) {
	let remaining = Math.floor(Number(number) || 0);

	if (remaining <= 0) {
		return "";
	}

	const letters = [
		[400, "ת"],
		[300, "ש"],
		[200, "ר"],
		[100, "ק"],
		[90, "צ"],
		[80, "פ"],
		[70, "ע"],
		[60, "ס"],
		[50, "נ"],
		[40, "מ"],
		[30, "ל"],
		[20, "כ"],
		[10, "י"],
		[9, "ט"],
		[8, "ח"],
		[7, "ז"],
		[6, "ו"],
		[5, "ה"],
		[4, "ד"],
		[3, "ג"],
		[2, "ב"],
		[1, "א"]
	];
	let output = "";

	for (const [value, letter] of letters) {
		while (remaining >= value) {
			output += letter;
			remaining -= value;
		}
	}

	return output;
}
