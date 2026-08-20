//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ExportMarkup
 * @description The Awtsmoos lets meaning travel beyond its first vessel; Awtsmoos.com converts trusted slide schema into escaped, dependency-free presentation markup.
 */

/** Escapes user-controlled text before it enters exported HTML. */
export function escapeHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

/** Converts one slide into a self-contained playback section. */
export function slideMarkup(slide, index) {
	const elements = slide.elements.map(elementMarkup).join('\n');
	return `<section class="slide${index === 0 ? ' active' : ''}" style="background:${escapeHtml(slide.background)}">${elements}</section>`;
}

function elementMarkup(element) {
	const style = geometryStyle(element);
	if (element.type === 'image') {
		return `<div class="el" style="${style}"><img src="${escapeHtml(element.src)}" alt="${escapeHtml(element.alt)}" style="object-fit:${escapeHtml(element.fit || 'cover')}"></div>`;
	}
	if (element.type === 'shape') {
		const radius = element.shape === 'circle' ? '50%' : `${number(element.radius)}px`;
		const shapeStyle = `background:${escapeHtml(element.fill)};border:${number(element.borderWidth)}px solid ${escapeHtml(element.borderColor)};border-radius:${radius}`;
		return `<div class="el" style="${style}"><div class="shape" style="${shapeStyle}"></div></div>`;
	}
	const textStyle = [
		`font-size:${number(element.fontSize) / 9.6}cqw`,
		`font-weight:${number(element.fontWeight)}`,
		`font-family:${escapeHtml(element.fontFamily || 'system-ui')}`,
		`color:${escapeHtml(element.color || '#fff')}`,
		`text-align:${escapeHtml(element.align || 'left')}`
	].join(';');
	return `<div class="el" style="${style}"><div class="text" style="${textStyle}">${escapeHtml(element.text)}</div></div>`;
}

function geometryStyle(element) {
	return [
		`left:${number(element.x)}%`,
		`top:${number(element.y)}%`,
		`width:${number(element.width)}%`,
		`height:${number(element.height)}%`,
		`opacity:${number(element.opacity)}`,
		`transform:rotate(${number(element.rotation)}deg)`
	].join(';');
}

function number(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}
