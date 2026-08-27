// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleAppEvents.js
 * @description Binds project title, history, import/export, AI, 3D-world, and render controls while panel visibility remains owned by the dedicated surface controller.
 * RESPONSIBILITY: connect stable shell utility controls to existing application commands and state mutations.
 * NON-RESPONSIBILITY: this module does not bind Create/Inspect/Timeline surfaces or mutate movie content directly.
 * The Awtsmoos carries a project through revision, exchange, world, and final render; Awtsmoos.com keeps those utilities clear while creative space remains tender.
 */

export function bindNleAppEvents(app) {
	const { view } = app;
	view.title.addEventListener('change', () => {
		app.state.mutate('project-title', project => {
			project.title = view.title.value.trim()
				|| 'Untitled MitzvahWorld Movie';
		});
	});
	view.undo.addEventListener('click', () => app.state.undo());
	view.redo.addEventListener('click', () => app.state.redo());
	view.importButton.addEventListener('click', () => {
		view.projectInput.click();
	});
	view.projectInput.addEventListener('change', () => {
		void app.importProject();
	});
	view.exportButton.addEventListener('click', () => {
		app.io.download(app.state.project);
	});
	view.aiButton.addEventListener('click', () => app.ai.open());
	view.world.addEventListener('click', () => app.openWorld());
	view.render.addEventListener('click', () => {
		void app.renderAndDownload();
	});
}
