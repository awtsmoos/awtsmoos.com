#B"H — Tunnel legacy-GET restoration + Piano keyboard/voice fixes — Ledger
Run: 2026-11-25T23:45Z implementation, 2026-11-25T23:57Z deploy + live E2E (resume run).
Repo main. All other sessions dirty paths PRESERVED (only the scoped files below were staged).

## Problem 1 — Tunnel regression (root cause, from source)
core/revelation/transportGuard.js categorically rejected every payload-bearing GET
(transport_guard_rejected / HTTP 414), regardless of size — the reported 916-byte
write died on policy, not on any physical URL limit. The deployed ChatGPT Shliach
plugin cannot choose its HTTP method (OAuth/apiKey-authenticated GET with query
params), so all plugin writes/commands broke while reads kept working.

## Fix (commit 5195c6dc9, 5 files)
- transportGuard.js: LEGACY_GET_MAX_URL_BYTES = 16384; payload GET admitted when
  legacyGetAllowed (transport "query-legacy"); beyond ceiling -> chunked (413 class).
- wiring.js: guardFsTransport(, identity) — legacyGetAllowed only for verified
  non-cookie credential kinds (apiKey, oauth). Browser sessions NEVER qualify:
  navigation/prefetch/image-tag/CSRF-by-cookie cannot mutate.
- protectedFs.js: passes the already-verified identity into the guard (401 still
  precedes the guard); all tunnel responses now Cache-Control: no-store + Pragma: no-cache.
- docs/transport.js: legacy compatibility documented.
- core/test/revelationLegacyGet.test.cjs (new): 916-byte-class write, ~6KB write,
  OAuth commandRun, session rejection (414), no-identity rejection, oversized ->
  413 chunked guidance, POST unchanged, read-only GET unchanged.
Both transports normalize into the same canonical payload/auth/execution/audit path.

## Problem 2 — Piano keyboard (commit 7b7b643d6)
Default = two traditional piano rows, chromatic order
q 2 w 3 e r 5 t 6 y 7 u / z s x d c v g b h n j m (QWERTYU = CDEFGAB;
ZXCVBNM = next octave from far left; blacks 2 3 5 6 7 / S D G H J).
bindingCatalog: PIANO_ROW_KEYS is DEFAULT_BINDING_KEYS; column layout kept as
COLUMN_KEYS preset. bindingPreferences: storage v9; a stored v8 equal to the old
automatic default migrates, genuine customs survive (keyboardBindingMigration tests).
bindings.js resolves via keyLookupIndex.js (committed: shared dependency).

## Problem 3 — Voice + Piano mix (same commit)
voiceMix.js: measureStem (peak + activity-gated RMS — silence/noise never amplified),
autoBalanceStems (voice aimed at target active RMS under a peak ceiling, piano placed
3 dB under the voice, gain caps), soft vocal compression, voice-driven piano ducking —
all inside the one pure mix function used by BOTH preview and WAV export (parity by
construction). A voiceless stem is never boosted; warning voice-too-quiet instead.
micCapture/micSafety: music-oriented capture options surfaced; voiceTakeControl/
voiceTakeStore carry the derived balance with the take; original stems preserved.
Measured (controlled fixture, voiceMixVocalForward.test.mjs, reproduced in resume run):
voice/piano ratio -24.6 dB before -> +4.2 dB after (voice gain 4.00, piano 0.14).

## Tests personally re-run in the resume run
- Tunnel control core: 38/38 PASS (incl. revelationLegacyGet).
- Relay: 42 pass / 1 fail of 43 files — browserRelayRegistration.test.mjs fails on a
  pre-existing ESM/CJS load error inside geelooy/apps/code (untouched by this task;
  the relay tree has zero dirty files). The .cjs relay subset is fully green.
- Piano: node --test test/*.test.mjs = 402/402 PASS.

## Deploy
- git push origin main: 73ba77759..7b7b643d6 (both scoped commits).
- systemctl restart awtsmoos.service at 2026-11-25T23:57:01Z (Hai authorized the
  coordinated restart in this task): new MainPID 1358374, clean startup, HTTP
  listening; device awt-root-73967 answered immediately after (agent session live).

## Live E2E against https://awtsmoos.com (public transport, post-restart)
Temporary API key minted for the tunnel owner account via apiKeyStore (1h expiry),
revoked and deleted after the run; key never printed.
- Unauthenticated legacy GET write -> 401 not_authenticated. PASS
- Legacy GET list on awt-root-73967 -> ok, device session live. PASS
- Legacy GET write of e2e-legacy-get.txt (multiline, tab, quotes, Hebrew unicode)
  -> ok=true; response headers Cache-Control: no-store, Pragma: no-cache. PASS
- Legacy GET read back (retryAction observation flow to terminal) -> content
  SHA-256 82b753311c76b8a319974f6cd799421d362e7cae8be243104fdab037ef53067d,
  byte-identical to the written content hash. PASS
- Legacy GET commandRun sha256sum -> job cmdjob_mwwse2vn_82332cc9ec6c;
  commandJobOutputPage returned the same hash. PASS (execution, not just 200)
- Modern POST JSON write -> accepted (control_request receipt). PASS
- Test files removed via commandRun; E2E key revoked (revokeApiKeyRecord -> true).

## Live piano (served bytes, fetched from the public URL)
- /apps/piano/modules/keyboard/bindingCatalog.js: 200, 2730B (= disk), PIANO_ROW_KEYS
  with the exact chromatic array. /modules/recording/voiceMix.js: 200, 8858B (= disk),
  autoBalanceStems/measureStem present. bindingPreferences.js serves v9 storage key.
  Index 200 at the unchanged permanent URL. Static = live on request, no pin bump
  needed (module URLs are unpinned in the served index).

## Limitations (honest)
- The hosted ChatGPT plugin itself cannot be invoked from this environment; its
  exact transport shape (authenticated non-cookie GET, payload in query, durable
  observation flow) was reproduced byte-for-byte against the public API instead.
- Real-browser piano key-press verification (QWERTYU/ZXCVBNM sounding the right
  notes) is NOT verified: the earlier exploratory CDP run timed out waiting for
  .key elements under server load ~6-7 (no evidence either way), and this worker
  has no live-browser channel. Served bytes + the 402-test suite (geometry,
  migration, smoothness) are the evidence held; a browser-agent pass in a calm
  window is still owed.
- Physical-microphone singing test not performed (no mic hardware/consent here);
  the vocal-forward proof is the controlled synthetic-stem fixture through the
  real mix function, above.
- Browser-session GET-mutation rejection is unit-proven (revelationLegacyGet),
  not live-proven (would need a signed-in browser session).
