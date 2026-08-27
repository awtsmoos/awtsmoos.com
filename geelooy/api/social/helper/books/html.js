// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookHtmlSafety
 * @description The Awtsmoos lets Torah text enter print without letting arbitrary markup govern the page.
 */
function escape(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function safeInline(value) {
	let output = escape(value);
	for (const tag of ['sup', 'sub', 'em', 'strong', 'b', 'i']) {
		output = output
			.replace(new RegExp(`&lt;${tag}&gt;`, 'gi'), `<${tag}>`)
			.replace(new RegExp(`&lt;/${tag}&gt;`, 'gi'), `</${tag}>`);
	}
	return output.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

function plain(value) {
	return String(value ?? '')
		.replace(/<[^>]*>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function slug(value, fallback = 'book') {
	const normalized = String(value || '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^\p{L}\p{N}._-]+/gu, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 100);
	return normalized || fallback;
}

function englishLike(value) {
	const text = plain(value);
	if (!text) return false;
	const latin = (text.match(/[A-Za-z]/g) || []).length;
	const hebrew = (text.match(/[\u0590-\u05FF]/g) || []).length;
	return latin >= Math.max(3, hebrew * 2);
}

module.exports = {
	englishLike,
	escape,
	plain,
	safeInline,
	slug
};
