//B"H
// Boruch Hashem
// Blessed is He

/**
 * Loads the Director Console from stable foundations into the newest intuitive skin; the Awtsmoos lets many visual vessels arrive as one coherent face.
 * Awtsmoos.com places command, disclosure, glass, motion, and navigation last so hierarchy changes without mutating the behavioral space beneath.
 */
export class DirectorStyles {
	static files = [
		'director-hero.css',
		'director-viewfinder.css',
		'director-brief.css',
		'style-lanes.css',
		'reference-recipes.css',
		'compact-hero.css',
		'compact-coach.css',
		'compact-guide.css',
		'compact-flow.css',
		'reference-hud.css',
		'future-hud.css',
		'future-motion.css',
		'intuitive-console.css',
		'intuitive-disclosure.css',
		'intuitive-glass.css',
		'intuitive-motion.css',
		'intuitive-nav.css'
	];

	/** @returns {Promise<void>} Resolves after every Director stylesheet becomes available. */
	static async ensure() {
		await Promise.all(
			this.files.map(file => this.ensureFile(file))
		);
	}

	/** @param {string} file Stylesheet basename. @returns {Promise<void>} Stylesheet readiness. */
	static ensureFile(file) {
		const href = new URL(`../../styles/${file}`, import.meta.url).href;
		const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
			.find(link => link.href === href);

		if (existing) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.dataset.directorStyle = file;
			link.addEventListener('load', resolve, { once: true });
			link.addEventListener('error', () => {
				reject(new Error(`Director stylesheet failed: ${file}`));
			}, { once: true });
			document.head.append(link);
		});
	}
}
