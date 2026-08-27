// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePromptIntent.js
 * @description Extracts deterministic movie length, tone, genre, characters, themes, and scene count from a prompt.
 * The Awtsmoos is beyond word and intention while every finite story needs a measured vessel;
 * Awtsmoos.com turns free language into explicit JSON choices without pretending hidden certainty is settled.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { hashMovieProceduralText } from './MovieProceduralSeed.js';

const TONES = Object.freeze({
	contemplative: ['prayer', 'quiet', 'reflect', 'wisdom', 'peace'],
	hopeful: ['hope', 'mitzvah', 'kindness', 'family', 'help'],
	joyful: ['joy', 'dance', 'celebrate', 'music', 'wedding'],
	mysterious: ['mystery', 'secret', 'hidden', 'night', 'letter'],
	urgent: ['danger', 'battle', 'rescue', 'demon', 'hurry']
});

const GENRES = Object.freeze({
	adventure: ['journey', 'quest', 'road', 'rescue', 'battle'],
	community: ['village', 'family', 'market', 'neighbor', 'home'],
	documentary: ['documentary', 'explain', 'history', 'learn'],
	parable: ['parable', 'lesson', 'wisdom', 'meaning'],
	wonder: ['miracle', 'dream', 'stars', 'magic', 'wonder']
});

export function parseMoviePromptIntent(prompt, options = {}) {
	const text = String(prompt || '').trim();
	const lower = text.toLowerCase();
	const duration = boundedNumber(options.duration, 6, 300, inferredDuration(lower));
	const sceneCount = boundedInteger(
		options.sceneCount,
		1,
		12,
		Math.max(1, Math.min(8, Math.round(duration / 12)))
	);
	return createMovieProjectSnapshot({
		characters: normalizeCharacters(options.characters),
		duration,
		genre: String(options.genre || chooseLabel(lower, GENRES, 'parable')),
		prompt: text || 'A MitzvahWorld story of kindness and courage.',
		sceneCount,
		seed: finiteSeed(options.seed ?? hashMovieProceduralText(text)),
		themes: inferredThemes(lower, options.themes),
		title: String(options.title || inferredTitle(text)),
		tone: String(options.tone || chooseLabel(lower, TONES, 'hopeful'))
	});
}

function chooseLabel(text, catalog, fallback) {
	let winner = fallback;
	let score = 0;
	for (const [label, words] of Object.entries(catalog)) {
		const current = words.filter(word => text.includes(word)).length;
		if (current > score) {
			score = current;
			winner = label;
		}
	}
	return winner;
}

function inferredDuration(text) {
	if (text.includes('trailer')) return 30;
	if (text.includes('short')) return 45;
	if (text.includes('epic') || text.includes('long')) return 120;
	return 60;
}

function inferredThemes(text, source) {
	if (Array.isArray(source) && source.length) return source.map(String);
	const themes = [];
	for (const value of ['kindness', 'courage', 'faith', 'family', 'wisdom', 'community']) {
		if (text.includes(value)) themes.push(value);
	}
	return themes.length ? themes : ['mitzvah', 'hope'];
}

function inferredTitle(text) {
	const words = String(text || 'Awtsmoos Movie').split(/\s+/).filter(Boolean).slice(0, 7);
	return words.map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
}

function normalizeCharacters(source) {
	const values = Array.isArray(source) && source.length ? source : ['Ari', 'Miriam'];
	return values.slice(0, 12).map((value, index) => (
		typeof value === 'string'
			? { id: slug(value, index), name: value, role: index ? 'companion' : 'protagonist' }
			: { id: String(value.id || slug(value.name, index)), name: String(value.name || `Character ${index + 1}`), role: String(value.role || 'supporting') }
	));
}

function slug(value, index) {
	return String(value || `character-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function boundedNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
}

function boundedInteger(value, minimum, maximum, fallback) {
	return Math.round(boundedNumber(value, minimum, maximum, fallback));
}

function finiteSeed(value) {
	const number = Number(value);
	return (Number.isFinite(number) ? Math.floor(number) : 1) >>> 0 || 1;
}
