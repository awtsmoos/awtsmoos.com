/**
 * B"H
 * @module SaveMigrations
 * @description Tiny future-proof migration gate for save envelopes.
 */
import { SAVE_SCHEMA_VERSION } from './SaveSchema.js';

const normalizeV1 = envelope => ({
  ...envelope,
  schemaVersion: 1,
  data: envelope?.data && typeof envelope.data === 'object' ? envelope.data : {}
});

export const migrateEnvelope = envelope => {
  if (!envelope || typeof envelope !== 'object') return null;
  let current = Number(envelope.schemaVersion || 1);
  let next = current <= 1 ? normalizeV1(envelope) : envelope;
  if (current > SAVE_SCHEMA_VERSION) return null;
  while (current < SAVE_SCHEMA_VERSION) current += 1;
  next.schemaVersion = SAVE_SCHEMA_VERSION;
  return next;
};
