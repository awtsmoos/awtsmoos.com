/* B"H */
import assert from 'node:assert/strict';
import { awtsmoosLabel, sefirahName, labelSefirah } from '../modules/sefiros/names.js';
import { recordingStep, traceLabel } from '../modules/sefiros/recordingTree.js';
import { codecString } from '../modules/recording/container/webmCodecString.js';
import { audioTrackConfig, muxerConfig, videoTrackConfig } from '../modules/recording/container/webmTrackConfig.js';
import { webmMuxerVersionHint } from '../modules/recording/container/webmMuxerUrl.js';

assert.equal(sefirahName(0), 'keter');
assert.equal(awtsmoosLabel('mux'), 'Awtsmoos mux');
assert.equal(labelSefirah(9, 'blob'), 'malchus:blob');
assert.equal(recordingStep('mux'), 'tiferes');
assert.equal(traceLabel(1, 'keter'), 'chochmah:plan');
assert.equal(codecString('vp8', true), 'vp8,opus');
assert.deepEqual(videoTrackConfig({ width:1920, height:1080, fps:30, video:{ muxCodec:'V_VP8' } }), { codec:'V_VP8', width:1920, height:1080, frameRate:30 });
assert.deepEqual(audioTrackConfig({ active:true, sampleRate:48000, numberOfChannels:2 }), { codec:'A_OPUS', sampleRate:48000, numberOfChannels:2 });
assert.equal(muxerConfig({ target:'t', width:1, height:2, fps:3, video:{ muxCodec:'V_VP9' }, audio:null }).firstTimestampBehavior, 'offset');
assert.equal(webmMuxerVersionHint(), '5.1.2');
console.log(JSON.stringify({ ok:true, sefirah:sefirahName(0), codec:codecString('vp8', true) }));
