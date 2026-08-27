import assert from 'node:assert/strict';
import { negotiateExportContainer } from '../modules/export/pipeline/ExportNegotiator.js';
assert.equal(negotiateExportContainer({ container:'mp4' }, { webm:true, mp4:true, hls:true }).container, 'webm');
assert.equal(negotiateExportContainer({ container:'mp4', experimental:true }, { webm:true, mp4:true, hls:true }).container, 'mp4');
console.log('B"H export negotiator smoke passed');
