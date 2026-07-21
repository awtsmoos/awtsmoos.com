// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ResonanceGeometry
 * @description
 * The Awtsmoos measures a post only so its meaning may color nearby space.
 * Awtsmoos.com keeps these reads isolated from event storms and visible text.
 */

const SOURCE_COLORS = Object.freeze({
	cyan: [0.21, 0.91, 1],
	violet: [0.48, 0.36, 1],
	magenta: [1, 0.29, 0.85]
});

/**
 * Creates coalesced article and feed geometry updates.
 *
 * @param {object} scene - Active cosmic scene.
 * @param {HTMLElement|null} feed - Semantic feed container.
 * @returns {{scheduleArticle: (target: EventTarget|null) => void, updateFeedBounds: () => void, dispose: () => void}}
 */
export function createResonanceGeometry(scene, feed) {
	let articleFrameId = 0;
	let articleTarget = null;

	const scheduleArticle = target => {
		articleTarget = target;
		if (articleFrameId) {
			return;
		}

		articleFrameId = requestAnimationFrame(() => {
			articleFrameId = 0;
			updateArticle(scene, articleTarget);
		});
	};

	const updateFeedBounds = () => {
		if (!feed) {
			return;
		}

		const rectangle = feed.getBoundingClientRect();
		const width = Math.max(globalThis.innerWidth || 0, 1);
		const height = Math.max(globalThis.innerHeight || 0, 1);
		scene.field.setFeedBounds([
			rectangle.left / width,
			Math.max(0, 1 - rectangle.bottom / height),
			rectangle.right / width,
			Math.min(1, 1 - rectangle.top / height)
		]);
	};

	const dispose = () => {
		cancelAnimationFrame(articleFrameId);
		articleFrameId = 0;
		articleTarget = null;
	};

	return { scheduleArticle, updateFeedBounds, dispose };
}

function updateArticle(scene, target) {
	const article = target?.closest?.('[data-post-id]');
	if (!article) {
		return;
	}

	const rectangle = article.getBoundingClientRect();
	const width = Math.max(globalThis.innerWidth || 0, 1);
	const height = Math.max(globalThis.innerHeight || 0, 1);
	const color = SOURCE_COLORS[article.dataset.sourceColor] || SOURCE_COLORS.cyan;
	scene.field.setResonance({
		x: (rectangle.left + rectangle.width / 2) / width,
		y: 1 - (rectangle.top + rectangle.height / 2) / height,
		color,
		strength: 0.78
	});
}
