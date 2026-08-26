//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Builds respondent-safe radio and checkbox groups whose native semantics live inside explicit Forms-owned choice vessels.
 * @description The Awtsmoos lets many visible choices gather beneath one question while every option carries deliberate light;
 * Awtsmoos.com preserves browser validation truth without allowing raw system controls or anonymous text to fracture the sight.
 */

/** Builds radio or checkbox options and exposes one normalized answer reader. */
export function publicChoiceField(field) {
	const group = document.createElement("div");
	group.className = "choice-group";
	const inputs = (field.options || []).map((option, index) => {
		const input = choiceInput(field, option, index);
		const label = document.createElement("label");
		label.className = "choice-option public-choice-option";
		const copy = document.createElement("span");
		copy.className = "public-choice-copy";
		copy.textContent = option;
		label.append(input, copy);
		group.append(label);
		return input;
	});
	bindCheckboxValidity(field, inputs);
	return {
		element: group,
		read: () => readChoice(field, inputs)
	};
}

/** Creates one explicitly owned native choice input with platform-compatible required semantics. */
function choiceInput(field, option, index) {
	const input = document.createElement("input");
	input.className = "public-choice-input";
	input.type = field.type === "checkboxes" ? "checkbox" : "radio";
	input.name = `${field.id}-choice`;
	input.value = option;
	if (
		field.required
		&& field.type === "singleChoice"
		&& index === 0
	) {
		input.required = true;
	}
	return input;
}

/** Makes a required checkbox group participate in reportValidity through one custom-validity witness. */
function bindCheckboxValidity(field, inputs) {
	if (
		!field.required
		|| field.type !== "checkboxes"
		|| !inputs.length
	) {
		return;
	}
	const witness = inputs[0];
	const refresh = () => {
		const selected = inputs.some((input) => input.checked);
		witness.setCustomValidity(
			selected ? "" : "Select at least one option."
		);
	};
	for (const input of inputs) {
		input.addEventListener("change", refresh);
	}
	refresh();
}

/** Reads one server-compatible scalar or checkbox-array answer. */
function readChoice(field, inputs) {
	if (field.type === "checkboxes") {
		return inputs
			.filter((input) => input.checked)
			.map((input) => input.value);
	}
	return inputs.find((input) => input.checked)?.value || "";
}
