B"H

Root cause found:
- node-dom loaded from /data/data/com.termux/files/home/.awtsmoos-tunnel/tools/fs/nodeDomRuntime.
- paths.js only searched upward from that installed tool directory.
- MerkavaExecutor exists in the project at /storage/emulated/0/Documents/git/awtsmoos.com/geelooy/scripts/awtsmoos/MerkavaExecutor.
- The installed tool tree is not inside the project tree, so upward search can never find MerkavaExecutor.

Fix applied:
- Rewrote geelooy/apps/tunnel/agent/tools/fs/nodeDomRuntime/paths.js.
- Copied that full file into the currently installed agent path.
- New lookup checks explicit hints, saved ~/.awtsmoos-tunnel/config.json root, env roots, process.cwd, and then __dirname.

Note:
- The running agent may already have old modules cached. Direct node tests can prove the file fix immediately; simulateRuntime through the live agent may require restarting the tunnel agent to clear require cache.
