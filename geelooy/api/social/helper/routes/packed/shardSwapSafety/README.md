#B"H
# Shard Swap Safety

## Why this directory exists

On 2026-10-20 a garbage-collected copy of
`social.heichel.ikar.series.fs.awtsdb` (rebuilt free list) was swapped
into the live directory and the service was restarted to activate it.
The service *started* — but the series API hung forever, because the
gc'd shard wedged the read path. The site was down until the pre-swap
backup was restored by hand.

**Rule: no shard file is ever replaced until a candidate copy has
passed the canary check in this directory.** A shard that "opens
cleanly" is not enough — it must *serve reads*.

## The protocol (every step, in order)

1. **Backup the live shard** into `/root/shard-backups/` with a
   timestamped name (e.g. `social.heichel.ikar.series.fs.awtsdb.pre-swap-YYYYMMDD-HHMM`).
2. **Produce the candidate** as a *new file* next to the live one —
   never modify the live file in place.
3. **Canary the candidate:**
   ```sh
   cd geelooy/api/social/helper/routes/packed/shardSwapSafety
   timeout 60 node canaryCheck.js /path/to/candidate.awtsdb /probe/virtual/path
   ```
   It must print `CANARY_PASS`. A timeout or `CANARY_FAIL` = the
   candidate is rejected, full stop. Do not debug it into production.
4. **Swap:** stop the service, move the candidate over the live path,
   start the service.
5. **Verify live reads:** `curl -m 10 http://127.0.0.1:8080/api/social/heichelos/ikar/series`
   must return JSON in seconds, and the public API must answer 200.
6. **Rollback is one command** if step 5 fails: stop the service,
   restore the step-1 backup over the live path, start the service.

## Files

- `canaryCheck.js` — copies the candidate to a scratch file, opens it
  with the exact production options (`openHeichelFsDb` options), lists
  the virtual-FS root, and cats a probe record. Prints progress
  markers to stderr so a *hang* (the exact 2026-10-20 failure mode)
  is localized instead of silent.
