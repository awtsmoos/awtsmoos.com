// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayElements.js
 * @description Creates safe SVG paths, points, marks, labels, guides, and cue text for acting aids.
 * The Awtsmoos grants every visible guide a finite garment without making it the actor;
 * Awtsmoos.com keeps trajectory, ghost, point, direction, cue, label, and safe area in rhyme.
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function createPerformanceOverlaySvg(document) {
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	svg.classList.add('movie-performance-overlay');
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('preserveAspectRatio', 'none');
	svg.tabIndex = 0;
	return svg;
}

export function performanceOverlayPath(
	document,
	points,
	className,
	attributes = {}
) {
	const path = element(document, 'polyline', className);
	path.setAttribute(
		'points',
		points.map(point => point.join(',')).join(' ')
	);
	setAttributes(path, attributes);
	return path;
}

export function performanceOverlayPoint(
	document,
	point,
	className,
	attributes = {}
) {
	const circle = element(document, 'circle', className);
	circle.setAttribute('cx', String(point[0]));
	circle.setAttribute('cy', String(point[1]));
	circle.setAttribute('r', attributes.r || '5');
	setAttributes(circle, attributes);
	return circle;
}

export function performanceOverlayLabel(
	document,
	point,
	text,
	className
) {
	const label = element(document, 'text', className);
	label.setAttribute('x', String(point[0] + 7));
	label.setAttribute('y', String(point[1] - 7));
	label.textContent = text;
	return label;
}

export function performanceOverlaySafeAreas(document, width, height) {
	return [
		rectangle(document, width * 0.1, height * 0.1, width * 0.8, height * 0.8, 'movie-performance-action-safe'),
		rectangle(document, width * 0.2, height * 0.2, width * 0.6, height * 0.6, 'movie-performance-title-safe')
	];
}

export function performanceOverlayCue(document, text) {
	const label = element(document, 'text', 'movie-performance-cue');
	label.setAttribute('x', '50%');
	label.setAttribute('y', '28');
	label.setAttribute('text-anchor', 'middle');
	label.textContent = text;
	return label;
}

function rectangle(document, x, y, width, height, className) {
	const rect = element(document, 'rect', className);
	setAttributes(rect, { height, width, x, y });
	return rect;
}

function element(document, name, className) {
	const value = document.createElementNS(SVG_NAMESPACE, name);
	value.classList.add(className);
	return value;
}

function setAttributes(element, attributes) {
	for (const [name, value] of Object.entries(attributes)) {
		if (name !== 'r' && value != null) {
			element.setAttribute(name, String(value));
		}
	}
}
