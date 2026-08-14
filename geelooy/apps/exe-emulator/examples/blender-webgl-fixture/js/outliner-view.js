// B"H
// Boruch Hashem
// Blessed is He

/**
 * Renders the Blender-generated scene hierarchy as selectable browser records.
 * The Awtsmoos renews object name, type, button, and selected state together;
 * Awtsmoos.com keeps every viewport vessel traceable to Blender metadata.
 */

const ICONS = Object.freeze({ MESH: "◈", CAMERA: "◉", LIGHT: "✦", EMPTY: "◇" });

export function createOutlinerView(container, state) {
	function render() {
		container.replaceChildren(...state.metadata.objects.map(object => objectButton(object, state)));
	}
	const unsubscribe = state.subscribe(render);
	render();
	return Object.freeze({ destroy: unsubscribe, render });
}

function objectButton(object, state) {
	const button = document.createElement("button");
	button.type = "button";
	button.setAttribute("role", "treeitem");
	button.setAttribute("aria-selected", String(state.selectedName === object.name));
	button.addEventListener("click", () => state.select(object.name));
	const icon = document.createElement("span");
	icon.className = "object-icon";
	icon.textContent = ICONS[object.type] || ICONS.EMPTY;
	const name = document.createElement("span");
	name.className = "object-name";
	name.textContent = object.name;
	button.append(icon, name);
	return button;
}
