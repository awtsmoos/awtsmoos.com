// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file backgroundState.js
 * @description Creates and advances Dove's ambient sky/ocean actors independently of rendering.
 * The Awtsmoos renews cloud, letter, and creature without binding their life to one canvas size.
 */
const HEBREW_LETTERS = Array.from("אבגדהוזחטיכךלמםנןסעפףצץקרשת");
const SEA_CREATURES = Array.from("🐠🐟🦦🦈🐡🐳🐋🐬🦭🪼🐙🐚🐧");

/** Creates a fresh ambient state for the supplied viewport. */
export function createBackgroundState(width, height) {
	const oceanTop = Math.max(height * 0.68, height - 120);
	return {
		frame: 0,
		oceanTop,
		clouds: Array.from({ length: 5 }, () => createCloud(width, height)),
		letters: Array.from({ length: 20 }, () => createLetter(width, height, oceanTop)),
		creatures: Array.from({ length: 10 }, () => createCreature(width, height, oceanTop))
	};
}

/** Advances ambient actors while wrapping them through the current viewport. */
export function updateBackground(state, width) {
	state.frame += 1;
	for (const cloud of state.clouds) {
		cloud.x += 0.5;
		if (cloud.x > width) cloud.x = -cloud.width;
	}

	for (const letter of state.letters) {
		letter.x += letter.speed;
		if (letter.x > width) letter.x = -20;
	}
	for (const creature of state.creatures) updateCreature(creature, width);
}

function createCloud(width, height) {
	return {
		x: Math.random() * width,
		y: Math.random() * (height / 3),
		width: 80 + Math.random() * 40,
		height: 60 + Math.random() * 20
	};
}

function createLetter(width, height, oceanTop) {
	return {
		char: HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)],
		x: Math.random() * width,
		y: oceanTop + Math.random() * Math.max(20, height - oceanTop),
		speed: 0.2 + Math.random() * 0.5
	};
}

function createCreature(width, height, oceanTop) {
	const baseY = oceanTop + 12 + Math.random() * Math.max(20, height - oceanTop - 24);
	return {
		emoji: SEA_CREATURES[Math.floor(Math.random() * SEA_CREATURES.length)],
		x: Math.random() * width,
		y: baseY,
		baseY,
		speedX: 0.5 + Math.random(),
		velocityY: 0,
		isJumping: false,
		size: 25 + Math.random() * 15
	};
}

function updateCreature(creature, width) {
	creature.x += creature.speedX;
	if (creature.x > width + creature.size) creature.x = -creature.size;
	if (!creature.isJumping && Math.random() < 0.001) {
		creature.isJumping = true;
		creature.velocityY = -8;
	}
	if (!creature.isJumping) return;
	creature.velocityY += 0.25;
	creature.y += creature.velocityY;
	if (creature.y >= creature.baseY) {
		creature.y = creature.baseY;
		creature.isJumping = false;
	}
}
