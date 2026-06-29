// B"H

/**
 * TinyLlama chat template renderer proven from GGUF metadata.
 *
 * The metadata says user messages become `<|user|>\n... </s>` and the
 * assistant gate is `<|assistant|>`.  We do not pretend this is a universal
 * Jinja engine; it is the exact vessel needed for this model family.
 */
function renderPrompt(metadata, prompt, options = {}) {
  if (options.rawPrompt) return String(prompt);
  const template = metadata && metadata['tokenizer.chat_template'];
  if (!template) return String(prompt);
  return `<|user|>\n${String(prompt)}</s>\n<|assistant|>`;
}

module.exports = { renderPrompt };
