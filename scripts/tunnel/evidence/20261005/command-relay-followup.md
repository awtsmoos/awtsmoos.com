<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Awtsmoos real relay follow-up — October 5, 2026

At 15:45 New York time, the Mac-local commandStart test completed with exit code zero and exact stdout while running split-agent-2.0.0 / runtime 1.0.641. This disproves the claim that the version label alone establishes a universally failing local command runner. It does not disprove failures through external clients.

Two additional defects were found and fixed:

1. protectedFs passed response.status (including spawning) into the control JSON HTTP status helper. The outer dynamic wrapper therefore exposed a nonnumeric transport status. The helper now converts valid HTTP codes and keeps lifecycle text in the JSON body with HTTP 200. Numeric 401 and string 429 remain intact. Commit cf8e2c19f.
2. The actual parent proxy emits connection.send with an envelope field, while the connection child read message.payload. Production diagnostic metadata confirmed the paired Mac was sending the nine-byte text undefined. The child now consumes envelope, retains legacy payload compatibility, and rejects missing or malformed packets; safeSend also rejects absent objects before serialization. Commit 0993591a1.

Release 1.0.642: 3abf0704b. Canonical production deployment completed. Published bundle manifest returned 1.0.642. The official identity-preserving transactional installer passed checksum, isolated candidate registration/action readiness, activation, launchd supervision, and live registration. The physical tunnel ID was retained. Active main PID 48830; connection PID 48994; supervisor PID 48578 at verification.

After activation, command, commandRun, and commandStart each completed with exit code zero and exact stdout Awtsmoos repaired relay witness. Acceptance measured 414, 215, and 200 ms on localhost. The real instructionResolve action through /fs returned HTTP 200, ok true, and serverAvailable true in 444 ms, exercising the repaired authenticated device-to-server instruction bridge. A mistakenly attempted /command instructionResolve request correctly returned unknown_command_action; /fs is the correct route.

Production journal sample starting 19:53:30 UTC contained zero JSON parsing errors, zero undefined-payload witnesses, and zero invalid HTTP-status errors. This is a bounded post-activation sample, not an indefinite stability guarantee.

Validation: all 34 connection-vessel tests passed, including the real proxy -> child router -> safe sender contract. Five HTTP-wrapper/router tests passed locally; the two control response tests also passed on production. The wrapper tests use a fixture handler, not a live user OAuth session.

Remaining verification: this session has no exposed Awtsmoos Shliach MCP tool. External Meta Muse and ChatGPT Shliach clients must issue fresh authenticated calls to confirm their own end-to-end path. User OAuth credentials were neither borrowed nor minted. The real Mac runner and device-to-server instruction bridge were tested directly.
