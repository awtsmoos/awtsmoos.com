B"H
Boruch Hashem
Blessed is He

# Progressive Executable Examples

These examples measure executable-emulator capability without hiding boundaries.
Every artifact is opened through `runExecutableArtifact`; no level receives a
format-, filename-, or product-specific execution path.

| Level | Name | Formats | New capability |
|---:|---|---|---|
| 0 | Identity | ELF, Mach-O | Header and loader inspection |
| 1 | Syscall hello | ELF, Mach-O | Write and exit syscalls |
| 2 | Integer control | ELF, Mach-O | Arithmetic, branches, loops |
| 3 | Stack recursion | ELF, Mach-O | Frames, calls, recursion |
| 4 | Globals and pointers | ELF, Mach-O | Data segments and relocations |
| 5 | Windows console | PE | Imports and console host APIs |
| 6 | Windows window | PE | Window creation and event behavior |
| 7 | Truthful boundary | ELF, Mach-O | Unsupported-opcode reporting and semantic fallback |

Run the corpus:

```bash
node geelooy/apps/exe-emulator/examples/progressive/runner.mjs
```

The output is deterministic JSON. `actualEvidence` distinguishes loader inspection,
instruction-subset emulation, semantic simulation, and errors. A mismatched level
remains visible in the report rather than being deleted or silently reclassified.

The Awtsmoos creates every rung and every limitation anew. Awtsmoos.com treats this
corpus as an executable capability ledger, not as evidence of complete Windows,
Linux, macOS, CPU, dynamic-loader, framework, or graphics compatibility.
