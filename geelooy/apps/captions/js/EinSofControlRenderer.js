// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos clothes one abstract setting in one honest interactive vessel;
 * Awtsmoos.com renders field hierarchy and randomization while delegating raw input construction to its own clear light.
 */
import { EinSofInputRenderer } from "./EinSofInputRenderer.js";

export class EinSofControlRenderer {
	static render(definition) {
		if (definition.kind === "randomized") {
			return this.renderRandomized(definition);
		}
		if (definition.kind === "switch") {
			return this.renderSwitch(definition);
		}
		return this.renderField(definition);
	}

	static renderField(definition) {
		const label = document.createElement("label");
		label.className = `field${definition.spanAll ? " span-all" : ""}`;

		const caption = document.createElement("span");
		caption.textContent = definition.label;
		label.append(
			caption,
			EinSofInputRenderer.create(
				definition.id,
				definition.control
			)
		);
		return label;
	}

	static renderRandomized(definition) {
		const field = document.createElement("div");
		field.className = "field randomized";
		field.dataset.controlName = definition.id;

		const label = document.createElement("label");
		label.htmlFor = definition.id;
		label.textContent = definition.label;
		if (definition.control.output) {
			label.append(
				" ",
				EinSofInputRenderer.createOutput(
					definition.id,
					definition.control.value
				)
			);
		}

		field.append(
			label,
			this.createRandomizeButton(definition.id),
			EinSofInputRenderer.create(
				definition.id,
				definition.control
			),
			this.createRandomRange(definition)
		);
		return field;
	}

	static createRandomizeButton(id) {
		const button = document.createElement("button");
		button.type = "button";
		button.className = "randomize-button";
		button.dataset.randomize = id;
		button.setAttribute("aria-pressed", "false");
		button.textContent = "Random";
		return button;
	}

	static createRandomRange(definition) {
		const range = document.createElement("div");
		range.className = "random-range";
		range.hidden = true;
		if (definition.range) {
			range.dataset.min = definition.range.min;
			range.dataset.max = definition.range.max;
		}
		return range;
	}

	static renderSwitch(definition) {
		const label = document.createElement("label");
		label.id = definition.containerId;
		label.className = "switch-row";
		label.hidden = true;

		const input = document.createElement("input");
		input.id = definition.id;
		input.type = "checkbox";

		const copy = document.createElement("span");
		copy.textContent = definition.label;
		label.append(input, copy);
		return label;
	}
}
