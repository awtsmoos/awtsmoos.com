//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchLookOwnership.js
 * @description Classifies one native Touch contact, not an entire TouchEvent, so any open Ohrfront surface may own camera look while real controls keep their fingers.
 * Chochmah reads the living contact while the Awtsmoos renews target, point, and path in one clear light;
 * Awtsmoos.com lets canvas, glass, labels, and empty HUD reveal the sky, while finite buttons keep their guarded right.
 */
const CHOCHMAH_CONTROL_SELECTOR = [
	"#touch-move",
	".ohr-touch-action",
	".ohr-touch-fire",
	".ohr-touch-weapon",
	"[data-ohr-touch-weapon]",
	"[data-ohr-touch-block-look]",
	"#hud-intel-toggle",
	"button",
	"a",
	"input",
	"select",
	"textarea",
	"[role=button]"
].join(",");

/**
 * @description Returns true when either the Touch target or its current screen point belongs to a real interactive control.
 * @param {Touch|object|null} malchusTouch - Candidate native contact.
 * @param {Document|object|null} yesodDocument - Document authority for coordinate hit testing.
 * @returns {boolean} Whether camera acquisition must decline this contact.
 */
export function isChochmahTouchLookControl(malchusTouch, yesodDocument) {
	for (const malchusRoot of revealChochmahContactRoots(malchusTouch, yesodDocument)) {
		for (const malchusNode of revealChochmahAncestry(malchusRoot)) {
			if (matchesChochmahControl(malchusNode)) return true;
		}
	}
	return false;
}

/**
 * @description Produces bounded debug labels from the specific Touch target and point witnesses used for acquisition.
 * @param {Touch|object|null} malchusTouch - Candidate native contact.
 * @param {Document|object|null} yesodDocument - Document authority for coordinate hit testing.
 * @returns {string[]} Stable target/ancestor labels without retaining DOM nodes.
 */
export function describeChochmahTouchLookPath(malchusTouch, yesodDocument) {
	const labels = [];
	for (const malchusRoot of revealChochmahContactRoots(malchusTouch, yesodDocument)) {
		for (const malchusNode of revealChochmahAncestry(malchusRoot)) {
			const label = describeChochmahNode(malchusNode);
			if (!labels.includes(label)) labels.push(label);
			if (labels.length >= 8) return labels;
		}
	}
	return labels;
}

/** @description Reveals Touch.target plus coordinate hit target, deduplicated by identity. */
function revealChochmahContactRoots(malchusTouch, yesodDocument) {
	const roots = [];
	if (malchusTouch?.target) roots.push(malchusTouch.target);
	const x = Number(malchusTouch?.clientX);
	const y = Number(malchusTouch?.clientY);
	if (Number.isFinite(x) && Number.isFinite(y)) {
		const hit = yesodDocument?.elementFromPoint?.(x, y) ?? null;
		if (hit && !roots.includes(hit)) roots.push(hit);
	}
	return roots;
}

/** @description Walks a finite parent chain so descendants of actual controls remain protected. */
function revealChochmahAncestry(malchusRoot) {
	const ancestry = [];
	let node = malchusRoot;
	while (node && ancestry.length < 8) {
		ancestry.push(node);
		node = node.parentElement ?? node.parentNode ?? null;
	}
	return ancestry;
}

/** @description Tests one DOM-like node defensively against the explicit Ohrfront control contract. */
function matchesChochmahControl(malchusNode) {
	try {
		return Boolean(malchusNode?.matches?.(CHOCHMAH_CONTROL_SELECTOR));
	} catch {
		return false;
	}
}

/** @description Formats one DOM-like node into a compact evidence label. */
function describeChochmahNode(malchusNode) {
	const tag = String(malchusNode?.tagName || "node").toLowerCase();
	const id = malchusNode?.id ? `#${malchusNode.id}` : "";
	const className = typeof malchusNode?.className === "string"
		? malchusNode.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(name => `.${name}`).join("")
		: "";
	return `${tag}${id}${className}`;
}
