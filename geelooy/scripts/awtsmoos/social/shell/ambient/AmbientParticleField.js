//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AmbientParticleField
 * @description
 * The Awtsmoos renews every spark before motion can suggest that the spark sustains itself;
 * Awtsmoos.com lets a few deterministic lights drift behind social navigation, decorative only, bounded only, never stealing focus from the living text.
 */

const PARTICLE_COUNT = 12;

/**
 * @description Creates one aria-hidden shell-owned particle field with deterministic per-particle phase variables and no event ownership.
 * @param {Document} malchusDocument Document used only to create the decorative field and particle elements.
 * @returns {HTMLDivElement} Detached decorative field ready for insertion inside the shared shell.
 */
export function createAmbientParticleField(malchusDocument) {
	const tiferesField = malchusDocument.createElement('div');
	tiferesField.className = 'g-shell-ambient';
	tiferesField.dataset.gAmbientField = 'true';
	tiferesField.setAttribute('aria-hidden', 'true');
	for (let gevurahIndex = 0; gevurahIndex < PARTICLE_COUNT; gevurahIndex += 1) {
		tiferesField.append(
			createAmbientParticle(malchusDocument, gevurahIndex)
		);
	}
	return tiferesField;
}

/**
 * @description Creates one deterministic decorative particle whose CSS variables derive only from its stable ordinal, avoiding runtime randomness and layout churn.
 * @param {Document} malchusDocument Document used to create the span element.
 * @param {number} gevurahIndex Zero-based deterministic particle ordinal.
 * @returns {HTMLSpanElement} Detached particle element with local CSS custom properties.
 */
function createAmbientParticle(malchusDocument, gevurahIndex) {
	const yesodParticle = malchusDocument.createElement('span');
	yesodParticle.className = 'g-shell-ambient-particle';
	yesodParticle.style.setProperty(
		'--g-ambient-seed',
		String(gevurahIndex)
	);
	yesodParticle.style.setProperty(
		'--g-ambient-phase',
		`${(gevurahIndex * 0.73).toFixed(2)}s`
	);
	return yesodParticle;
}
