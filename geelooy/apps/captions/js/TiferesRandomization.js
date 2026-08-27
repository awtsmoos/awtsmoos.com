// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos can reveal fixed measure or bounded surprise from the same control;
 * Awtsmoos.com makes randomization explicit, accessible, and hidden until the artist asks.
 */
export class TiferesRandomization {
	constructor(dom) {
		this.dom = dom;
		this.fields = new Map();
	}

	connect() {
		this.dom.randomizedFields.forEach(field => {
			const name = field.dataset.controlName;
			const control = document.getElementById(name);
			const button = field.querySelector(`[data-randomize="${name}"]`);
			const range = field.querySelector(".random-range");
			if (!name || !control || !button || !range) {
				return;
			}
			this.fields.set(name, { field, control, button, range });
			this.prepareRange(name);
			button.addEventListener("click", () => {
				this.setActive(
					name,
					button.getAttribute("aria-pressed") !== "true"
				);
			});
		});
		return this;
	}

	prepareRange(name) {
		const entry = this.fields.get(name);
		if (!entry || entry.control.type === "color") {
			return;
		}
		const minimum = entry.range.dataset.min ?? entry.control.min ?? "0";
		const maximum = entry.range.dataset.max ?? entry.control.max ?? "100";
		entry.range.replaceChildren(
			this.createRangeInput(name, "min", minimum, entry.control),
			this.createRangeInput(name, "max", maximum, entry.control)
		);
	}

	createRangeInput(name, edge, value, sourceControl) {
		const label = document.createElement("label");
		const caption = document.createElement("span");
		const input = document.createElement("input");
		caption.textContent = edge === "min" ? "Minimum" : "Maximum";
		input.type = "number";
		input.value = value;
		input.dataset.randomEdge = edge;
		input.dataset.randomFor = name;
		input.step = sourceControl.step || "1";
		if (sourceControl.min) input.min = sourceControl.min;
		if (sourceControl.max) input.max = sourceControl.max;
		label.append(caption, input);
		return label;
	}

	setActive(name, active) {
		const entry = this.fields.get(name);
		if (!entry) {
			return;
		}
		entry.button.setAttribute("aria-pressed", String(active));
		entry.range.hidden = entry.control.type === "color" || !active;
		entry.control.disabled = active;
	}

	isActive(name) {
		return this.fields.get(name)?.button.getAttribute("aria-pressed") === "true";
	}

	getRange(name) {
		const entry = this.fields.get(name);
		if (!entry || entry.control.type === "color") {
			return null;
		}
		const minimum = entry.range.querySelector('[data-random-edge="min"]');
		const maximum = entry.range.querySelector('[data-random-edge="max"]');
		return {
			min: Number.parseFloat(minimum?.value ?? entry.control.min ?? "0"),
			max: Number.parseFloat(maximum?.value ?? entry.control.max ?? "0")
		};
	}
}
