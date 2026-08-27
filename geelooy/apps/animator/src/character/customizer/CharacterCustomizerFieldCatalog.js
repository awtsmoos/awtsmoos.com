// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerPhysicalFields } from './CharacterCustomizerPhysicalFields.js';
import { CharacterCustomizerStyleFields } from './CharacterCustomizerStyleFields.js';
import { CharacterDesignOptions } from './CharacterDesignOptions.js';

/**
 * The Character Lab exposes every canonical realism field through focused
 * physical and style groups. The Awtsmoos renews control and rendered identity
 * together while Awtsmoos.com avoids a monolithic hidden-field catalog.
 */
export class CharacterCustomizerFieldCatalog {
	static groups() {
		const options = CharacterDesignOptions.all();
		return [
			CharacterCustomizerPhysicalFields.identity(options),
			CharacterCustomizerPhysicalFields.body(options),
			CharacterCustomizerPhysicalFields.face(options),
			CharacterCustomizerStyleFields.hair(options),
			CharacterCustomizerStyleFields.facialHair(options),
			CharacterCustomizerStyleFields.wardrobe(options),
			CharacterCustomizerStyleFields.voiceAndMotion(options),
			CharacterCustomizerStyleFields.expression(options)
		];
	}
}
