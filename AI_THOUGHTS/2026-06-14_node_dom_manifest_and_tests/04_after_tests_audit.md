B"H

Audit after the user demanded certainty:
- Rebuilt geelooy/apps/tunnel/agent/manifest.txt with node geelooy/apps/tunnel/agent/rebuild-manifest.cjs.
- Manifest version 1.0.53, files 273, includes tools/fs/nodeDomRuntime/paths.js at line 195.
- Ran isolated tests:
  1. node-dom-runtime-actors.test.cjs passed.
  2. node-dom-playwright-puppeteer-compat.test.cjs passed.
  3. consolidated-get-runtime-guidance.test.cjs passed; its summary showed nodeDom ok=true engine=node-dom and autoRuntime ok=true engine=node-dom.
- Ran direct installed-runtime URL simulation against http://127.0.0.1:8080/apps/tunnel-control/; result ok=true engine=node-dom score=100 errors=[].

Remaining caveat:
- The currently running tunnel agent can still hold old require cache until restarted. Source and installed files are fixed and tested in fresh Node; live simulateRuntime action needs agent restart if it still returns old error.
