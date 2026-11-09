//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeIcons
 * @description
 * The Awtsmoos Archive's icon set: crisp, professional, intense inline SVGs.
 * Every icon is a trusted constant from this module only — never from archive
 * or user data — so renderers may inject them with innerHTML safely. Icons
 * use currentColor with layered opacities for depth (a darker back layer plus
 * a full-strength front layer), so they inherit the button/row colour and
 * stay consistent on the dark cyan/gold Archive surface. No external icon
 * CDN: the page works fully self-contained. The gear outline follows the
 * Feather icon style (MIT-licensed open-source shape).
 */

const svgOpen = '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"';
const strokeAttrs = ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

/** Gold folder with a visible tab and a lit front flap (year rows). */
export const ICON_FOLDER = `${svgOpen}>` +
	'<path d="M2 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" fill="currentColor" opacity=".45"/>' +
	'<path d="M3 10.5h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7z" fill="currentColor"/>' +
	'<path d="M4.5 11.6h15" stroke="#ffffff" stroke-opacity=".35" stroke-width="1" stroke-linecap="round" fill="none"/></svg>';

/** Gold open folder with a document peeking out (event rows). */
export const ICON_FOLDER_OPEN = `${svgOpen}>` +
	'<path d="M2 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" fill="currentColor" opacity=".45"/>' +
	'<path d="M8.5 6.5h7v5h-7z" fill="#ffffff" opacity=".92"/>' +
	'<path d="M10 8.4h4M10 10.2h4" stroke="#8a8a8a" stroke-width=".9" stroke-linecap="round" fill="none"/>' +
	'<path d="M3 13l2-2h14l2 2v4.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13z" fill="currentColor"/>' +
	'<path d="M4.5 12.4l1.2-1.2M19.5 12.4l-1.2-1.2" stroke="#ffffff" stroke-opacity=".3" stroke-width="1" stroke-linecap="round" fill="none"/></svg>';

/** Cyan globe with meridians (open on Archive.org). */
export const ICON_GLOBE = `${svgOpen}${strokeAttrs}` +
	'<circle cx="12" cy="12" r="8.5"/>' +
	'<ellipse cx="12" cy="12" rx="3.8" ry="8.5"/>' +
	'<path d="M3.5 12h17"/>' +
	'<path d="M5.8 7.8c3.8 1.9 8.6 1.9 12.4 0"/>' +
	'<path d="M5.8 16.2c3.8-1.9 8.6-1.9 12.4 0"/></svg>';

/** Download: arrow down into a tray. */
export const ICON_DOWNLOAD = `${svgOpen}${strokeAttrs}` +
	'<path d="M12 4v10"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4.5 19.5h15"/></svg>';

/** Lightning bolt (cache offline). */
export const ICON_BOLT = `${svgOpen}>` +
	'<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z" fill="currentColor"/></svg>';

/** Five-point star (save to bookshelf). */
export const ICON_STAR = `${svgOpen}>` +
	'<path d="M12 3.2l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6L3.3 9.6l6-.9z" fill="currentColor"/></svg>';

/** Bookmark ribbon (bookshelf spine). */
export const ICON_BOOKMARK = `${svgOpen}>` +
	'<path d="M6.5 3.5h11V21L12 17.2 6.5 21V3.5z" fill="currentColor"/></svg>';

/** Beamed eighth notes (add to playlist). */
export const ICON_MUSIC = `${svgOpen}${strokeAttrs}` +
	'<path d="M9 18.5V6l10-2.5V16"/><circle cx="6.8" cy="18.5" r="2.4" fill="currentColor" stroke="none"/><circle cx="16.8" cy="16" r="2.4" fill="currentColor" stroke="none"/></svg>';

/** Checkbox with a check (select all). */
export const ICON_CHECK_SQUARE = `${svgOpen}${strokeAttrs}` +
	'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>';

/** Plus (add selected). */
export const ICON_PLUS = `${svgOpen}${strokeAttrs}` +
	'<path d="M12 5v14M5 12h14"/></svg>';

/** Share: three nodes joined by lines. */
export const ICON_SHARE = `${svgOpen}${strokeAttrs}` +
	'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/>' +
	'<path d="M8.2 10.8l7.6-4.3"/><path d="M8.2 13.2l7.6 4.3"/></svg>';

/** Search: lens ring, handle, and a glint. */
export const ICON_SEARCH = `${svgOpen}${strokeAttrs}` +
	'<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8L20.5 20.5"/>' +
	'<circle cx="8.6" cy="8.6" r="1" fill="currentColor" stroke="none" opacity=".55"/></svg>';

/** Terminal: window with a prompt and cursor. */
export const ICON_TERMINAL = `${svgOpen}${strokeAttrs}` +
	'<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7 9.5l3 3-3 3"/><path d="M12.5 15.5H17"/></svg>';

/** Gear (Feather icon style, MIT-licensed open-source shape). */
export const ICON_SETTINGS = `${svgOpen} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">` +
	'<circle cx="12" cy="12" r="3"/>' +
	'<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

/** Previous track: bar plus a left triangle. */
export const ICON_PREV = `${svgOpen}>` +
	'<rect x="5" y="6" width="2.6" height="12" rx="1.3" fill="currentColor"/>' +
	'<path d="M19.5 6.8v10.4a.9.9 0 0 1-1.4.7L9 12.7a.9.9 0 0 1 0-1.5l9.1-5.2a.9.9 0 0 1 1.4.8z" fill="currentColor"/></svg>';

/** Play: right triangle with eased corners. */
export const ICON_PLAY = `${svgOpen}>` +
	'<path d="M8 5.4v13.2a.9.9 0 0 0 1.4.7l10-6.6a.9.9 0 0 0 0-1.5l-10-6.6a.9.9 0 0 0-1.4.8z" fill="currentColor"/></svg>';

/** Pause: two rounded bars. */
export const ICON_PAUSE = `${svgOpen}>` +
	'<rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/>' +
	'<rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/></svg>';

/** Next track: right triangle plus a bar. */
export const ICON_NEXT = `${svgOpen}>` +
	'<rect x="16.4" y="6" width="2.6" height="12" rx="1.3" fill="currentColor"/>' +
	'<path d="M4.5 6.8v10.4a.9.9 0 0 0 1.4.7L15 12.7a.9.9 0 0 0 0-1.5L5.9 6a.9.9 0 0 0-1.4.8z" fill="currentColor"/></svg>';

/** Scissors (slice / open Studio). */
export const ICON_SCISSORS = `${svgOpen}${strokeAttrs}` +
	'<circle cx="6" cy="6.5" r="2.3"/><circle cx="6" cy="17.5" r="2.3"/>' +
	'<path d="M8.2 7.8L20 19"/><path d="M8.2 16.2L20 5"/>' +
	'<circle cx="14" cy="12" r="1" fill="currentColor" stroke="none"/></svg>';

/** Stop: rounded square. */
export const ICON_STOP = `${svgOpen}>` +
	'<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';

/** Close: two crossing strokes. */
export const ICON_X = `${svgOpen}${strokeAttrs}` +
	'<path d="M6 6l12 12M18 6L6 18"/></svg>';

/**
 * Creates a live SVG element from a trusted icon constant (this module only).
 * Parses the fixed string with DOMParser — no innerHTML — so callers under a
 * no-innerHTML contract (the bookshelf card factory) can render an icon too.
 * Returns null when DOMParser is unavailable or the constant fails to parse.
 */
export function createIconElement(root, iconSvg) {
	if (typeof DOMParser === 'undefined') {
		return null;
	}
	const svgDoc = new DOMParser().parseFromString(iconSvg, 'image/svg+xml');
	const svgElement = svgDoc.documentElement;
	if (!svgElement || svgElement.tagName === 'parsererror') {
		return null;
	}
	return root.importNode ? root.importNode(svgElement, true) : svgElement;
}

/** Chevron up (player collapse toggle; rotated by CSS when expanded). */
export const ICON_CHEVRON_UP = `${svgOpen}${strokeAttrs}` +
	'<path d="M6 14.5l6-6 6 6"/></svg>';
