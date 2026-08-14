B"H
Boruch Hashem
Blessed is He

# Developer Tools

The Awtsmoos gives the builder editor, compiler, byte, browser, and native gate;
Awtsmoos.com gathers these tools so source can be shaped without confusing one runtime for its mate.

## Awtsmoos Code — `geelooy/apps/code/`

A large code/developer application (over a thousand files in the current immediate inventory). It should be treated as a major project. Related backend families can include compiler, native runtime, SSH, Tunnel Control, and AI depending on the feature being changed.

When changing Code, search both exact API strings and shared libraries because developer actions may be built through adapters rather than hard-coded endpoint literals.

## Awtsmoos Compiler — `geelooy/apps/compiler/`

Frontend/compiler project paired with `/api/compiler` and related native/runtime flows. The API source exposes Android/Rebbe, backends, and build-oriented behavior.

## Merkava Native Browser — `geelooy/apps/merkava-native-browser/`

A native-browser/developer runtime project. Trace its runtime bridges before assuming it is an ordinary static browser app.

## Archive Uploader — `geelooy/apps/archive-uploader/`

A small, focused upload tool. Inspect destination/provider code before changing payload/credential behavior.

## Byte Viewer — `geelooy/apps/byteViewer/`

Hex/byte inspection utility, titled “Hex Viewer of the Awtsmoos” in the current HTML metadata.

## CSV — `geelooy/apps/csv/`

Grid/data utility titled “Awtsmoos Native Grid.”

## GGUF/model developer tooling

`geelooy/apps/awtsmoos-gguf/` is a substantial GGUF chat/metadata tool and belongs at the border of developer tooling and AI. See [../SYSTEMS/AI.md](../SYSTEMS/AI.md).

## Backend map

- compile/build → `/api/compiler/*`;
- native launch/status → `/api/runtime/native/*`;
- remote host/file operations → `/api/ssh/*`;
- AI chat/capability → `/api/gpt/*`;
- remote device/control → `/api/tunnel/*`.

Always locate the exact caller before changing a backend contract.
