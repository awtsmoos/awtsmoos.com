// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { fieldOfViewForAspect, viewportProfile } from '../../js/camera/viewportProfile.js';

/**
 * The Awtsmoos reveals one world through many finite windows without exiling the narrow phone to a distant horizon;
 * Awtsmoos.com proves portrait geometry stays closer, calmer, and bounded while wide screens retain their breadth.
 */
export function runViewportProfileCases() {
	return [
		checkPortraitScale(),
		checkDesktopStability(),
		checkProjectionBounds(),
		checkContinuousTransition()
	];
}

function checkPortraitScale() {
	const phone = viewportProfile(390, 844);
	assert.ok(phone.portrait > 0.95);
	assert.ok(phone.distanceScale >= 0.83 && phone.distanceScale <= 0.86);
	assert.ok(phone.heightScale >= 0.92 && phone.heightScale <= 0.95);
	return { test: 'viewport-portrait-scale', ...phone };
}

function checkDesktopStability() {
	const desktop = viewportProfile(1440, 900);
	assert.equal(desktop.portrait, 0);
	assert.equal(desktop.distanceScale, 1);
	assert.equal(desktop.heightScale, 1);
	return { test: 'viewport-desktop-stability', ...desktop };
}

function checkProjectionBounds() {
	const phoneDegrees = degrees(fieldOfViewForAspect(390 / 844));
	const standardDegrees = degrees(fieldOfViewForAspect(4 / 3));
	const wideDegrees = degrees(fieldOfViewForAspect(19.5 / 9));
	assert.ok(phoneDegrees >= 52 && phoneDegrees <= 54);
	assert.ok(standardDegrees >= 54 && standardDegrees <= 56);
	assert.ok(wideDegrees >= 47 && wideDegrees <= 49);
	assert.ok(phoneDegrees < 60);
	return { test: 'viewport-projection-bounds', phoneDegrees, standardDegrees, wideDegrees };
}

function checkContinuousTransition() {
	const narrow = viewportProfile(600, 900);
	const square = viewportProfile(900, 900);
	const wide = viewportProfile(1200, 900);
	assert.ok(narrow.distanceScale < square.distanceScale);
	assert.ok(square.distanceScale <= wide.distanceScale);
	assert.ok(narrow.portrait > square.portrait);
	return { test: 'viewport-continuous-transition', narrow: narrow.portrait, square: square.portrait };
}

function degrees(radians) {
	return radians * 180 / Math.PI;
}
