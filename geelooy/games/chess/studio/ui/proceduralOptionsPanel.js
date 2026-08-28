//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Exposes non-leaking controls for procedural camera motion, lighting, finishes, and geometry.
 * The Awtsmoos lets every native option enter through one listening gate;
 * Awtsmoos.com rerenders controls freely without multiplying handlers in state.
 */
import { normalizedProceduralOptions, proceduralOptionCatalog } from "../rendering/proceduralOptions.js";

export class ProceduralOptionsPanel {
	constructor(root, onChange = () => {}) {
		this.root = root;
		this.onChange = onChange;
		this.options = normalizedProceduralOptions();
		this.catalog = proceduralOptionCatalog();
		this.handleInput = this.handleInput.bind(this);
		this.root.addEventListener("input", this.handleInput);
	}

	render(options = this.options) {
		this.options = normalizedProceduralOptions(options);
		this.root.replaceChildren(this.buildPanel());
	}

	buildPanel() {
		const panel = document.createElement("div");
		panel.className = "chess-studio-procedural-options";
		panel.append(
			this.select("cameraMotion", "Motion", this.catalog.motions),
			this.select("camera", "View / angle", this.catalog.cameras),
			this.select("cameraIntensity", "Motion intensity", this.catalog.intensities),
			this.select("lighting", "Lighting", this.catalog.lighting),
			this.select("quality", "Quality", this.catalog.quality),
			this.select("pieceMaterial", "Piece finish", this.catalog.materials),
			this.toggle("fog", "Atmospheric fog"),
			this.toggle("followMove", "Follow each move"),
			this.toggle("moveArrow", "3D move arrow"),
			this.range("boardThickness", "Board depth"),
			this.range("boardTilt", "Board tilt"),
			this.range("pieceScale", "Piece scale")
		);
		if (this.options.camera === "manual") panel.append(...this.manualRanges());
		return panel;
	}

	select(key, label, items) {
		const select = document.createElement("select");
		select.dataset.option = key;
		for (const item of items) {
			const id = typeof item === "string" ? item : item.id;
			select.add(new Option(typeof item === "string" ? title(item) : item.name, id, false, this.options[key] === id));
		}
		return field(label, select);
	}

	toggle(key, label) {
		const input = document.createElement("input");
		input.type = "checkbox";
		input.checked = Boolean(this.options[key]);
		input.dataset.option = key;
		return field(label, input);
	}

	range(key, label, manual = false) {
		const [min, max, step] = this.catalog.ranges[key];
		const input = document.createElement("input");
		input.type = "range";
		Object.assign(input, { min, max, step, value: manual ? this.options.manualCamera[key] : this.options[key] });
		input.dataset.option = key;
		if (manual) input.dataset.manual = "true";
		return field(label, input);
	}

	manualRanges() {
		return ["distance", "elevation", "azimuth", "fov"].map(key => this.range(key, title(key), true));
	}

	handleInput(event) {
		const input = event.target.closest?.("[data-option]");
		if (!input) return;
		const value = input.type === "checkbox" ? input.checked : input.type === "range" ? Number(input.value) : input.value;
		if (input.dataset.manual) this.options.manualCamera[input.dataset.option] = value;
		else this.options[input.dataset.option] = value;
		const next = normalizedProceduralOptions(this.options);
		this.onChange(next);
		if (input.dataset.option === "camera") this.render(next);
	}

	dispose() {
		this.root.removeEventListener("input", this.handleInput);
	}
}

function field(labelText, control) {
	const label = document.createElement("label");
	const span = document.createElement("span");
	span.textContent = labelText;
	label.append(span, control);
	return label;
}

function title(value) {
	return String(value).replace(/([A-Z])/g, " $1").replace(/^./, character => character.toUpperCase());
}
