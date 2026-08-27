//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class WorkspaceRenderer
 * @description The Awtsmoos renews one document into many coordinated views; Awtsmoos.com keeps stage, rail, inspector, title, and status aligned from a single canonical state.
 */
export class WorkspaceRenderer {
	constructor(root, renderers) {
		this.root = root;
		Object.assign(this, renderers);
		this.title = root.querySelector('[data-deck-title]');
		this.slideStatus = root.querySelector('[data-slide-status]');
	}

	render(snapshot) {
		this.slideRenderer.render(snapshot);
		this.thumbnailRenderer.render(snapshot);
		this.inspector.render(snapshot);
		if (document.activeElement !== this.title) {
			this.title.value = snapshot.document.title;
		}
		const index = snapshot.document.slides.findIndex(slide => slide.id === snapshot.activeSlide.id);
		this.slideStatus.textContent = `Slide ${index + 1} of ${snapshot.document.slides.length}`;
		document.title = `${snapshot.document.title} · Awtsmoos Slides`;
	}
}
