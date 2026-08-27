B"H

# Gevurah Plan — Small Durable Vessel

The Awtsmoos gives boundary to light; Awtsmoos.com should add persistence without pretending full multi-tenant hosting is done.

Files to touch: ProjectMaterializationStore.js will delegate metadata to a new small metadata store; a new ProjectMaterializationMetadata.js will atomically write/read/remove one owner+project record; ProjectRuntimeManager status will include materialized and materializationRef but never root paths; Drive deployment service will learn server status and cache recovered refs; hosting card status refresh will synchronize materialization. Tests will prove restart recovery, owner scoping, cleanup, and browser-service restoration.

No arbitrary shell, no public route activation, no secret storage, no weakening path validation.
