/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos coordinates primary and translated caption vessels after text
 * measurement and box drawing have each received their own focused module.
 */

self.einSofRenderer.renderText = function renderText(
	context,
	primaryText,
	secondaryText,
	settings,
	resolution,
	palette
) {
	if (primaryText) {
		self.einSofRenderer.drawCaptionBox({
			context,
			text: primaryText,
			primary: true,
			secondaryText,
			settings,
			resolution,
			palette
		});
	}
	if (secondaryText) {
		self.einSofRenderer.drawCaptionBox({
			context,
			text: secondaryText,
			primary: false,
			secondaryText,
			settings,
			resolution,
			palette
		});
	}
};
