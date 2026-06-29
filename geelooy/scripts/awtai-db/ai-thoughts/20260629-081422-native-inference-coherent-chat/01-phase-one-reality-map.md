# B"H

# Phase One Reality Map — Native Inference Coherent Chat

## Mission
Continue the awtai native inference investigation until TinyLlama chat produces coherent multi-token English comparable to llama.cpp. A single plausible token, a single word, or an EOS workaround is not success.

## Observed starting evidence
- Project root observed through tunnel: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com`.
- Active branch observed: `main`.
- Existing user-modified file observed outside this task: `geelooy/api/social/helper/community/test/communityPublishing.test.js`; do not touch it.
- awtai-db source tree observed under `geelooy/scripts/awtai-db`.
- Prior awtai-db notes exist under `geelooy/scripts/awtai-db/ai-thoughts/`.

## Initial high-risk suspects
1. Remaining transformer math mismatch after RoPE Neox flag correction.
2. Quantized Q2_K row decode or native dot product mismatch against ggml.
3. Tensor orientation assumptions in projections.
4. KV cache indexing, grouped-query mapping, or position handling.
5. Output norm / LM head interpretation.
6. Tokenizer/chat-template/EOS behavior masking math issues.
7. Sampler hiding bad logits.

## Work graph
- Locate all runtime entrypoints and current debug scripts.
- Run actual current chat behavior before edits.
- Dump metadata and tensor shapes from the `.awtai-db` model.
- Read native implementation and JS fallback implementation.
- Read old browser GGUF reference worker.
- Locate and read local llama.cpp / ggml source if present.
- Build subsystem-by-subsystem delta table.
- Instrument minimally and safely where evidence is missing.
- Modify only after proof.
- Re-run prompts until coherent multi-token chat is achieved.

## File modification rule
No existing source file may be partially patched. If modification becomes necessary, the whole file will be read first and then rewritten in full, or split into smaller complete modules.
