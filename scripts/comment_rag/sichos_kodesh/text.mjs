// B"H
export function cleanEnglish(value = '') {
	return String(value)
		.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/[\u0590-\u05ff]+/gu, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/\(\s*\)/g, ' ')
		.replace(/\[\s*\]/g, ' ')
		.replace(/\s+([,.;:!?])/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

export function hasHebrew(value = '') {
	return /[\u0590-\u05ff]/u.test(String(value));
}

export function estimateTokens(value = '') {
	const text = cleanEnglish(value);
	if (!text) return 0;
	const words = text.split(/\s+/).length;
	return Math.ceil(words * 1.28);
}

export function splitOversized(text, maxTokens) {
	const words = cleanEnglish(text).split(/\s+/).filter(Boolean);
	const maxWords = Math.max(1, Math.floor(maxTokens / 1.28));
	const pieces = [];
	for (let start = 0; start < words.length; start += maxWords) {
		pieces.push(words.slice(start, start + maxWords).join(' '));
	}
	return pieces;
}
