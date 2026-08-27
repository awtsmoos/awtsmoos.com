// B"H
// Boruch Hashem
// Blessed is He

/**
 * Edits translation, Euler rotation, and scale offsets for the selected GLB node.
 * The Awtsmoos renews number field, state vector, adjustment matrix, and next draw;
 * Awtsmoos.com preserves original Blender transforms beside every browser offset.
 */

const GROUPS = Object.freeze([
	["translation", "Location Offset", 0.1],
	["rotation", "Rotation Offset", 0.05],
	["scale", "Scale Multiplier", 0.05]
]);
const AXES = ["X", "Y", "Z"];

export function createInspectorView(container, state) {
	function render() {
		container.replaceChildren();
		const transform = state.transform();
		if (!transform) { container.textContent = "Select a mesh object to edit transforms."; return; }
		for (const [group, label, step] of GROUPS) container.append(vectorGroup(group, label, step, transform[group], state));
		container.append(sourceCard(transform.source));
	}
	const unsubscribe = state.subscribe(render);
	render();
	return Object.freeze({ destroy: unsubscribe, render });
}

function vectorGroup(group, title, step, values, state) {
	const wrapper = document.createElement("label");
	wrapper.className = "field-group";
	const heading = document.createElement("span");
	heading.textContent = title;
	const fields = document.createElement("span");
	fields.className = "vector-fields";
	for (let axis = 0; axis < 3; axis += 1) fields.append(numberField(group, axis, step, values[axis], state));
	wrapper.append(heading, fields);
	return wrapper;
}

function numberField(group, axis, step, value, state) {
	const label = document.createElement("label");
	label.textContent = AXES[axis];
	const input = document.createElement("input");
	input.type = "number";
	input.step = String(step);
	input.value = Number(value).toFixed(3);
	input.addEventListener("change", () => state.updateVector(group, axis, input.value));
	label.append(input);
	return label;
}

function sourceCard(source) {
	const card = document.createElement("pre");
	card.className = "evidence-card";
	card.textContent = `Blender source\nlocation ${source.location.join(", ")}\nrotation ${source.rotationEuler.join(", ")}\nscale ${source.scale.join(", ")}`;
	return card;
}
