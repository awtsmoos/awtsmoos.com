/**
 * B"H
 * Tiny assertion vessels for Emerald world tests.
 */
export function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

export function count(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return 0;
}

export function bucketKeys(value) {
  return value && typeof value === 'object' ? Object.keys(value) : [];
}

export async function runTest(name, fn) {
  const started = Date.now();
  try {
    const details = await fn();
    return { name, ok: true, durationMs: Date.now() - started, details };
  } catch (error) {
    return {
      name,
      ok: false,
      durationMs: Date.now() - started,
      error: error.message,
      details: error.details || {}
    };
  }
}
