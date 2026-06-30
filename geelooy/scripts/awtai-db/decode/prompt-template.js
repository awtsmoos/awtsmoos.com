// B"H

/**
 * TinyLlama metadata renderer.  It is not a fake universal Jinja engine: it
 * honors the observed role gates and eos token, then leaves an assistant gate
 * open for generation like dawn over a silent terminal.
 */
function renderPrompt(metadata, prompt, options = {}) {
  if (options.rawPrompt) return raw(prompt);
  const messages = normalizeMessages(prompt, options);
  const eos = eosText(metadata);
  const body = messages.map(m => renderMessage(m, eos)).join('\n');
  return options.addGenerationPrompt === false ? body : `${body}\n<|assistant|>`;
}

function normalizeMessages(prompt, options) {
  if (Array.isArray(prompt)) return prompt;
  if (Array.isArray(options.messages)) return options.messages;
  return [{ role: 'user', content: String(prompt) }];
}

function renderMessage(message, eos) {
  const role = safeRole(message && message.role);
  const content = String((message && message.content) || '');
  return `<|${role}|>\n${content}${eos}`;
}

function safeRole(role) {
  return role === 'system' || role === 'assistant' ? role : 'user';
}

function eosText(metadata) {
  const m = metadata || {};
  const id = Number(m['tokenizer.ggml.eos_token_id']);
  const tokens = m['tokenizer.ggml.tokens'];
  return Array.isArray(tokens) && Number.isInteger(id) && tokens[id] ? tokens[id] : '</s>';
}

function raw(prompt) {
  return Array.isArray(prompt) ? prompt.map(m => String(m.content || '')).join('\n') : String(prompt);
}

module.exports = { renderPrompt };
