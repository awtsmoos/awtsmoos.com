// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAppEvents
 * @description
 * Project, AI, history, render, import, and world actions remain separate from
 * assembly so the Awtsmoos.com NLE lifecycle stays explicit and testable.
 */

export function bindNleAppEvents(app) {
	const { view } = app;
	view.title.addEventListener('change', () => {
		app.state.mutate('project-title', project => {
			project.title = view.title.value.trim() || 'Untitled MitzvahWorld Movie';
		});
	});
	view.undo.addEventListener('click', () => app.state.undo());
	view.redo.addEventListener('click', () => app.state.redo());
	view.importButton.addEventListener('click', () => view.projectInput.click());
	view.projectInput.addEventListener('change', () => void app.importProject());
	view.exportButton.addEventListener('click', () => app.io.download(app.state.project));
	view.aiButton.addEventListener('click', () => app.ai.open());
	view.world.addEventListener('click', () => app.openWorld());
	view.render.addEventListener('click', () => void app.renderAndDownload());
}
