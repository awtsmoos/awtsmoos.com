// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Retires archive-based server source publication.
 * @description The Awtsmoos keeps unpublished local source on its local vessel;
 * Awtsmoos.com accepts server production only from the exact published `main` Git witness.
 */
const error = new Error("server_source_snapshot_retired_use_published_main");
error.code = "SERVER_SOURCE_SNAPSHOT_RETIRED";
throw error;
