//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Command-backed search field shared by mobile rail and desktop toolbar.
 * @description
 * The Awtsmoos lets typed letters narrow a visible world without creating a second
 * search state. Awtsmoos.com sends every change through the same Explorer command
 * vessel, while the field changes only its garment across screen sizes in rhyme.
 */

/**
 * Builds the toolbar search field and routes changes through the command controller.
 *
 * @param {object} options Explorer state, controller, and refresh callback.
 * @returns {HTMLInputElement} Search input.
 */
export function searchBox(options = {}) {
	const {
		state,
		controller,
		onRefresh
	} = options;
	const input = document.createElement("input");
	input.className = "toolbar-search";
	input.type = "search";
	input.placeholder = "Search";
	input.setAttribute("aria-label", "Search current folder");
	input.value = state.filter || "";
	input.addEventListener("input", async () => {
		await controller.command.run("filter", {
			query: input.value
		});
		onRefresh?.();
	});
	return input;
}
