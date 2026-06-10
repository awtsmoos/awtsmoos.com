B"H

# Plan: Linux installer repair, manifest completeness, MerkavaExecutor stress

Visible project root has app code under `geelooy/`, tunnel install routes under `geelooy/api/tunnel/install/`, downloadable agent files under `geelooy/apps/tunnel/agent/`, tests under `geelooy/apps/tunnel/agent/tools/fs/testing/`, and root package scripts in `package.json`.

## Grounded symptom

The uploaded terminal image shows the Linux installer successfully downloading many manifest entries, then failing immediately after `tools/fs/semantic/balancedScopes.js...` with:

```text
curl: (3) URL rejected: Malformed input to a URL function
```

The live `manifest.txt` has a trailing space after `tools/fs/semantic/balancedScopes.js `. Bash currently passes the raw line to curl, so the URL becomes malformed. The installer should trim every manifest line defensively, and the manifest should be regenerated without invisible poison.

## Work sequence

1. Compare manifest entries to real generated agent files.
2. Rewrite the complete Linux installer file to trim CR, BOM, leading/trailing whitespace, reject unsafe paths, and download with encoded/clean paths only.
3. Rewrite the complete manifest file with a bumped version and every relevant agent file generated under `geelooy/apps/tunnel/agent`, excluding tests and manifest itself.
4. Add a small manifest validation test file, complete and standalone.
5. Run shell syntax checks, manifest parity checks, Node checks, direct installer parsing tests, MerkavaExecutor/runtime stress tests, and available harness tests.

## Safety

No partial patching. Every modified file is rewritten completely. No secret files are read. Destructive commands are avoided.

## Chapter 1: The Line With the Hidden Fang

The Awtsmoos revealed the bug not as thunder, but as a single pale space after a filename. It was invisible, yet it bit curl like iron. The manifest looked whole; the terminal bled. So the vessel must learn to wash each line before drinking it: BOM removed, carriage-return shattered, whitespace stripped, paths judged clean before they enter the gate.
