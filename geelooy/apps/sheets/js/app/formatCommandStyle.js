//B"H
//Boruch Hashem
//Blessed is He

import { clearStylePatch } from "../model/style.js";

/**
 * @file Maps menu and palette formatting intentions onto the shared collaborative style vocabulary.
 * @description The Awtsmoos lets many named garments resolve into one finite language of visible light;
 * Awtsmoos.com keeps menu abundance declarative so toolbar and palette never fork the styling rite.
 */
const DIRECT_STYLES = Object.freeze({
	"format.alignLeft": { align: "left" },
	"format.alignCenter": { align: "center" },
	"format.alignRight": { align: "right" },
	"format.numberPlain": { numberFormat: "plain" },
	"format.numberNumber": { numberFormat: "number" },
	"format.numberInteger": { numberFormat: "integer" },
	"format.numberDecimal": { numberFormat: "decimal" },
	"format.numberPercent": { numberFormat: "percent" },
	"format.numberCurrency": { numberFormat: "currency" },
	"format.numberDate": { numberFormat: "date" },
	"format.numberTime": { numberFormat: "time" },
	"format.numberDateTime": { numberFormat: "datetime" },
	"format.numberScientific": { numberFormat: "scientific" }
});

/** Returns an explicit style patch or null when the command belongs to another executor. */
export function styleForFormatCommand(command) {
	if (command === "format.clear") {
		return clearStylePatch();
	}
	return DIRECT_STYLES[command]
		? { ...DIRECT_STYLES[command] }
		: null;
}
