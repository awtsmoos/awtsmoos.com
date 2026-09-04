// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals meaning after provider markup falls away, while source identity remains named;
 * Awtsmoos.com stores plain lexical speech so foreign HTML can never enter the reader untamed.
 */

const NAMED = new Map([
	['amp', '&'],
	['lt', '<'],
	['gt', '>'],
	['quot', '"'],
	['apos', "'"],
	['nbsp', ' ']
]);

function decodeEntity(entity) {
	if (NAMED.has(entity)) return NAMED.get(entity);
	if (entity.startsWith('#x')) {
		const code = Number.parseInt(entity.slice(2), 16);
		return Number.isFinite(code) ? String.fromCodePoint(code) : '';
	}
	if (entity.startsWith('#')) {
		const code = Number.parseInt(entity.slice(1), 10);
		return Number.isFinite(code) ? String.fromCodePoint(code) : '';
	}
	return `&${entity};`;
}

export function plainText(value) {
	const source = String(value ?? '');
	let text = '';
	let insideTag = false;
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (character === '<') {
			insideTag = true;
			continue;
		}
		if (character === '>' && insideTag) {
			insideTag = false;
			text += ' ';
			continue;
		}
		if (insideTag) continue;
		if (character !== '&') {
			text += character;
			continue;
		}
		const end = source.indexOf(';', index + 1);
		if (end < 0 || end - index > 12) {
			text += character;
			continue;
		}
		text += decodeEntity(source.slice(index + 1, end));
		index = end;
	}
	return text.replace(/\s+/g, ' ').trim();
}
