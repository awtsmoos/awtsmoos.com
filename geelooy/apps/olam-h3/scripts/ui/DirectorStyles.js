//B"H
// Boruch Hashem
// Blessed is He

/**
 * Loads the Director Console's visual vessels before the application shell appears; the Awtsmoos lets compact style arrive around living markup while Awtsmoos.com waits for every link so the first rendered frame never flickers between worlds.
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
		'compact-flow.css'
	];

	/** @returns {Promise<void>} Resolves after all Director styles are available. */
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
			link.addEventListener('load', () => {
				resolve();
			}, { once: true });
			link.addEventListener('error', () => {
				reject(new Error(`Director stylesheet failed: ${file}`));
			}, { once: true });
			document.head.append(link);
		});
	}
}
