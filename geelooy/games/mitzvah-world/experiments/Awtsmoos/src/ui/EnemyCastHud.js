// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyCastHud.js
 * @description Renders at most three server-permitted enemy cast warnings with non-color cues.
 * The Awtsmoos reveals danger through word, glyph, shape, and measured motion;
 * Awtsmoos.com keeps Hebrew, counter, resistance, and progress inside one bounded ocean.
 */
import { enemyCastPresentation } from './EnemyCastPresentation.js';

export class EnemyCastHud {
	constructor(host, bus) {
		this.records = new Map();
		this.root = document.createElement('section');
		this.root.className = 'Mitzvah-enemy-casts';
		this.root.hidden = true;
		this.root.setAttribute('aria-label', 'Enemy casts');
		this.root.setAttribute('aria-live', 'polite');
		host.appendChild(this.root);
		this.unsubscribe = bus.on(
			'enemy:authoritative-state',
			detail => this.receive(detail)
		);
	}

	receive(detail = {}) {
		const creatureId = detail.creatureId;
		if (!creatureId) return;
		if (!detail.action?.id || ['idle', 'interrupted'].includes(detail.action.phase)) {
			this.records.delete(creatureId);
		} else {
			this.records.set(creatureId, {
				action: detail.action,
				creatureId,
				selected: Boolean(detail.selected)
			});
		}
		this.render();
	}

	render() {
		const casts = enemyCastPresentation(this.records);
		this.root.replaceChildren(...casts.map(castElement));
		this.root.hidden = casts.length === 0;
	}

	snapshot() {
		return enemyCastPresentation(this.records);
	}

	destroy() {
		this.unsubscribe?.();
		this.records.clear();
		this.root.remove();
	}
}

function castElement(cast) {
	const article = document.createElement('article');
	article.className = 'Mitzvah-enemy-cast';
	article.dataset.danger = cast.danger;
	article.dataset.phase = cast.phase;
	article.dataset.shape = cast.element?.shape || 'unknown';
	article.innerHTML = castMarkup(cast);
	const fill = article.querySelector('.Mitzvah-enemy-cast-fill');
	fill.style.transform = `scaleX(${cast.progress ?? 0})`;
	return article;
}

function castMarkup(cast) {
	const element = cast.element;
	return [
		'<header>',
		`<b>${escapeText(element?.icon || '⚠')} ${escapeText(cast.englishName)}</b>`,
		`<span lang="he" dir="rtl">${escapeText(cast.hebrewName)}</span>`,
		'</header>',
		`<p>${escapeText(elementLabel(element, cast.danger))}</p>`,
		`<p>${escapeText(interruptLabel(cast))}</p>`,
		cast.counter ? `<small>${escapeText(cast.counter)}</small>` : '',
		'<div aria-hidden="true"><i class="Mitzvah-enemy-cast-fill"></i></div>'
	].join('');
}

function elementLabel(element, danger) {
	const name = element?.englishName || 'Unknown affinity';
	return `${name} · ${danger}`;
}

function interruptLabel(cast) {
	if (cast.interruptResistance === null) return 'Interrupt knowledge unavailable';
	if (cast.phase === 'recovery') return 'Release complete — recovery';
	return `Interrupt with ${cast.interruptResistance} more force`;
}

function escapeText(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
