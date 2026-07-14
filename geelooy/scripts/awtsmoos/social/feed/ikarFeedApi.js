// B"H
/** Real feed/post destination API adapter for the one-page Geelooy social room. */
const DEFAULT = { heichelId:'ikar', seriesId:'root' };
export async function fetchIkarPosts({ limit = 16 } = {}) {
  const qs = new URLSearchParams({ properties: JSON.stringify({ title:true, content:true, description:true, aliasId:true, author:true, sections:true, createdAt:true, type:true }) });
  const data = await readJson(`/api/social/heichelos/${enc(DEFAULT.heichelId)}/series/${enc(DEFAULT.seriesId)}/posts/details?${qs}`);
  const raw = data?.success ?? data?.data ?? data ?? [];
  const items = Array.isArray(raw) ? raw : Object.entries(raw || {}).map(([id, value]) => ({ id, ...(value === true ? {} : value) }));
  return items.filter(Boolean).slice(0, limit).map(item => normalizeIkarPost(item));
}
export async function resolvePostingHome({ aliasId, heichelId = '', seriesId = 'root', createHeichelName = '', createSeriesName = '' } = {}) {
  const alias = aliasId || await resolveDefaultAlias();
  const heichel = heichelId || await findDefaultHeichel(alias) || await createHeichel(alias, `${alias.slice(0, 18)}_posts`, createHeichelName || 'My Posts');
  const series = createSeriesName ? await createSeries({ aliasId:alias, heichelId:heichel, seriesName:createSeriesName, parentSeriesId:seriesId || 'root' }) : (seriesId || 'root');
  return { aliasId:alias, heichelId:heichel, seriesId:series };
}
export async function createIkarPostDraft(input = {}) {
  const target = await resolvePostingHome(input);
  const body = new URLSearchParams();
  body.set('aliasId', target.aliasId);
  body.set('actorAlias', target.aliasId);
  body.set('seriesId', target.seriesId);
  body.set('title', input.title || 'Untitled post');
  body.set('content', input.content || '');
  body.set('sections', JSON.stringify(input.sections || []));
  return await readJson(`/api/social/heichelos/${enc(target.heichelId)}/submissions/full`, { method:'POST', body });
}
export async function createHeichel(aliasId, heichelId, name) {
  const body = new URLSearchParams({ aliasId, inputId:heichelId, heichelId, name, heichelName:name, description:'Default posting home', isPublic:'no' });
  const data = await readJson(`/api/social/alias/${enc(aliasId)}/heichelos`, { method:'POST', body });
  return data?.success?.details?.heichelId || heichelId;
}
export async function createSeries({ aliasId, heichelId, seriesName, parentSeriesId = 'root', inputId = '' }) {
  const body = new URLSearchParams({ aliasId, seriesName, title:seriesName, name:seriesName, parentSeriesId, inputId:inputId || safeId(seriesName) });
  const data = await readJson(`/api/social/heichelos/${enc(heichelId)}/series/${enc(parentSeriesId)}`, { method:'POST', body });
  return data?.success?.id || data?.success?.seriesId || body.get('inputId');
}
export async function findDefaultHeichel(aliasId) {
  if (!aliasId) return '';
  const data = await readJson(`/api/social/alias/${enc(aliasId)}/heichelos/details`).catch(() => null);
  const list = Array.isArray(data) ? data : data?.success || data?.details || [];
  const preferred = (Array.isArray(list) ? list : []).find(h => /^(my[_ -]?posts|posts|default)$/i.test(h.id || h.name || h.title || ''));
  return (preferred || list?.[0])?.id || '';
}
export function normalizeIkarPost(item = {}) {
  const id = item.id || item.postId || item._id || item.key || item.title || `ikar-${Date.now()}`;
  const plain = stripHtml(item.content || item.text || item.description || '');
  const sections = normalizeSections(item.sections || item.verses || item.dayuh?.sections, plain);
  const summary = readableSummary(item, sections, plain);
  const authorAlias = item.aliasId || item.author || 'ikar';
  const title = readableTitle(item.title || item.name || '', summary, authorAlias, id, item.type || 'post');
  return { id:String(id), contentId:String(id), postId:String(id), type:item.type || 'post', title, summary, authorAlias, heichelId:item.heichelId || DEFAULT.heichelId, seriesId:item.seriesId || DEFAULT.seriesId, href:`/heichelos/${enc(item.heichelId || DEFAULT.heichelId)}/series/${enc(item.seriesId || DEFAULT.seriesId)}/${enc(id)}`, sections, counts:{ comments:item.commentCount || item.comments?.length || 0, reactions:item.reactionCount || 0 }, raw:{ ...item, source:'ikar-real-api' } };
}
async function resolveDefaultAlias() {
  const local = window.curAlias || window.currentAlias || localStorage.getItem('lastAliasUsed') || localStorage.getItem('awtsmoos-alias') || '';
  if (local) return local;
  const data = await readJson('/api/social/alias/default').catch(() => null);
  return data?.aliasId || data?.id || data?.success?.aliasId || data?.success?.id || 'anonymous';
}
function readableTitle(title, summary, alias, id, type) {
  const cleanTitle = stripHtml(title);
  if (cleanTitle && !looksGenerated(cleanTitle, alias, id)) return cleanTitle;
  const first = sentence(summary);
  return first ? capitalize(first) : `${capitalize(type)} from ${alias}`;
}
function readableSummary(item, sections, plain) {
  return item.description || item.excerpt || plain || sections[0]?.text || 'Open this Ikar post to read more.';
}
function looksGenerated(title, alias, id) {
  const low = title.toLowerCase();
  return low === String(alias).toLowerCase() || low === String(id).toLowerCase() || /^afm[a-z0-9_]{6,}/i.test(title) || /^[a-z0-9_]{12,}$/i.test(title);
}
function sentence(text = '') { return String(text).trim().split(/[\n.?!]/).find(Boolean)?.trim().slice(0, 90) || ''; }
function capitalize(text = '') { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }
function normalizeSections(value, content) {
  const arr = Array.isArray(value) ? value : parseJson(value, []);
  if (arr.length) return arr.map((section, index) => ({ id:section.id || `section-${index + 1}`, label:section.label || section.title || `Verse ${index + 1}`, text:stripHtml(section.text || section.content || section.summary || '') }));
  const chunks = stripHtml(content).split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/).filter(Boolean).slice(0, 4);
  return (chunks.length ? chunks : []).map((text, index) => ({ id:`verse-${index + 1}`, label:`Verse ${index + 1}`, text }));
}
async function readJson(url, options) { const res = await fetch(url, { credentials:'same-origin', ...options }); if (!res.ok) throw new Error(`${res.status} ${url}`); return await res.json(); }
function parseJson(value, fallback) { try { return JSON.parse(value || '[]'); } catch { return fallback; } }
function stripHtml(value = '') { const div = document.createElement('div'); div.innerHTML = String(value); return (div.textContent || div.innerText || String(value)).trim(); }
function safeId(text) { return String(text || 'series').replace(/[^a-zA-Z0-9_$]/g, '_').slice(0, 26) || `series_${Date.now()}`; }
function enc(value) { return encodeURIComponent(String(value)); }
