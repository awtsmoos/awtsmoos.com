// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieTimelinePerformanceMarkup.js
 * @description Converts performance summaries into safe clip metadata, curves, badges, and event markers.
 * The Awtsmoos gives no curve independent existence, yet every editor needs visible truth;
 * Awtsmoos.com lets motion, facing, deeds, camera, voice, preference, and warning sing in rhyme.
 */

import { escapeTimelineHtml } from './MovieTimelineEscape.js';
import { summarizeMovieTimelinePerformance } from './MovieTimelinePerformanceSummary.js';

export function createMovieTimelinePerformancePresentation(project, track, clip) {
	if (track.type !== 'performance') {
		return null;
	}
	const summary = summarizeMovieTimelinePerformance(project, track, clip);
	return {
		apply: element => applySummary(element, summary),
		label: summary.label,
		markup: performanceMarkup(summary),
		title: performanceTitle(summary, clip)
	};
}

function applySummary(element, summary) {
	element.classList.add('movie-performance-clip');
	element.dataset.actionCount = String(summary.actionCount);
	element.dataset.hasAudio = String(summary.audio);
	element.dataset.hasCamera = String(summary.camera);
	element.dataset.preferred = String(summary.preferred);
	element.dataset.warning = String(Boolean(summary.warnings.length));
}

function performanceMarkup(summary) {
	return `
		<div class="movie-performance-visual" aria-hidden="true">
			${curve('speed', summary.speedPoints)}
			${curve('facing', summary.facingPoints)}
			<div class="movie-performance-markers movie-performance-actions">${markerMarkup(summary.actionMarkers)}</div>
			<div class="movie-performance-markers movie-performance-animations">${markerMarkup(summary.animationMarkers)}</div>
			<div class="movie-performance-markers movie-performance-cameras">${markerMarkup(summary.cameraMarkers)}</div>
		</div>
		<div class="movie-performance-badges" aria-hidden="true">
			${summary.preferred ? '<b title="Preferred take">★</b>' : ''}
			${summary.camera ? '<b title="Recorded camera">CAM</b>' : ''}
			${summary.audio ? '<b title="Recorded audio">AUD</b>' : ''}
			${summary.actionCount ? `<b title="Action events">A${summary.actionCount}</b>` : ''}
			${summary.warnings.length ? '<b class="is-warning" title="Performance warning">!</b>' : ''}
		</div>`;
}

function curve(name, points) {
	if (points.length < 2) {
		return '';
	}
	const values = points.map(point => point.join(',')).join(' ');
	return `<svg class="movie-performance-${name}" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${escapeTimelineHtml(values)}"></polyline></svg>`;
}

function markerMarkup(values) {
	return values.map(value => (
		`<u style="left:${value.toFixed(3)}%"></u>`
	)).join('');
}

function performanceTitle(summary, clip) {
	const end = clip.start + clip.duration;
	const movement = `${summary.movement.distance.toFixed(2)}m · ${summary.movement.maximumSpeed.toFixed(2)}m/s`;
	const indicators = [
		summary.camera ? 'camera' : '',
		summary.audio ? 'audio' : '',
		summary.preferred ? 'preferred' : ''
	].filter(Boolean).join(', ');
	const warnings = summary.warnings.length
		? ` · Warnings: ${summary.warnings.join('; ')}`
		: '';
	return `${summary.label}, ${clip.start.toFixed(2)} to ${end.toFixed(2)} seconds · ${movement} · ${summary.actionCount} actions${indicators ? ` · ${indicators}` : ''}${warnings}`;
}
