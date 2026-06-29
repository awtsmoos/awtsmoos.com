#!/usr/bin/env node
// B"H

const { runChat } = require('../decode/chat-loop.js');

/**
 * Real AWTAI chat CLI.
 *
 * The prompt must enter as a whole unless the caller deliberately asks for
 * a smaller probe.  The previous default of one prompt token turned every
 * “real prompt” into a BOS-only illusion.  This file now refuses that lie.
 */
function main() {
  const model = process.argv[2];
  const prompt = process.argv.slice(3).join(' ') || 'Hello';

  if (!model) {
    console.error('Usage: real-chat model.awtai-db "prompt"');
    process.exit(1);
  }

  try {
    const result = runChat(model, prompt, readOptions());
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error.stack || error) }, null, 2));
    process.exit(2);
  }
}

function readOptions() {
  return {
    maxNewTokens: numberEnv('AWTAI_MAX_NEW', 1),
    promptTokens: optionalNumberEnv('AWTAI_PROMPT_TOKENS'),
    maxRamKvTokens: numberEnv('AWTAI_MAX_RAM_KV', 64),
  };
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

main();
