// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeComposerMarkup
 * @description
 * The Awtsmoos gives one immediate social doorway to the living feed while
 * Awtsmoos.com preserves every real alias, destination, verse, and publication
 * contract behind a calm writing-first surface.
 */

import { composerAvatarMarkup } from './avatar.js';
import { quickActionsMarkup } from './quickActions.js';

/** Returns the complete accessible compact composer form. */
export function homeComposerMarkup() {
	return /*html*/`
		<form data-home-composer-form class="home-compose-form" novalidate>
			<header class="home-compose-primary">
				${composerAvatarMarkup('Current posting alias')}
				<div class="home-compose-identity">
					${field('home-compose-alias', 'Posting alias', 'aliasId', 'Choose posting identity', 'text', 'home-compose-alias')}
					<small>Share through your real Geelooy identity.</small>
				</div>
				<a class="home-compose-full-link" href="/social-composer/" aria-label="Open full post composer">•••</a>
				${field('home-compose-title', 'Post title', 'title', "What's on your mind?", 'text', 'home-compose-title', true)}
				<button type="submit" class="home-compose-post">Post</button>
			</header>
			${quickActionsMarkup()}
			<section
				class="home-compose-expanded"
				data-compose-expanded
				aria-label="Post details"
				aria-hidden="true"
				inert
			>
				<div class="home-compose-field home-compose-editor-field">
					<span id="home-compose-editor-label">Post body</span>
					<small id="home-compose-editor-help">Write rich details, links, and source context.</small>
				</div>
				<div
					id="home-compose-editor"
					class="geelooy-html-editor home-compose-editor"
					contenteditable="true"
					role="textbox"
					aria-multiline="true"
					aria-labelledby="home-compose-editor-label"
					aria-describedby="home-compose-editor-help"
					data-home-html-editor
					data-placeholder="Add details…"
					tabindex="0"
				></div>
				<input type="hidden" name="content">
				<div class="home-compose-tools" role="toolbar" aria-label="Composer tools">
					<button type="button" data-add-verse>＋ Verse</button>
					<button type="button" data-toggle-destination aria-expanded="false">◇ Destination</button>
					<button type="button" data-fill-methods>✦ Starter</button>
					<button type="button" data-collapse-compose>Collapse</button>
				</div>
				${advancedMarkup()}
			</section>
			<p class="home-compose-status" data-home-composer-status role="status" aria-live="polite">
				Default: your post goes to your profile Heichel.
			</p>
		</form>
	`;
}

/** Returns one labeled verse row. */
export function verseMarkup(index) {
	const titleId = `home-verse-title-${index}`;
	const textId = `home-verse-text-${index}`;
	return /*html*/`
		<article class="home-compose-verse" data-verse-index="${index}">
			${field(titleId, `Verse ${index} title`, 'verseTitle', 'Verse title')}
			<label class="home-compose-field" for="${textId}">
				<span>Verse ${index} text</span>
				<textarea id="${textId}" name="verseText" placeholder="Verse text"></textarea>
			</label>
		</article>
	`;
}

function advancedMarkup() {
	return /*html*/`
		<details data-destination-panel class="home-compose-advanced">
			<summary>Advanced destination and verses</summary>
			<div class="home-destination-grid">
				${field('home-compose-heichel', 'Heichel ID', 'heichelId', 'Post to Heichel ID')}
				${field('home-compose-series', 'Series ID', 'seriesId', 'Series ID', 'text', '', false, 'root')}
				${field('home-compose-new-heichel', 'New Heichel name', 'newHeichelName', 'Create a Heichel inline')}
				${field('home-compose-new-series', 'New series name', 'newSeriesName', 'Create a series inline')}
				<button type="button" data-create-heichel>Create Heichel</button>
				<button type="button" data-create-series>Create Series</button>
			</div>
			<div data-home-verses class="home-composer-verses" aria-label="Post verses">
				${verseMarkup(1)}
			</div>
		</details>
	`;
}

function field(id, label, name, placeholder, type = 'text', className = '', required = false, value = '') {
	return /*html*/`
		<label class="home-compose-field ${className}" for="${id}">
			<span>${label}</span>
			<input id="${id}" name="${name}" type="${type}" placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''}>
		</label>
	`;
}
