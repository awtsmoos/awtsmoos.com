B"H

# Browser JSON Runner Plan

User asked for certainty about bulk read, bulk write, and simulateRuntime, and for a full Puppeteer/Playwright-style JSON browser-action system that runs inside the custom Merkava browser.

Immediate plan:
1. Re-verify existing source by reading Merkava service/runtime/browser modules.
2. Add a modular browser-action runner under `merkava-service/browser-actions/`.
3. Expose it through `simulateRuntime` by normalizing `browserActions`, `pageActions`, or `actions` JSON arrays into interactions.
4. Upgrade interaction execution from the old tiny click/type/assert API to a richer Playwright-like schema.
5. Stress test real behavior: DOM mutation, click handlers, typing/input events, keyboard, waitForSelector, evaluate/assert, console/error capture, failed selector errors.
6. Add a direct Node test for bulk read/bulk write/simulateRuntime through source action map so the exact actions that agents have had issues with are covered.
7. Run the combined regression cluster.

Safety limits:
- Destructive tunnel actions remain tested through disposable fixtures only.
- Browser runner executes inside Merkava's virtual runtime, not a real Chrome page.
- Live running agent may need restart for source changes to become live through WebSocket, but source tests prove the next load works.
