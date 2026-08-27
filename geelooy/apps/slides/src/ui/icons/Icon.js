//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module Icon
 * @description The Awtsmoos lets one visual alphabet illuminate many commands; Awtsmoos.com keeps trusted inline SVG paths in one small vessel so menus can become richer without importing another dependency.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = Object.freeze({
	slides: 'M5 5h14v14H5z M8 2h8 M8 22h8',
	sparkles: 'M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2z M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z M5 14l.7 1.8L8 16.5l-2.3.7L5 19l-.7-1.8L2 16.5l2.3-.7L5 14z',
	palette: 'M12 3a9 9 0 100 18h1.2a2 2 0 001.7-3l-.4-.7a1.5 1.5 0 011.3-2.3H18a3 3 0 003-3c0-5-4-9-9-9z M7.5 9h.01 M10 6.5h.01 M14 6.5h.01 M16.5 9h.01',
	more: 'M5 12h.01 M12 12h.01 M19 12h.01',
	copy: 'M8 8h11v11H8z M5 5h11v3 M5 5v11h3',
	duplicate: 'M8 8h11v11H8z M5 5h9v3 M5 5v9h3 M13.5 11v5 M11 13.5h5',
	arrange: 'M4 7h16 M7 4v6 M4 17h16 M17 14v6',
	trash: 'M5 7h14 M9 7V4h6v3 M8 10v8 M12 10v8 M16 10v8 M7 7l1 14h8l1-14',
	heading: 'M5 5v14 M19 5v14 M5 12h14',
	text: 'M4 6h16 M12 6v12 M8 18h8',
	rectangle: 'M4 6h16v12H4z',
	circle: 'M12 4a8 8 0 110 16 8 8 0 010-16z',
	image: 'M4 5h16v14H4z M7 15l3-3 3 3 2-2 3 3 M9 9h.01',
	plus: 'M12 5v14 M5 12h14',
	front: 'M9 9h10v10H9z M5 5h10v4 M5 5v10h4',
	forward: 'M7 10h10v9H7z M10 5h9v9h-2',
	backward: 'M7 5h10v9H7z M5 10h2 M5 10v9h9v-5',
	back: 'M5 5h10v10H5z M9 9h10v10H9z',
	import: 'M12 3v12 M8 11l4 4 4-4 M5 19h14',
	download: 'M12 3v12 M8 11l4 4 4-4 M5 20h14',
	html: 'M8 7l-4 5 4 5 M16 7l4 5-4 5 M14 5l-4 14',
	notes: 'M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5',
	undo: 'M9 7H4v-5 M4 7l5-5 M5 8a8 8 0 111 9',
	redo: 'M15 7h5v-5 M20 7l-5-5 M19 8a8 8 0 10-1 9',
	share: 'M12 16v-9 M8 11l4-4 4 4 M5 14v6h14v-6',
	present: 'M6 4l13 8-13 8z',
	close: 'M6 6l12 12 M18 6L6 18'
});

/** Creates a decorative SVG icon from the trusted catalog. */
export function createIcon(name, size = 20) {
	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('width', String(size));
	svg.setAttribute('height', String(size));
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('focusable', 'false');
	svg.setAttribute('fill', 'none');
	svg.setAttribute('stroke', 'currentColor');
	svg.setAttribute('stroke-width', '1.8');
	svg.setAttribute('stroke-linecap', 'round');
	svg.setAttribute('stroke-linejoin', 'round');
	const path = document.createElementNS(SVG_NS, 'path');
	path.setAttribute('d', ICONS[name] || ICONS.more);
	svg.append(path);
	return svg;
}
