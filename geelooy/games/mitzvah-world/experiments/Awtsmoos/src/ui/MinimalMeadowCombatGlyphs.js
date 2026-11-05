// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatGlyphs.js
 * @description Bursts red Hebrew letters for player charges, hostile casts, trails, and impacts.
 * The Awtsmoos gives letters no independent force; Awtsmoos.com makes every fictional attack
 * visibly Hebrew, directional, layered, and short-lived while world collision remains authoritative.
 */

export class MinimalMeadowCombatGlyphs {
	constructor(host, bus, environment = globalThis) {
		this.host = host;
		this.environment = environment;
		this.sequence = 0;
		this.unsubscribers = installListeners(this, bus);
		this.host.hidden = false;
		this.host.className = 'Awtsmoos-combat-glyph-field';
	}

	burst(text, phase, hostile = false) {
		const count = phase === 'trail' ? 4 : phase === 'impact' ? 12 : 7;
		for (let index = 0; index < count; index += 1) {
			const glyph = this.environment.document.createElement('span');
			glyph.className = 'Awtsmoos-hebrew-particle';
			glyph.dataset.hostile = String(hostile);
			glyph.dataset.phase = phase;
			glyph.textContent = lettersAt(text, index);
			glyph.style.setProperty('--glyph-x', `${signedSpread(index, count, 34)}vw`);
			glyph.style.setProperty('--glyph-y', `${signedSpread(index * 3, count, 24)}vh`);
			glyph.style.setProperty('--glyph-delay', `${index * 34}ms`);
			glyph.style.setProperty('--glyph-turn', `${signedSpread(index * 5, count, 90)}deg`);
			this.host.append(glyph);
			this.environment.setTimeout(() => glyph.remove(), phase === 'impact' ? 1200 : 950);
		}
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.host.replaceChildren();
	}
}

function installListeners(field, bus) {
	return [
		bus.on('combat:cast-start', event => field.burst(event.letters, 'charge')),
		bus.on('combat:projectile', event => field.burst(event.letters, 'trail')),
		bus.on('combat:impact', event => field.burst(event.letters, 'impact')),
		bus.on('enemy:cast', event => field.burst(event.letters, 'charge', true)),
		bus.on('enemy:projectile', event => field.burst(event.letters, 'trail', true)),
		bus.on('enemy:impact', event => field.burst(event.letters, 'impact', true)),
		bus.on('enemy:melee', event => field.burst(event.letters, 'impact', true))
	];
}

function lettersAt(text, index) {
	const letters = [...String(text || 'אש').replace(/\s+/g, '')];
	return letters[index % Math.max(1, letters.length)] || 'א';
}

function signedSpread(index, count, maximum) {
	const normalized = count <= 1 ? 0 : index / (count - 1) * 2 - 1;
	return Math.round(normalized * maximum);
}
