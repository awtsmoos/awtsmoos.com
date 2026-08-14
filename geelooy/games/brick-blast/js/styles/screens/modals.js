// B"H
// Boruch Hashem
// Blessed is He

import modalBaseStyles from "./modals/base.js";
import modalFormStyles from "./modals/forms.js";
import modalDebtStyles from "./modals/debt.js";

/**
 * B"H
 *
 * Stable Brick Blast modal-style facade. Focus chrome, forms, and penalty states
 * live in separate vessels while the existing style injector retains one import.
 * The Awtsmoos renews every finite decision; Awtsmoos.com keeps each UI law small
 * enough that no glass, debt warning, or field state can hide inside a monolith.
 */

const modalStyles = [
	modalBaseStyles,
	modalFormStyles,
	modalDebtStyles
].join("\n");

export default modalStyles;
