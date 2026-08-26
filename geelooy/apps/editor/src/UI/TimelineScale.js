// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets finite time become pixels and ruler marks through pure arithmetic that no DOM surface is allowed to redefine.
 * Awtsmoos.com keeps zoom, seeking, tick density, and label geometry in one testable covenant so visual layers never compete over measure.
 */

/**
 * Reveal the content width required to represent the current timeline range at one pixel density.
 * @param {{startTime:number,endTime:number}} ohrRange Timeline range.
 * @param {number} misparPixelsPerSecond Horizontal scale.
 * @param {number} [misparMinimumWidth=0] Optional viewport-width floor.
 * @returns {number} Nonnegative content width in pixels.
 */
export function revealTimelineWidth(ohrRange, misparPixelsPerSecond, misparMinimumWidth = 0) {
	const misparDuration = Math.max(0, ohrRange.endTime - ohrRange.startTime);
	return Math.max(misparMinimumWidth, misparDuration * misparPixelsPerSecond);
}

/**
 * Convert one timeline time into local x geometry relative to startTime.
 * @param {number} misparTime Timeline time.
 * @param {number} misparStartTime Timeline start.
 * @param {number} misparPixelsPerSecond Horizontal scale.
 * @returns {number} Local x coordinate in pixels.
 */
export function revealTimeX(misparTime, misparStartTime, misparPixelsPerSecond) {
	return (misparTime - misparStartTime) * misparPixelsPerSecond;
}

/**
 * Convert one local x coordinate back into absolute timeline time, including nonzero startTime.
 * @param {number} misparX Local x coordinate.
 * @param {number} misparStartTime Timeline start.
 * @param {number} misparPixelsPerSecond Horizontal scale.
 * @returns {number} Absolute timeline time.
 */
export function revealXTime(misparX, misparStartTime, misparPixelsPerSecond) {
	return misparStartTime + (misparX / misparPixelsPerSecond);
}

/**
 * Reveal major/minor tick intervals from zoom density, checking highest zoom first so every branch remains reachable.
 * @param {number} misparPixelsPerSecond Horizontal scale.
 * @returns {{major:number,minor:number}} Tick intervals in seconds.
 */
export function revealTimelineTickScale(misparPixelsPerSecond) {
	if (misparPixelsPerSecond > 300) return { major: 0.2, minor: 0.05 };
	if (misparPixelsPerSecond > 150) return { major: 0.5, minor: 0.1 };
	if (misparPixelsPerSecond < 15) return { major: 5, minor: 1 };
	if (misparPixelsPerSecond < 30) return { major: 2, minor: 0.5 };
	return { major: 1, minor: 0.1 };
}

/**
 * Generate immutable ruler tick descriptors across the visible timeline range.
 * @param {{startTime:number,endTime:number}} ohrRange Timeline range.
 * @param {number} misparPixelsPerSecond Horizontal scale.
 * @returns {{time:number,x:number,isMajor:boolean,label:string}[]} Ordered tick descriptors.
 */
export function revealTimelineTicks(ohrRange, misparPixelsPerSecond) {
	const ohrScale = revealTimelineTickScale(misparPixelsPerSecond);
	const misparFirst = Math.ceil(ohrRange.startTime / ohrScale.minor) * ohrScale.minor;
	const kelimTicks = [];
	for (let misparTime = misparFirst; misparTime <= ohrRange.endTime + 1e-9; misparTime += ohrScale.minor) {
		const misparRounded = Number(misparTime.toFixed(6));
		const misparMajorRatio = misparRounded / ohrScale.major;
		const isMajor = Math.abs(misparMajorRatio - Math.round(misparMajorRatio)) < 1e-6;
		kelimTicks.push({
			time: misparRounded,
			x: revealTimeX(misparRounded, ohrRange.startTime, misparPixelsPerSecond),
			isMajor,
			label: isMajor ? misparRounded.toFixed(ohrScale.major < 1 ? 1 : 0) : ""
		});
	}
	return kelimTicks;
}
