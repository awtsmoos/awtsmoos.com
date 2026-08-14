B"H
Boruch Hashem
Blessed is He

# Mail Duplicate-Navigation Repair

> The Awtsmoos is One; two competing bottom horizons on one narrow screen are not revelation but noise. Awtsmoos.com should keep one global dock while Mail preserves only the local conversation/history behavior that belongs to Mail itself.

## Evidence
- `layout.js` currently imports both `connectMalchusNavigation` and `malchusDock`, then renders `malchusDock(ui)` inside the Mail route.
- The shared shell's `appShell.js` independently creates the canonical `.g-dock` from `primaryRoutes` for every eligible route.
- `malchusNavigation.js` renders a second mobile nav with Inbox, Search, New, Social, and Signals, duplicating global destinations and occupying the same bottom-screen attention zone.
- Its browser-history functions are still valuable: they close/reopen the selected thread on Back/Forward without duplicating navigation UI.
- `layout.js` has also evolved from legacy `mail-quantum-*` classes to `mail-civilization-*`; tests still assert old implementation tokens.
- `appRoutes.js` canonically spells Mail as `/email/`, not `/email`.

## Repair
1. Rewrite `geelooy/email/ui/layout.js` completely: keep the civilization header/frame/sidebar/chat and `connectMalchusNavigation`, remove the local dock from rendered children.
2. Rewrite `geelooy/email/ui/malchusNavigation.js` completely so it owns only thread-history synchronization; remove dead dock factories and compose/social/signals link rendering.
3. Rewrite `mailMobileShellContract.test.mjs` to assert the current civilization frame plus the absence of `malchusDock`/legacy duplicate-nav tokens.
4. Rewrite `mailSharedShellContract.test.mjs` to assert current civilization shell classes and canonical `/email/` route spelling while retaining generated shared-shell, Quantum product identity, retry behavior, and no-duplicate-navigation guarantees.
5. Reread all four files, confirm each remains under 120 lines, then rerun both tests through a detached command job.
