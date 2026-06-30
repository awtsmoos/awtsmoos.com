//B"H

class APIHandler {
  basePath = '/api/social/';
  constructor(context = null) { this.context = context; this.baseUrl = location.origin + this.basePath; }
  async init(name) { this.dbName = name; }
  getCurrentAlias() { const alias = aliasFrom(this.context || safeWindow()); if (alias) return alias; const error = new Error('Awtsmoos alias is not ready. Sign in or wait for alias sync, then retry.'); error.code = 'awtsmoos_alias_not_ready'; throw error; }
  async handleResponse(response) { const text = await response.text(); let data = {}; try { data = text ? JSON.parse(text) : {}; } catch { data = { raw:text }; } if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || data?.error || `HTTP ${response.status}`); return data; }
  urlFor(aliasId, route) { return new URL(`${this.baseUrl}aliases/${encodeURIComponent(aliasId)}/fileSystem/${route}`); }
  async post(route, params) { const res = await fetch(this.urlFor(this.getCurrentAlias(), route), { method:'POST', body:params }); return await this.handleResponse(res); }
  async rename(oldPath, newPath) { await this.post('moveEntry', new URLSearchParams({ oldPath, newPath })); return true; }
  async move(oldPath, newPath) { return await this.rename(oldPath, newPath); }
  async copy(oldPath, newPath) { await this.post('copyEntry', new URLSearchParams({ oldPath, newPath })); return true; }
  async makeFile(st, key, content = '') { const url = this.urlFor(this.getCurrentAlias(), 'makeFile'); const body = fileBody(st, key, content); const res = await fetch(url, { method:'POST', body }); await this.handleResponse(res); return true; }
  async readFile(storeName, key) { const url = this.urlFor(this.getCurrentAlias(), 'readFile'); url.search = new URLSearchParams({ path:pathJoin(storeName, key) }).toString(); const response = await fetch(url, { method:'GET' }); if (!response.ok) await this.handleResponse(response); const ct = response.headers.get('content-type') || ''; return binaryHint(ct, key) ? await response.blob() : await response.text(); }
  async readFolder(storeName = '') { const url = this.urlFor(this.getCurrentAlias(), 'readFolder'); url.search = new URLSearchParams({ path:storeName }).toString(); const res = await fetch(url, { method:'GET' }); return await this.handleResponse(res); }
  async makeFolder(storeName) { await this.post('makeFolder', new URLSearchParams({ path:storeName })); return true; }
  async renameFolder(storeName, oldKey, newKey) { return await this.rename(pathJoin(storeName, oldKey), pathJoin(storeName, newKey)); }
  async renameFile(storeName, oldKey, newKey) { try { return await this.rename(pathJoin(storeName, oldKey), pathJoin(storeName, newKey)); } catch { const value = await this.readFile(storeName, oldKey); await this.makeFile(storeName, newKey, value); await this.delete(storeName, oldKey); return true; } }
  async deleteFile(storeName, key) { return await this.delete(storeName, key); }
  async getAllKeys(storeName) { return await this.readFolder(storeName); }
  async getAllStoreNames() { return await this.readFolder(''); }
  async delete(storeName, key) { const aliasId = this.getCurrentAlias(); const url = this.urlFor(aliasId, 'delete'); const res = await fetch(url, { method:'DELETE', body:new URLSearchParams({ path:pathJoin(storeName, key) }) }); await this.handleResponse(res); return true; }
  async write(st, key, val, type = null) { if (type === 'directory' || val === null || val === undefined) return await this.makeFolder(pathJoin(st, key)); return await this.makeFile(st, key, val || ''); }
  async read(st, key) { return await this.readFile(st, key); }
  async Koysayv(st, key, val, type = null) { return await this.write(st, key, val, type); }
  async Laynin(st, key) { return await this.read(st, key); }
}

function safeWindow() { try { return window; } catch { return {}; } }
function aliasFrom(context = {}) { const candidates = [context.curAlias, context.currentAlias, context.awtsmoosAlias, context.curAliasId, context.document?.body?.dataset?.aliasId]; for (const item of candidates) { const clean = cleanAlias(item); if (clean) return remember(context, clean); } try { for (const key of ['awtsmoosAlias', 'awtsmoos_social_inbox_alias', 'BH_PROFILE_VIEWER_ALIAS']) { const clean = cleanAlias(context.localStorage?.getItem(key)); if (clean) return remember(context, clean); } } catch {} return ''; }
function remember(context, alias) { try { context.curAlias = alias; context.currentAlias = alias; context.awtsmoosAlias = alias; context.localStorage?.setItem('awtsmoosAlias', alias); } catch {} return alias; }
function cleanAlias(value) { const text = String(value || '').trim().replace(/^@+/, ''); return text && !['null', 'undefined', 'false', '0'].includes(text.toLowerCase()) ? text : ''; }
function pathJoin(a = '', b = '') { return [a, b].join('/').split('/').filter(Boolean).join('/'); }
function binaryHint(contentType = '', key = '') { const low = String(key || '').toLowerCase(); return /image|zip|pdf|octet/.test(contentType) || /\.(zip|png|jpg|jpeg|gif|webp|pdf)$/i.test(low); }
function fileBody(st, key, content) { const binary = typeof Blob !== 'undefined' && (content instanceof Blob || content instanceof ArrayBuffer || content instanceof Uint8Array || content instanceof File); if (!binary) return new URLSearchParams({ path:pathJoin(st, key), content }); const formData = new FormData(); const blob = content instanceof Blob || content instanceof File ? content : new Blob([content]); formData.append('path', pathJoin(st, key)); formData.append('binaryData', blob, key); return formData; }

export default APIHandler;

/** B"H: the filesystem API never calls alert(); alias absence is an error object, not a modal thunderclap. */
