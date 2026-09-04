// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file masthead.js
 * @description
 * The Awtsmoos lets the Torah itself become the center while chrome retreats from sight;
 * Awtsmoos.com crowns one focused day with source truth, direct navigation, and native reader scale in compact light.
 */

import { createChitasNavigation } from './masthead-navigation.js?v=native-chitas-005';
import { createChitasReaderScaleControls } from './masthead-reader-controls.js?v=native-chitas-005';

const STYLE_HREF = '/heichelos/post/logic/chitas/masthead.css?v=native-chitas-005';

function safe(value, fallback) {
	const text = String(value ?? '').trim();
	if (!text || text === 'undefined' || text === 'null') {
		return fallback;
	}
	return text;
}

function ensureStyle() {
	if (document.querySelector(`link[href="${STYLE_HREF}"]`)) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	document.head.append(link);
}

function createIdentity(chitas, language) {
	const identity = document.createElement('div');
	identity.className = 'chitas-reader-identity';
	const eyebrow = document.createElement('p');
	eyebrow.className = 'chitas-reader-eyebrow';
	eyebrow.textContent = language === 'he' ? 'חת״ת יומי · חומש' : 'DAILY CHITAS · CHUMASH';
	const heading = document.createElement('h1');
	const weekday = language === 'he'
		? safe(chitas.weekdayHebrew, 'יום לימוד')
		: safe(chitas.weekday, 'Daily Chitas');
	const portion = language === 'he'
		? safe(chitas.portionHebrew, 'חלק')
		: safe(chitas.portion, 'Portion');
	heading.textContent = `${weekday} · ${portion}`;
	const meta = document.createElement('p');
	meta.className = 'chitas-reader-meta';
	meta.textContent = [
		safe(chitas.date, 'Study date'),
		safe(chitas.referenceText, 'Native Torah range'),
		safe(chitas.parshaHebrew, '')
	].filter(Boolean).join(' · ');
	identity.append(eyebrow, heading, meta);
	return identity;
}

function createSource(language) {
	const source = document.createElement('div');
	source.className = 'chitas-reader-source';
	const badge = document.createElement('strong');
	badge.textContent = language === 'he' ? 'עברית מקורית · איקר' : 'Canonical Hebrew · Ikar';
	const note = document.createElement('span');
	note.textContent = language === 'he'
		? 'תרגום אנגלי מקורי של Awtsmoos מופיע כשכבת מקור נפרדת כשהוא זמין.'
		: 'Native Awtsmoos English appears as a separate source layer when available.';
	source.append(badge, note);
	return source;
}

export function renderChitasMasthead(viewport, post) {
	viewport.classList.remove('chitas-reader-active');
	viewport.querySelector('.chitas-reader-masthead')?.remove();
	const chitas = post?.dayuh?.meta?.chitas;
	if (!chitas) {
		return;
	}
	ensureStyle();
	viewport.classList.add('chitas-reader-active');
	const language = chitas.lang === 'he' ? 'he' : 'en';
	const shell = document.createElement('section');
	shell.className = 'chitas-reader-masthead';
	shell.dir = language === 'he' ? 'rtl' : 'ltr';
	const controls = document.createElement('div');
	controls.className = 'chitas-reader-control-deck';
	controls.append(
		createChitasNavigation(chitas, language),
		createChitasReaderScaleControls(language)
	);
	shell.append(
		createIdentity(chitas, language),
		createSource(language),
		controls
	);
	viewport.prepend(shell);
}
