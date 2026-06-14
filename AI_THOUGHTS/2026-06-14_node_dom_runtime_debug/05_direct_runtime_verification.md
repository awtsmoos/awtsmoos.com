B"H

Direct verification after patch:
- Required installed /data/data/.../.awtsmoos-tunnel/tools/fs/nodeDomRuntime/index.js in a fresh Node process.
- Ran simulateNodeDomRuntime against http://127.0.0.1:8080/apps/tunnel-control/.
- Result ok=true, engine=node-dom, score=100, errors=[].

The live tunnel action still reports the old root-not-found error, which means the running agent process has the old module cached. Restarting the tunnel agent will reload the rewritten installed paths.js.
