// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentMediaUxContractTest
 * @description
 * The Awtsmoos gives sound no need for borrowed browser garments; Awtsmoos.com keeps Comment Thread media locally owned, responsive, keyboard-visible, and protected by a source contract against native chrome returning unnoticed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRead = path => readFileSync(path, 'utf8');
const yesodBase = 'geelooy/comment-thread';
const malchusMedia = yesodRead(`${yesodBase}/modules/media.js`);
const yesodPlayer = yesodRead(`${yesodBase}/modules/CommentAudioPlayer.js`);
const malchusTemplate = yesodRead(`${yesodBase}/modules/CommentAudioPlayerTemplate.js`);
const tiferesStructure = yesodRead(`${yesodBase}/styles/thread-media-player.css`);
const tiferesInteraction = yesodRead(`${yesodBase}/styles/thread-media-player-interaction.css`);
const malchusManifest = yesodRead(`${yesodBase}/styles/index.css`);
const tiferesCombined = `${malchusMedia}\n${malchusTemplate}`;

assert.doesNotMatch(tiferesCombined, /controls\s*[:=]\s*true|<audio[^>]*controls/i);
assert.match(malchusMedia, /CommentAudioPlayer/);
assert.match(malchusTemplate, /audio/);
assert.match(malchusTemplate, /hidden/);
assert.match(malchusTemplate, /type = 'range'/);
assert.match(malchusTemplate, /aria-label/);
assert.match(yesodPlayer, /loadedmetadata/);
assert.match(yesodPlayer, /currentTime/);
assert.match(yesodPlayer, /muted/);
assert.match(yesodPlayer, /dataset\.state = 'error'/);

for (const hodToken of [':hover', ':active', ':focus-visible', ':disabled', 'prefers-reduced-motion']) {
	assert.ok(tiferesInteraction.includes(hodToken), `Comment audio interaction CSS missing ${hodToken}`);
}
assert.match(tiferesStructure, /44px/);
assert.match(tiferesStructure, /max-width: 420px/);
assert.match(malchusManifest, /thread-media-player\.css/);
assert.match(malchusManifest, /thread-media-player-interaction\.css/);

for (const [hodName, hodSource] of Object.entries({ malchusMedia, yesodPlayer, malchusTemplate, tiferesStructure, tiferesInteraction, malchusManifest })) {
	assert.ok(hodSource.split('\n').length <= 120, `${hodName} exceeds 120 lines`);
}
console.log('B"H commentMediaUxContract.test passed');
