// B"H
import fs from 'fs';
import { multimodalSupport, buildMultimodalUserMessage, attachSnapshotForAgent } from '../../../geelooy/ai/central/multimodal.js';
import { sanitizeMessagesForProvider, toGeminiParts } from '../../../geelooy/apps/code/js/vibe/api/multimodal-adapter.js';
import { AgentCapabilities } from '../../../geelooy/apps/code/js/vibe/agent/logic/AgentCapabilities.js';

const image = { name: 'tiny.png', type: 'image/png', dataUrl: 'data:image/png;base64,iVBORw0KGgo=' };
const audio = { name: 'voice.mp3', type: 'audio/mpeg', dataUrl: 'data:audio/mpeg;base64,SUQz' };
const tests = [];
function test(name, fn) { try { tests.push({ name, ok: true, detail: fn() }); } catch (e) { tests.push({ name, ok: false, error: e.message }); } }

test('minimax-m3-supports-image-video-not-audio', () => multimodalSupport({ id: 'MiniMax-M3', provider: 'minimax' }, 'minimax'));
test('minimax-m2-omits-image', () => sanitizeMessagesForProvider([buildMultimodalUserMessage({ text: 'see', attachments: [image], model: { id: 'MiniMax-M2.7', provider: 'minimax' }, providerId: 'minimax' })], { id: 'MiniMax-M2.7', provider: 'minimax' }, 'minimax')[0].content);
test('minimax-m3-keeps-image', () => sanitizeMessagesForProvider([buildMultimodalUserMessage({ text: 'see', attachments: [image], model: { id: 'MiniMax-M3', provider: 'minimax' }, providerId: 'minimax' })], { id: 'MiniMax-M3', provider: 'minimax' }, 'minimax')[0].content);
test('google-keeps-audio-and-image', () => toGeminiParts(buildMultimodalUserMessage({ text: 'hear see', attachments: [image, audio], model: { id: 'gemini-2.5-pro', provider: 'google' }, providerId: 'google' }).content));
test('agent-capabilities-media', () => ({ image: AgentCapabilities.supportsImages({ id: 'MiniMax-M3', provider: 'minimax' }), audio: AgentCapabilities.supportsAudio({ id: 'gemini-2.5-pro', provider: 'google' }) }));
test('snapshot-attachment-message', () => attachSnapshotForAgent([{ role: 'system', content: 'B"H' }], { dataUrl: image.dataUrl, text: 'button is hidden' }, { model: { id: 'MiniMax-M3', provider: 'minimax' }, providerId: 'minimax' }));

const passed = tests.filter(t => t.ok).length;
const failed = tests.length - passed;
const report = { BH: 'B"H', generatedAt: new Date().toISOString(), total: tests.length, passed, failed, minimaxKeyPresent: Boolean(process.env.MINIMAX_API_KEY), note: 'No live provider request was made; token value was not read or printed.', tests };
fs.writeFileSync('AI_THOUGHTS/runtime-stress/local-action-sandbox/multimodal-ai-test.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failed) process.exitCode = 1;
