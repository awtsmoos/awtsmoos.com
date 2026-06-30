#!/usr/bin/env node
// B"H
const { runChat } = require('../decode/chat-loop.js');

function main() {
  const model = process.argv[2];
  const prompt = process.argv.slice(3).join(' ') || 'Hello';
  if (!model) return usage();
  try {
    const options = readOptions();
    const result = runChat(model, prompt, addStreaming(options));
    writeResult(result, options.stream);
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error.stack || error) }, null, 2));
    process.exit(2);
  }
}

function usage() { console.error('Usage: real-chat model.awtai-db "prompt"'); process.exit(1); }

function readOptions() {
  return {
    maxNewTokens: numberEnv('AWTAI_MAX_NEW', 1),
    minNewTokens: numberEnv('AWTAI_MIN_NEW', 0),
    promptTokens: optionalNumberEnv('AWTAI_PROMPT_TOKENS'),
    maxRamKvTokens: numberEnv('AWTAI_MAX_RAM_KV', 64),
    tensorCacheBytes: optionalNumberEnv('AWTAI_TENSOR_CACHE_BYTES'),
    rawPrompt: boolEnv('AWTAI_RAW_PROMPT'),
    addBos: !boolEnv('AWTAI_NO_BOS'),
    addGenerationPrompt: !boolEnv('AWTAI_NO_GENERATION_PROMPT'),
    topK: numberEnv('AWTAI_TOP_K', 10),
    stream: boolEnv('AWTAI_STREAM'),
    deleteScratchOnClose: boolEnv('AWTAI_DELETE_SCRATCH'),
    profile: !boolEnv('AWTAI_NO_PROFILE')
  };
}

function addStreaming(options) {
  return options.stream ? { ...options, onToken: (_id, text) => process.stdout.write(text) } : options;
}

function writeResult(result, streamed) {
  const json = JSON.stringify(result, null, 2);
  if (streamed) console.error(`\n---AWTAI_RESULT_JSON---\n${json}`);
  else console.log(json);
}

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function optionalNumberEnv(name) {
  if (process.env[name] === undefined || process.env[name] === '') return undefined;
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : undefined;
}

function boolEnv(name) { return /^(1|true|yes)$/.test(String(process.env[name] || '0')); }
main();
