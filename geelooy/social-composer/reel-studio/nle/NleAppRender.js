// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAppRender
 * @description
 * Lightweight transport updates stay separate from structural panel rendering,
 * while the open AI workspace follows complete structural project changes.
 */

import {
	diagnoseNleProject,
	diagnosticsLabel
} from './NleDiagnostics.js';

const LIGHT_REASONS = new Set(['playhead', 'transport', 'rendering']);

export function renderNleApp(app, snapshot, reason = 'change') {
	app.transport.render(snapshot);
	app.timeline.updatePlayhead(snapshot);
	app.view.badge.textContent = `${snapshot.project.resolution.width}×${snapshot.project.resolution.height} · ${snapshot.project.fps} FPS`;
	app.view.title.value = snapshot.project.title;
	app.view.undo.disabled = !snapshot.canUndo;
	app.view.redo.disabled = !snapshot.canRedo;
	app.view.render.disabled = snapshot.rendering;
	app.ai.render(snapshot, reason);
	if (LIGHT_REASONS.has(reason)) return;
	app.timeline.render(snapshot);
	app.timelineControls.render(snapshot);
	app.assets.render(snapshot);
	app.inspector.render(snapshot);
	app.compositor.draw(snapshot.project, snapshot.playhead);
	const issues = diagnoseNleProject(snapshot.project, app.repository);
	app.view.diagnostics.textContent = diagnosticsLabel(issues);
	app.view.diagnostics.title = issues.join('\n');
	app.io.save(snapshot.project);
}
