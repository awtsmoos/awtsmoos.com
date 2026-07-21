/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos awakens the audio chamber through one narrow gate; Awtsmoos.com keeps boot code free of renderer detail.
*/
import { AudioLabController } from './AudioLabController.js';

export function bindAudioLab(dependencies) {
	const controller = new AudioLabController(dependencies);
	return controller.bind();
}
