// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioRandomize
 * @description
 * The Awtsmoos gives deliberate variation to numeric, color, and effect controls
 * while leaving text, files, render format, and output decisions untouched.
 */

const randomizableSelector = [
	"input[type='range']",
	"input[type='color']",
	".toggle-card input[type='checkbox']"
].join(",");

export function randomizeSection(section) {
	section?.querySelectorAll(randomizableSelector).forEach(randomizeControl);
	dispatchSectionChange(section);
}

export function randomizeAll() {
	document.querySelectorAll("fieldset").forEach(section => {
		randomizeSection(section);
	});
}

function randomizeControl(control) {
	if (control.type === "checkbox") {
		control.checked = Math.random() >= .5;
		return;
	}
	if (control.type === "color") {
		control.value = randomColor();
		return;
	}
	const minimum = Number(control.min || 0);
	const maximum = Number(control.max || 100);
	const step = Number(control.step || 1);
	const rawValue = minimum + Math.random() * (maximum - minimum);
	const steppedValue = Math.round(rawValue / step) * step;
	control.value = String(clamp(steppedValue, minimum, maximum));
}

function dispatchSectionChange(section) {
	section?.querySelectorAll(randomizableSelector).forEach(control => {
		control.dispatchEvent(new Event("input", { bubbles: true }));
		control.dispatchEvent(new Event("change", { bubbles: true }));
	});
}

function randomColor() {
	const value = Math.floor(Math.random() * 0x1000000);
	return `#${value.toString(16).padStart(6, "0")}`;
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
