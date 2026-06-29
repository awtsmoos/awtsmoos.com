// B"H

/**
 * Special token strings that must not be SentencePiece-segmented.
 *
 * TinyLlama carries the ancient LLaMA gates `<s>` and `</s>`.  If `</s>` is
 * shattered into ordinary text, the assistant stands behind the wrong door
 * and answers with silence.  These names are only honored when the GGUF vocab
 * actually contains them.
 */
const SPECIAL_TOKENS = [
  '<s>', '</s>', '<start_of_turn>', '<end_of_turn>', '<bos>', '<eos>', '<pad>', '<unk>',
  '<|endoftext|>', '<|im_start|>', '<|im_end|>', '<|system|>', '<|user|>', '<|assistant|>'
];

module.exports = { SPECIAL_TOKENS };
