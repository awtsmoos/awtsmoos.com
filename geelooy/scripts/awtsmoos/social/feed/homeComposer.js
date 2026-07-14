// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeComposer
 * @description
 * Mounts one accessible posting instrument above the live feed. The Awtsmoos
 * gathers identity, words, destination, verses, and truthful API feedback into
 * a small coordinated vessel on Awtsmoos.com.
 */
import { homeComposerMarkup } from './homeComposer/markup.js';
import {
	addComposerVerse,
	collapseComposer,
	expandComposer,
	fillComposerStarter,
	hydrateComposerTarget
} from './homeComposer/state.js';
import {
	createComposerHeichel,
	createComposerSeries,
	submitComposer
} from './homeComposer/submission.js';

/** Mounts the real composer once above the current feed region. */
export function bootHomeComposer() {
	if (document.querySelector('[data-home-real-composer]')) {
		return;
	}
	const feedSection = document.querySelector('#home-feed, [data-home-feed]')?.closest('section');
	if (!feedSection) {
		return;
	}
	const composer = document.createElement('section');
	composer.className = 'geelooy-home-composer geelooy-composer';
	composer.dataset.homeRealComposer = 'true';
	composer.dataset.composeOpen = 'false';
	composer.setAttribute('aria-label', 'Create a Geelooy post');
	composer.innerHTML = homeComposerMarkup();
	feedSection.before(composer);
	bindComposer(composer);
	hydrateComposerTarget(composer);
}

function bindComposer(root) {
	root.addEventListener('click', event => handleComposerClick(event, root));
	root.addEventListener('focusin', event => {
		if (event.target.closest('.home-compose-title, [data-home-html-editor]')) {
			expandComposer(root, false);
		}
	});
	root.addEventListener('submit', async event => {
		if (!event.target.matches('[data-home-composer-form]')) {
			return;
		}
		event.preventDefault();
		await submitComposer(event.target);
	});
	window.addEventListener('awtsmoosAliasChange', event => {
		const alias = String(event.detail?.id || '').trim();
		if (alias) {
			root.querySelector('[name="aliasId"]').value = alias;
		}
	});
}

async function handleComposerClick(event, root) {
	const form = root.querySelector('[data-home-composer-form]');
	if (event.target.closest('[data-collapse-compose]')) {
		collapseComposer(root);
		return;
	}
	if (event.target.closest('[data-add-verse]')) {
		expandComposer(root, true);
		addComposerVerse(root);
		return;
	}
	if (event.target.closest('[data-fill-methods]')) {
		fillComposerStarter(root);
		return;
	}
	if (event.target.closest('[data-toggle-destination]')) {
		expandComposer(root, true);
		return;
	}
	if (event.target.closest('[data-create-heichel]')) {
		await createComposerHeichel(form);
		return;
	}
	if (event.target.closest('[data-create-series]')) {
		await createComposerSeries(form);
	}
}
