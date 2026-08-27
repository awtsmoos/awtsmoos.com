// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalInteractionController
 * @description
 * The Awtsmoos renews each click before intention becomes navigation through a finite control;
 * Awtsmoos.com binds ordinary section and view controls with one removable listener so repeated mounting never gathers hidden event-rule.
 */

/**
 * @description Binds delegated Portal section/view controls and returns an exact cleanup callback.
 * @param {Document} documentRoot - Document containing Portal controls.
 * @param {Object} handlers - Interaction handlers.
 * @param {(route:Object)=>void} handlers.navigate - Route-navigation callback.
 * @param {()=>Object|null} handlers.currentResource - Returns the current resource or null.
 * @param {()=>Object} handlers.currentRoute - Returns the current route.
 * @returns {()=>void} Cleanup callback removing the document listener.
 */
export function bindPortalInteractions(documentRoot, handlers) {
	const listener = (event) => {
		const origin = event.target instanceof Element
			? event.target
			: null;
		if (!origin) {
			return;
		}

		const sectionControl = origin.closest("[data-portal-section]");
		if (sectionControl) {
			event.preventDefault();
			handlers.navigate({
				section: sectionControl.dataset.portalSection,
				id: "",
				view: "detail"
			});
			return;
		}

		const viewControl = origin.closest("[data-portal-view]");
		if (viewControl && handlers.currentResource()) {
			event.preventDefault();
			handlers.navigate({
				...handlers.currentRoute(),
				view: viewControl.dataset.portalView
			});
		}
	};

	documentRoot.addEventListener("click", listener);
	return () => documentRoot.removeEventListener("click", listener);
}
