//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file native-icons.js
 * @description
 * Replaces Material Icons font ligature names with compact Unicode symbols using
 * browser-native DOM observation. Playback code may keep changing `textContent`;
 * this adapter translates each new icon name without a font CDN or package.
 */

const ICONS = Object.freeze({
	add: "+",
	content_cut: "✂",
	delete: "⌫",
	pause: "⏸",
	play_arrow: "▶",
	save_alt: "⇩",
	skip_previous: "⏮",
	stop: "■",
	zoom_in: "＋",
	zoom_out: "−"
});

/**
 * Converts one legacy Material icon node when its ligature name is known.
 *
 * @param {Element} element Candidate icon element.
 * @returns {boolean} Whether a native symbol replaced the current value.
 */
function revealNativeIcon(element) {
	if (!element?.classList?.contains("material-icons")) {
		return false;
	}
	const key = String(element.textContent || "").trim();
	const symbol = ICONS[key];
	if (!symbol) {
		return false;
	}
	element.dataset.nativeIcon = key;
	element.textContent = symbol;
	return true;
}

/**
 * Reveals every existing icon and keeps later playback mutations dependency-free.
 *
 * @returns {() => void} Cleanup callback for tests or future app teardown.
 */
function mountNativeIcons() {
	for (const element of document.querySelectorAll(".material-icons")) {
		revealNativeIcon(element);
	}
	const observer = new MutationObserver(records => {
		for (const record of records) {
			const element = record.target.nodeType === Node.TEXT_NODE
				? record.target.parentElement
				: record.target;
			revealNativeIcon(element);
			for (const child of record.addedNodes || []) {
				if (child.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				revealNativeIcon(child);
				for (const nested of child.querySelectorAll?.(".material-icons") || []) {
					revealNativeIcon(nested);
				}
			}
		}
	});
	observer.observe(document.body, {
		childList: true,
		characterData: true,
		subtree: true
	});
	return () => observer.disconnect();
}

mountNativeIcons();
