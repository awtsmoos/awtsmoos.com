B"H
Boruch Hashem
Blessed is He

# Trace a Database Change Safely

Persistence changes should be treated as compatibility work, not ordinary refactors.

## Investigation path

1. Open `/docs/?view=systems&systemDistrict=data` and select the closest persistence system.
2. Read its human manuals before generated evidence.
3. Identify the runtime database root and whether the caller uses legacy DosDB, AwtsmoosBinaryJSON, AwtsmoosDB/VirtualFs, Social packed storage, or a bridge/fallback.
4. Trace logical persisted paths separately from physical serialization/filesystem layout.
5. Find existing migration/repair scripts and relevant tests.
6. Determine how existing persisted data is discovered after the proposed change.
7. Only then change code and add migration/backward-compatibility behavior when required.

## Questions that must be answered

- Can old data still be read?
- Does the same logical path resolve to the same data?
- Does the database root precedence change?
- Are cache/index/shard manifests compatible?
- Is rollback possible without data loss?
- Are partially migrated states supported or explicitly rejected?

Generated file/path evidence helps locate the implementation but does not prove these guarantees.
