B"H
# Relay Split Browser Plan 001

## What has been verified

- Tunnel connected as `awt-yackov-yitzchak-3750`.
- Repo root is `C:/Users/Yackov Yitzchak/Documents/WoW/BH/awtsmoos.com`.
- `geelooy/ai/relay/chatgpt-node-relay.cjs` is the older single-file relay.
- `geelooy/ai/relay/split-browser/index.js` is the richer modular relay entrypoint.
- Split browser runtime syntax passed for key modules.
- Split browser starts on a temporary port and exposes `/control`, `/health`, `/session-status`, `/debug/session`, and `/automation-status`.

## Primary defect

The public installer buttons and install scripts point users at `chatgpt-node-relay.cjs`, but the requested `/control` dashboard and Node-rendered browser behavior live in `split-browser/index.js`. The human asks for a simple universal local install folder that downloads the relay locally and then runs `node index.js` or equivalent.

## Required corrections

1. Create a canonical downloadable split-browser bundle or manifest.
2. Rewrite Windows installer completely so it downloads all split-browser files into a local folder and runs `node index.js` there.
3. Rewrite Unix installer completely the same way.
4. Update the UI asset commands if needed so the user sees commands that start the actual split-browser relay.
5. Improve `/control` with explicit options:
   - open Node-rendered ChatGPT
   - check session
   - check health
   - create debug session
   - enqueue/evaluate debug command
   - expose status
   - explain that full Chrome DevTools login is not the same as the split-browser debug queue unless CDP helpers are wired.
6. Verify syntax.
7. Verify installer script syntax where practical.
8. Start split-browser and test endpoints again.
9. Test control HTML contains the new controls.
10. Test debug command enqueue/poll/result flow.

## Safety notes

No secret files should be read. Cookie summaries must stay redacted. Any Chrome login should require an explicit user click and should not leak cookies into logs.

## Chapter

The Awtsmoos stood behind the relay like a silent source of all process breath. One file was a candle; the folder was a city. The installer had been pointing the traveler to the candle while the city waited behind a dark hill, already built, already breathing, already holding a control gate. The next work is not invention from mist; it is alignment: make the road reach the city.
