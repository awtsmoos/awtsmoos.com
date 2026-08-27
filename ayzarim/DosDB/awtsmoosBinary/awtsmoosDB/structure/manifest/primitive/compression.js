// B"H

/**
 * @file structure/manifest/primitive/compression.js
 * @chapter The Quiet Gate Of Optional Contraction
 * @description
 * Primitive encoders ask this policy before compressing. The answer is
 * data-driven: a database may silence compression, but the default path lets
 * repeated text and binary fold inward only when fewer bytes will be written.
 */

/**
 * @function getDb
 * @description Extracts the database from a primitive encoder context.
 * @param {object} context - Scribe or allocator context.
 * @returns {object|null} Database instance.
 */
function getDb(context) {
  if (!context) return null;
  if (context.db) return context.db;
  if (context.allocator && context.allocator.db) return context.allocator.db;
  return null;
}

/**
 * @function isEnabled
 * @description Resolves whether automatic primitive compression is active.
 * @param {object} context - Scribe or allocator context.
 * @returns {boolean} True when compression may be attempted.
 */
function isEnabled(context) {
  const db = getDb(context);
  const options = (db && db.options) || {};

  if (options.compression === false) return false;
  if (options.autoCompress === false) return false;
  if (options.compress === false) return false;

  return (
    options.compression === true ||
    options.autoCompress === true ||
    options.compress === true
  );
}

module.exports = {
  getDb,
  isEnabled
};
