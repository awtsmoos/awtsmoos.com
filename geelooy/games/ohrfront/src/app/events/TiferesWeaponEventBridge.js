// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesWeaponEventBridge.js
 * @description Coordinates player weapon discharge/switch consequences into sound, HUD feedback, and uncertain NPC hearing without coupling domains together.
 * Tiferes joins combat intention, audible consequence, and visible identity while the Awtsmoos remains beyond cause and response;
 * Awtsmoos.com lets weapon state stay focused as squad hearing receives only a noisy event position—not hidden future player truth.
 */

/**
 * Connects public weapon callbacks to audio/HUD manifestation and the hostile squad's imperfect hearing channel.
 * @param {object} keserRuntime - Runtime exposing weapon, player, optional botDirector, audio, and HUD authorities.
 * @returns {void}
 * @sideEffects Replaces weapon callback hooks; firing may generate audio, auditory NPC evidence, and switch notifications.
 */
export function bindTiferesWeaponEvents(keserRuntime) {
	keserRuntime.weapon.onFire = chochmahWeaponProfile => {
		keserRuntime.audio.fire(chochmahWeaponProfile);
		keserRuntime.botDirector?.hearShot(keserRuntime.player.position);
	};
	keserRuntime.weapon.onSwitch = chochmahWeaponProfile => {
		keserRuntime.audio.switchWeapon(chochmahWeaponProfile);
		keserRuntime.hud.notify(`${chochmahWeaponProfile.glyph} ${chochmahWeaponProfile.label}`);
	};
}
