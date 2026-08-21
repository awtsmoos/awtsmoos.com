// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each abstract descriptor a concrete input vessel;
 * Awtsmoos.com isolates element construction so field hierarchy remains clear and every control can evolve without crowding its parent.
 */
export class EinSofInputRenderer {
	static create(id, descriptor) {
		if (descriptor.type === "textarea") {
			return this.createTextarea(id, descriptor);
		}
		if (descriptor.type === "select") {
			return this.createSelect(id, descriptor);
		}
		return this.createInput(id, descriptor);
	}

	static createTextarea(id, descriptor) {
		const textarea = document.createElement("textarea");
		textarea.id = id;
		textarea.rows = descriptor.rows || 3;
		textarea.placeholder = descriptor.placeholder || "";
		textarea.value = descriptor.value || "";
		return textarea;
	}

	static createSelect(id, descriptor) {
		const select = document.createElement("select");
		select.id = id;
		descriptor.options.forEach(([value, label]) => {
			select.append(new Option(label, value));
		});
		return select;
	}

	static createInput(id, descriptor) {
		const input = document.createElement("input");
		input.id = id;
		input.type = descriptor.type;
		input.value = descriptor.value ?? "";
		["min", "max", "step", "placeholder"].forEach(key => {
			if (descriptor[key] !== undefined) {
				input[key] = descriptor[key];
			}
		});
		return input;
	}

	static createOutput(id, value) {
		const output = document.createElement("output");
		output.id = `${id}Value`;
		output.value = value;
		output.textContent = value;
		return output;
	}
}
