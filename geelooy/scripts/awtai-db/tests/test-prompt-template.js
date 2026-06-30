// B"H
const assert = require('assert');
const { renderPrompt } = require('../decode/prompt-template.js');

const meta = { 'tokenizer.ggml.eos_token_id': 2, 'tokenizer.ggml.tokens': ['<unk>', '<s>', '</s>'] };
assert.strictEqual(renderPrompt(meta, 'Hello'), '<|user|>\nHello</s>\n<|assistant|>');
assert.strictEqual(renderPrompt(meta, [
  { role: 'system', content: 'Be brief.' },
  { role: 'user', content: 'Sky?' }
]), '<|system|>\nBe brief.</s>\n<|user|>\nSky?</s>\n<|assistant|>');
assert.strictEqual(renderPrompt(meta, 'x', { rawPrompt: true }), 'x');
console.log(JSON.stringify({ ok: true, test: 'prompt-template' }));
