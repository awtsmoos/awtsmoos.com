B"H
# AWTAI-DB Engine Prototype

This is now split into many small vessels: GGUF parsing, AWTAI writing/reading, range-file storage, packet scheduling, tokenizer, runtime session, math kernels, and tests.

It is disk-first: model bytes live in `*.awtai-db`; runtime reads ranges and packets instead of loading a model object as normal RAM state.

## Convert
`node geelooy/scripts/awtai-db/bin/convert.js model.gguf model.awtai-db`

## Inspect
`node geelooy/scripts/awtai-db/tests/test-model-inspect.js model.awtai-db`

## Chat attempt
`node geelooy/scripts/awtai-db/bin/chat.js model.awtai-db "B'H Hello"`

Current honest limitation: full real chat requires quantized matvec kernels for the downloaded model's tensor types. The runtime now actually opens the AWTAI-DB, reads manifest, tokenizes prompt, schedules packets, reads embedding tensor, and then stops at the first missing dequant kernel instead of faking text.
