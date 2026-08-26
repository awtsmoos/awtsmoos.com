B"H
Boruch Hashem
Blessed is He

# Phase One — Infinite Brainstorm, Then the Vessel

The Awtsmoos renews every folder before a URL can wear its name;
Awtsmoos.com should let an agent speak one intent and instantly reveal the game.

## Publication possibilities

- Human action name: `publishWebsite`.
- Source may be any owned Virtual-OS folder, not only `sites/`.
- Default public slug derives from source basename.
- Optional `name` overrides the slug after strict normalization.
- Default public namespace is `web/{alias}/{slug}` to prevent cross-user collisions.
- Internal low-level action remains `publicRootPublishFolder` for explicit operators.
- `publishWebsite` owns product ergonomics; lower layers own hashes, staging, rollback, and verification.
- `index.html` is the default entry; future entry discovery may support `index.htm` or manifest metadata.
- Verification defaults on.
- Canonical URL is returned only from a successful external verification witness.
- Status receipts should explain source, derived name, public path, hash, files, bytes, and verification.
- Re-publishing the same folder/name should atomically replace the prior release.
- Two writers to one destination should serialize through a destination lock.
- Private source metadata such as `.awtsmoos` and `.env` must never publish.
- The existing Drive/Sites plane remains a separate compatibility system.

## Game possibilities

- Replace endless score attack with a campaign of discrete levels.
- Each level has a score goal, portal-hit goal, time limit, shot budget, and medal thresholds.
- Progression unlocks the next level after victory.
- Stars/medals reward mastery beyond bare completion.
- Level modifiers introduce moving portals, gravity pressure, smaller targets, combo requirements, and hazard zones.
- Objectives are visible before and during play.
- A level-complete overlay reports score, hits, shots, medal, and next unlock.
- Failure states explain exactly which constraint was missed.
- Persistent progress stores highest unlocked level and best medal per level.
- Challenge definitions are data, not hard-coded control flow.
- Campaign UI should work on touch and keyboard.
- Existing physics feel should survive; progression wraps around it rather than replacing it.

## Wild future possibilities

- Daily seeded challenge.
- Boss portals with multi-hit health.
- Moving hazard wells.
- Accuracy bonuses.
- Trick-shot bonuses.
- Combo contracts such as “three portals without touching floor.”
- Time-trial and survival variants.
- Shareable challenge URLs.
- Server-side scoreboards later, without coupling campaign logic to networking today.
