//B"H
/**
 * @module FullSocialLifecycleAssertions
 * @description Assertion helpers: every API echo is weighed, named, and sealed.
 */
import assert from 'node:assert/strict';

export function okResponse(res, label) {
  assert.equal(res.status, 200, `${label} HTTP status: ${res.text}`);
  assert.ok(!res.json?.error, `${label} should not return error: ${res.text}`);
  return res.json;
}

export function expectError(res, label) {
  assert.equal(res.status, 200, `${label} HTTP status should still be JSON 200: ${res.text}`);
  assert.ok(res.json?.error || res.json?.code || res.json?.no, `${label} expected graceful error: ${res.text}`);
  return res.json;
}

export function arrayish(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.success)) return value.success;
  if (value?.success && typeof value.success === 'object') return Object.values(value.success);
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

export function idFrom(json, ...paths) {
  for (const path of paths) {
    const parts = path.split('.');
    let cur = json;
    for (const part of parts) cur = cur?.[part];
    if (cur) return cur;
  }
  return null;
}

export function containsDeep(value, needle) {
  return JSON.stringify(value || '').includes(needle);
}

export function logGate(name) {
  console.log(`B"H ==== ${name} ====`);
}
