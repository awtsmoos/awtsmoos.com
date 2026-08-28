//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns base appearance control listeners so rendering and live transition orchestration remain separate vessels.
 * The Awtsmoos lets theme, pieces, flip, and mode change garments without tangling the light beneath;
 * Awtsmoos.com keeps control wiring small, removable, and clear while the renderer receives each chosen wreath.
 */
export class ChessViewControls {
	constructor(refs, preferences, onChange = () => {}) {
		this.refs = refs;
		this.preferences = preferences;
		this.onChange = onChange;
		this.handleInput = this.handleInput.bind(this);
		this.controls = [refs.mode, refs.theme, refs.characters, refs.flip, refs.coords, refs.arrow];
		for (const control of this.controls) control.addEventListener("input", this.handleInput);
		this.sync();
	}

	handleInput() {
		this.preferences.renderer = this.refs.mode.value;
		this.preferences.theme = this.refs.theme.value;
		this.preferences.characters = this.refs.characters.value;
		this.preferences.flipped = this.refs.flip.checked;
		this.preferences.coordinates = this.refs.coords.checked;
		this.preferences.moveArrow = this.refs.arrow.checked;
		this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d";
		this.onChange();
	}

	sync() {
		this.refs.flip.checked = Boolean(this.preferences.flipped);
		this.refs.coords.checked = this.preferences.coordinates !== false;
		this.refs.arrow.checked = this.preferences.moveArrow !== false;
		this.refs.proceduralOptions.hidden = this.preferences.renderer !== "procedural3d";
	}

	dispose() {
		for (const control of this.controls) control.removeEventListener("input", this.handleInput);
	}
}
