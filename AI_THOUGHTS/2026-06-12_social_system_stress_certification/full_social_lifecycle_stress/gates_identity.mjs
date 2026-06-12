//B"H
/**
 * @module IdentityHeichelSeriesGates
 * @description Keys become faces, faces build palaces, palaces unfold corridors.
 */
import assert from 'node:assert/strict';
import { request } from './server.mjs';
import { okResponse, expectError, arrayish, idFrom, containsDeep, logGate } from './assertions.mjs';

export async function runIdentityGates(ctx) {
  logGate('1 API key and bad auth');
  const verifyA = okResponse(await request(`/api/social/keys/verify?apiKey=${encodeURIComponent(ctx.apiKey)}`), 'verify A');
  assert.equal(verifyA.success?.userId, ctx.userId);
  expectError(await request('/api/social/aliases', { method: 'POST', body: { aliasName: 'No key', inputId: `${ctx.aliasA}_bad` } }), 'missing api key alias create');
  expectError(await request('/api/social/keys/verify?apiKey=not_real_key'), 'invalid api key verify');

  logGate('2 alias lifecycle');
  okResponse(await request('/api/social/aliases', { method: 'POST', apiKey: ctx.apiKey, body: { aliasName: `${ctx.runId} Alias A`, inputId: ctx.aliasA, description: 'Lifecycle alias A' } }), 'alias A create');
  okResponse(await request('/api/social/aliases', { method: 'POST', apiKey: ctx.apiKeyB, body: { aliasName: `${ctx.runId} Alias B`, inputId: ctx.aliasB, description: 'Lifecycle alias B' } }), 'alias B create');
  okResponse(await request(`/api/social/aliases/${encodeURIComponent(ctx.aliasA)}/ownership`, { apiKey: ctx.apiKey }), 'alias plural ownership');
  okResponse(await request(`/api/social/alias/${encodeURIComponent(ctx.aliasA)}/ownership`, { apiKey: ctx.apiKey }), 'alias singular ownership');
  const aliasList = okResponse(await request('/api/social/aliases', { apiKey: ctx.apiKey }), 'alias list');
  assert.ok(containsDeep(aliasList, ctx.aliasA), 'alias list should include alias A');
  okResponse(await request(`/api/social/alias/${encodeURIComponent(ctx.aliasA)}`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasName: `${ctx.runId} Alias A edited`, description: 'edited alias' } }), 'alias edit');

  logGate('3 heichel lifecycle');
  const heichel = okResponse(await request(`/api/social/alias/${encodeURIComponent(ctx.aliasA)}/heichelos`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, inputId: ctx.heichelId, name: `${ctx.runId} Heichel`, description: 'API-created full lifecycle heichel' } }), 'heichel create');
  assert.equal(idFrom(heichel, 'success.details.heichelId'), ctx.heichelId, 'heichel id should match requested id');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}`, { apiKey: ctx.apiKey }), 'heichel read');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, newName: `${ctx.runId} Heichel edited`, description: 'edited heichel' } }), 'heichel edit');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/editors`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, editorAliasId: ctx.aliasB } }), 'add editor');
  const editors = okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/editors`, { apiKey: ctx.apiKey }), 'editors read');
  assert.ok(arrayish(editors).includes(ctx.aliasB), 'editor list should include alias B');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/settings/submissions`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, requireApproval: 'no' } }), 'submission settings write');

  logGate('4 series lifecycle');
  for (const series of [ctx.seriesA, ctx.seriesB, ctx.seriesDelete]) {
    okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/addNewSeries`, { method: 'POST', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, inputId: series, seriesName: `${series} name`, parentSeriesId: 'root', description: 'stress series' } }), `series create ${series}`);
  }
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/series/`, { apiKey: ctx.apiKey }), 'root series list');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/series/${encodeURIComponent(ctx.seriesA)}/editSeriesDetails`, { method: 'PUT', apiKey: ctx.apiKey, body: { aliasId: ctx.aliasA, name: `${ctx.seriesA} edited`, description: 'edited series' } }), 'series edit');
  okResponse(await request(`/api/social/heichelos/${encodeURIComponent(ctx.heichelId)}/series/${encodeURIComponent(ctx.seriesA)}/breadcrumb`, { apiKey: ctx.apiKey }), 'series breadcrumb');
}
