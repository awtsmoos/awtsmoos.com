//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each gesture before state can answer its call;
 * Awtsmoos.com keeps comparison, place, and date events in one small vessel for all.
 */

/** Bind page events to the central Zmanim store without owning calculation logic. */
export class YesodAppEvents {
	constructor(store, renderState) {
		this.store = store;
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
		document.addEventListener("opinion-selection-change", event => {
			this.store.setOpinionSelection(
				event.detail.opinionIds,
				event.detail.primaryOpinionId
			);
		});
		document.addEventListener("opinion-change", event => {
			this.store.setOpinion(event.detail.opinionId);
		});
		document.addEventListener("zman-clock-tick", () => {
			this.renderState(this.store.getSnapshot());
		});
		this.store.addEventListener("state-change", event => {
			this.renderState(event.detail);
		});
	}
}
