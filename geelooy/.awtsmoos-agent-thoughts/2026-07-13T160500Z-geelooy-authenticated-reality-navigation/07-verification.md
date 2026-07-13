# B"H

Boruch Hashem

Blessed is He

## Verification Ledger

### Repository and concurrency

- Live repository and Geelooy roots were inspected through the connected macOS tunnel.
- The tree was already broadly dirty and multiple unrelated workers and browser targets were active.
- Application source writes were withheld rather than merging unowned work by assumption.
- Focused `git diff --check` exited zero.

### Direct-route truth

- Fourteen of fourteen declared route contracts returned HTTP 200 on `http://127.0.0.1:8080`.
- None of the fourteen direct loads contained `DYN_ROUTE_NOT_FOUND`.
- `/about` and `/apps` alone exposed `data-geelooy-route-outlet`, matching `routeRegistry.js`.
- Native-only and specialist routes remained ordinary server pages.

### Module-serving truth

- Thirty-two recursive local modules were discovered from `shell/boot.js`.
- Thirty-two of thirty-two returned HTTP 200 JavaScript MIME from the Geelooy-rooted app origin using `/scripts/…`.
- Thirty-two of thirty-two returned HTTP 200 JavaScript MIME from the repository-static origin using `/geelooy/scripts/…`.
- The deliberately wrong app-origin `/geelooy/scripts/…` prefix returned HTTP 200 JSON with `DYN_ROUTE_NOT_FOUND` for both `boot.js` and `appNavigation.js`.

### Contract tests

- `appNavigationContract.test.mjs`: passed.
- `hybridNavigationContract.test.mjs`: passed.
- Total: two passed, zero failed, exit code zero.

### Browser continuity

- Exact target: `3297486E926AB5D73BE7818B0D258F76`.
- Fresh About load contained one shell, one dock, one outlet, and the correct `/scripts/…/boot.js` module.
- A unique marker placed on the shell survived About → Apps and browser Back.
- Apps and restored About each contained one shell, one dock, and one outlet.
- No captured console, runtime-exception, or network-loading-failure events occurred.

### Authentication boundary

- `/api/social`: HTTP 200 JSON, no session, no user ID, no default alias.
- `/api/social/aliases/details`: HTTP 200 JSON, zero aliases.
- Client alias globals were null.
- Mutation verification is blocked, not passed.

### Accessibility and viewport evidence

- About and Apps were checked at 320, 390, 768, 1024, and 1440 CSS pixels.
- Every checked state contained one shell, one dock, one outlet, one `main`, and one `h1`.
- No unnamed links or buttons were found in the checked DOM.
- Reduced-motion and forced-colors emulation were active and the pages continued to render.
- Ten Tab presses reached named controls and links without runtime or network failures.
- The initial 320-pixel overflow signal was a measurement false positive: `innerWidth` was 320, root `clientWidth` was 305 because of the vertical scrollbar, and no visible element extended beyond the 320-pixel viewport.

### Confirmed defects requiring isolated correction

- About contains two profile mounts: the canonical `.g-shell` header and the legacy server wrapper `.all.awtsmoospage` header.
- The duplicate profile styles cause both About `dropdownBackdrop` controls to compute as visible flex boxes and remain at `tabIndex=0` despite the `hidden` class.
- Apps has only one profile mount; its hidden backdrop computes to `display:none`.
- Apps marks multiple child app links `aria-current="page"`; current-route semantics need narrower matching.

### Cache state

- Service-worker registrations: zero.
- Cache Storage names: zero.
- No cache or registration was cleared.

### Files changed by this pass

Only the timestamped evidence directory was written. No application source, route template, test owner, authentication record, alias, Heichel, post, comment, or cache was changed.
