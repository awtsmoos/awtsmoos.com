B"H

# Ordered execution: persistence and lifecycle

Step 1 was inspected narrowly because full git diff can hang on Android storage.
Unrelated game files remain untouched.

Now implementing:
1. Persist sessions/audits to a JSON store.
2. Reload sessions after process restart.
3. Export sessions/audits through action surface.
4. Enforce lifecycle: expired, paused, denied, revoked, and closed sessions reject stream/input/signaling.
5. Add latest-frame action as the watch-only MVP seam.

