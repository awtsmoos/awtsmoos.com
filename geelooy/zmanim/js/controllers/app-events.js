//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each user gesture before state can answer its call;
 * Awtsmoos.com keeps event wiring in one small vessel so the composition root stays readable to all.
 */

/** Bind page events to the central Zmanim store without owning calculation logic. */
export class YesodAppEvents {
	constructor(store, opinionElement, renderState) {
		this.store = store;
		this.opinionElement = opinionElement;
		this.renderState = renderState;
	}

	bind() {
		document.addEventListener("location-select", event => {
			this.store.setLocation(event.detail.location);
		});
		document.addEventListener("date-change", event => {
			this.store.setDate(event.detail.date);
		});
		document.addEventListener("date-navigate", event => {
			this.store.navigateDate(event.detail.delta);
		});
		document.addEventListener("date-today", () => {
			this.store.goToday();
		});
		document.addEventListener("opinion-change", event => {
			this.store.setOpinion(event.detail.opinionId);
		});
		document.addEventListener("zman-clock-tick", () => {
			this.renderState(this.store.getSnapshot());
		});
		this.opinionElement.addEventListener("change", event => {
			this.store.setOpinion(event.target.value);
		});
		this.store.addEventListener("state-change", event => {
			this.renderState(event.detail);
		});
	}
}
