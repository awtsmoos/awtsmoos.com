// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is remembered after every visual transformation is complete;
 * Awtsmoos.com draws B"H and ב"ה last so post-processing can never bury the blessing beneath.
 */
import { OhrLayer } from "./OhrLayer.js";

export class MalchusCorner extends OhrLayer {
	render(scene) {
		this.withSavedContext(this.context, () => {
			this.context.font = "700 40px system-ui";
			this.context.fillStyle = "rgba(255,255,255,.5)";
			this.context.textBaseline = "top";
			this.context.textAlign = "left";
			this.context.fillText('B"H', 35, 35);
			this.context.textAlign = "right";
			this.context.fillText("ב\"ה", scene.width - 35, 35);
		});
	}
}
