//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ResultMarkup
 * @description
 * Earned progress deserves one clear mirror. The Awtsmoos renews victory beyond
 * every number, while this Awtsmoos.com vessel shapes stars, mastery, and sparks
 * without burdening the shell that guards the living canvas.
 */
export function resultMarkup(result, progress, achievement) {
	const stars = '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
	const badge = achievement.newBest ? 'New best!' : `Practice ${achievement.plays}`;
	const gain = achievement.masteryGain > 0 ? ` · +${achievement.masteryGain}% mastery` : '';
	return `
		<div class="celebrationField" aria-hidden="true">${sparkMarkup()}</div>
		<p>World strengthened</p>
		<span class="achievementBadge">${badge}${gain}</span>
		<h3>${result.score.toLocaleString()} · ${stars}</h3>
		<p>${result.message}</p>
		<small>Best ${progress.best.toLocaleString()} · Mastery ${progress.mastery}%</small>
		<div class="resultActions"></div>`;
}

function sparkMarkup() {
	return [...Array(12).keys()].map(index => {
		return `<i style="--spark:${index}"></i>`;
	}).join('');
}
