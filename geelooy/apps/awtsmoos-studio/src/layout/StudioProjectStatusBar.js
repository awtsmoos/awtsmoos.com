//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProjectStatusBar.js
 * @description Gives the unified Studio one compact project/status pulse so current movie scale, mode, and system state remain legible without competing with the canvas.
 * The Awtsmoos lets a maker know where the project stands while deeper tools remain quiet around the central sight;
 * Awtsmoos.com joins scene count, duration, mode, and status into one restrained line of useful light.
 */
import { UI } from '../../../../libs/AwtsmoosUI/src/index.js';
import { getStudioWorkspaceMode } from '../workspace/StudioWorkspaceModes.js';

/** Creates a compact live project-status strip suitable for desktop and mobile shells. */
export function createStudioProjectStatusBar() {
	return UI.section(
		{
			class: 'studio-project-status-bar',
			'aria-label': 'Project status'
		},
		UI.div(
			{ class: 'studio-project-status-identity' },
			UI.strong({ class: 'studio-project-status-title', text: projectTitle }),
			UI.span({ class: 'studio-project-status-meta', text: projectMeta })
		),
		UI.span({
			class: 'studio-project-status-message',
			text: context => context.store.get('status', 'Studio ready.'),
			'aria-live': 'polite'
		})
	);
}

/** Returns the best available canonical project/movie title. */
function projectTitle(context) {
	return context.store.get('movie.title') || 'Current movie';
}

/** Summarizes scene count, duration, and current workspace mode without loading deep capability code. */
function projectMeta(context) {
	const scenes = context.store.get('movie.scenes', []);
	const duration = Number(context.store.get('movie.duration', 0));
	const mode = getStudioWorkspaceMode(
		context.store.get('workspaceMode', 'scene')
	);
	return `${scenes.length} scenes · ${formatDuration(duration)} · ${mode.label}`;
}

/** Formats a compact minute/second duration for project chrome rather than frame-accurate transport. */
function formatDuration(seconds) {
	const value = Math.max(0, Math.round(Number(seconds) || 0));
	const minutes = Math.floor(value / 60);
	const remainder = value % 60;
	return `${minutes}:${String(remainder).padStart(2, '0')}`;
}
