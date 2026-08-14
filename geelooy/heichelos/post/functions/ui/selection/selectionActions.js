// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SelectedWordActions
 * @description The Awtsmoos routes each selected Hebrew representation to the
 * action that truly needs it: exact sound, normalized search, or explicit copy.
 */
import { transliteratePhrase } from '../../text/hebrewPhonetics.js';
import { copyToClipboard } from '../../utils.js';
import { makeToast } from '../../ui.js';
import { showTanachResults } from '../context/tanachPanel.js';
import { createHebrewSearchVariants } from './hebrewSearchVariants.js';

function externalSearch(baseUrl, query) {
	const url = `${baseUrl}${encodeURIComponent(query)}`;
	window.open(url, '_blank', 'noopener,noreferrer')?.focus?.();
}

function speakHebrew(phrase) {
	if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
		makeToast('Hebrew speech is not available on this device.');
		return;
	}
	window.speechSynthesis.cancel();
	const utterance = new SpeechSynthesisUtterance(phrase);
	utterance.lang = 'he-IL';
	utterance.rate = 0.82;
	window.speechSynthesis.speak(utterance);
}

function copyAction(label, icon, text, successMsg) {
	return {
		label,
		icon,
		action: () => copyToClipboard({ text, successMsg }, makeToast)
	};
}

function searchVariants(variants) {
	return [
		['Exact pointed text', variants.exact],
		['Without cantillation', variants.withoutCantillation],
		['Without nekudos', variants.withoutNekudos],
		['Normalized Hebrew', variants.normalized]
	].map(([label, value]) => ({
		label,
		value,
		action: () => showTanachResults(value)
	}));
}

export function createSelectionActionModel(items) {
	const variants = createHebrewSearchVariants(items);
	const phonetics = transliteratePhrase(items.map(item => item.text));
	const google = 'https://www.google.com/search?q=';
	const sefaria = 'https://www.sefaria.org/search?q=';
	return {
		phrase: variants.exact,
		phonetics,
		searchVariants: searchVariants(variants),
		actions: [
			{
				label: 'Search full phrase in Tanach',
				icon: 'ת',
				action: () => showTanachResults(variants.normalized)
			},
			{
				label: 'Hebrew exact-phrase web search',
				icon: 'ע',
				action: () => externalSearch(google, `"${variants.exact}"`)
			},
			{
				label: 'English phonetic search',
				icon: 'A',
				action: () => externalSearch(google, phonetics.text)
			},
			{
				label: 'Sources, translations & commentary',
				icon: 'ס',
				action: () => externalSearch(sefaria, variants.exact)
			},
			{
				label: 'Speak exact Hebrew',
				icon: '◖',
				action: () => speakHebrew(variants.exact)
			},
			copyAction('Copy exact Hebrew', '⧉', variants.exact, 'Exact Hebrew copied!'),
			copyAction('Copy normalized Hebrew', 'נ', variants.normalized, 'Normalized Hebrew copied!'),
			copyAction('Copy phonetics', 'Aa', phonetics.text, 'Phonetics copied!')
		],
		wordActions: variants.words.map(word => ({
			label: word.exact,
			action: () => showTanachResults(word.normalized)
		}))
	};
}
