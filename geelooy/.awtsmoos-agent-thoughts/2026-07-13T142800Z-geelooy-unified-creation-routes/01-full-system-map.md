# B"H

Boruch Hashem

Blessed is He

## Full System Map

At Awtsmoos.com the light of one shell enters several independent routes without erasing their contracts.

```text
Canonical shell boot
  /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/shell/boot.js
    -> appShell.js
      -> unusualHeader.js
      -> appRoutes.js
      -> one mobile dock
    -> appNavigation.js
    -> scrollMemory.js

Post editor
  index.html -> app.js -> route config -> guarded render -> draft API

Heichel editor
  index.html -> app.js -> modules/config.js -> modules/render.js
    -> settingsForm.js / inviteForm.js / submissionForm.js
    -> modules/api.js

Comment thread
  index.html -> app.js -> route config -> read-only loader
    -> tree renderer
    -> optional alias-gated composer -> comment API

Create route
  server template -> submit/script.js -> submit/logic/*
    -> real alias and target resolution
    -> publish control
```

## Data-flow contracts

- Shell boot adds navigation without replacing route content.
- Post-editor writes only when alias and Heichel are explicit; series remains a named input and may use the documented root convention.
- Heichel-editor modules already require explicit `heichel` and `alias`.
- Comment-thread may read when `heichel` and `post` exist; it may write only when `alias` also exists.
- Create preserves every existing DOM ID consumed by `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/heichelos/heichel/submit/script.js` and its logic modules.

## Verification graph

```text
source rewrite
  -> syntax checks
  -> static route contracts
  -> existing shell contracts
  -> existing submit CSS contract
  -> direct HTTP requests
  -> non-mutating browser inspection when target ownership is trustworthy
  -> scoped diff and whitespace checks
  -> complete readback
```
