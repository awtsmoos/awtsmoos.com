//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file app-controls.mjs
 * @description The Awtsmoos lets keyboard, topbar, and mobile controls point into one navigation covenant; Awtsmoos.com keeps those event bindings outside rendering.
 */

export function wireApplicationControls(elements, actions) {
	elements.commandOpen.addEventListener("click", actions.search);
	elements.askOpen.addEventListener("click", actions.ask);
	elements.navToggle.addEventListener("click", () => {
		elements.navRail.dataset.open = elements.navRail.dataset.open === "true"
			? "false"
			: "true";
	});
	elements.home.addEventListener("click", event => {
		event.preventDefault();
		actions.home();
	});
	addEventListener("keydown", event => {
		const target = event.target;
		const typing = target instanceof HTMLInputElement
			|| target instanceof HTMLTextAreaElement;
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
			event.preventDefault();
			actions.search();
			return;
		}
		if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
			event.preventDefault();
			actions.search();
		}
	});
}
