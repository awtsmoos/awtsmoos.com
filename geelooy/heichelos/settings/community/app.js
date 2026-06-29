//B"H
/**
 * Community settings vessel.
 * Chapter 245: the Awtsmoos sets every communal gate with visible feedback:
 * load, edit, save, and error are no longer silent shadows behind checkboxes.
 */
const form = document.getElementById('settings');
const out = document.getElementById('out');
const statusBox = document.getElementById('status');
const loadButton = document.getElementById('load');
const saveButton = document.getElementById('save');
const fields = ['allowPublicSubmissions','requireModeratorApproval','allowAnonymous','allowGuestViewing','allowQuestions','allowAnswers','allowPosts','allowSeries','allowComments','allowPolls','commentModeration'];
let dirty = false;
function say(text, mode = '') { statusBox.textContent = text; statusBox.dataset.mode = mode; }
function show(value) { out.textContent = JSON.stringify(value, null, 2); }
function setBusy(busy, text) { loadButton.disabled = busy; saveButton.disabled = busy; if (text) say(text, 'loading'); }
async function api(path, options) {
  const res = await fetch(`/api/social${path}`, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error?.message || json.error?.code || res.statusText || 'Request failed');
  return json;
}
function values() {
  const data = new FormData(form);
  const patch = { aliasId: String(data.get('aliasId') || '').trim() };
  for (const field of fields) patch[field] = Boolean(data.get(field));
  return patch;
}
function apply(settings) {
  for (const field of fields) if (form.elements[field]) form.elements[field].checked = Boolean(settings[field]);
  dirty = false;
  show(settings);
  say('Settings loaded. Review the gates, then save if needed.', 'ready');
}
async function load() {
  const id = form.elements.heichelId.value.trim();
  if (!id) return say('Enter a Heichel ID first.', 'error');
  setBusy(true, 'Loading community settings…');
  try {
    const data = await api(`/heichelos/${encodeURIComponent(id)}/settings/community`);
    apply(data.success || data);
  } catch (error) {
    say(`Could not load settings: ${error.message}`, 'error');
  } finally {
    setBusy(false);
  }
}
async function save(event) {
  event.preventDefault();
  const id = form.elements.heichelId.value.trim();
  if (!id) return say('Enter a Heichel ID first.', 'error');
  setBusy(true, 'Saving community settings…');
  try {
    const data = await api(`/heichelos/${encodeURIComponent(id)}/settings/community`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values()) });
    dirty = false;
    show(data.success || data);
    say('Saved. The community gates now match this form.', 'saved');
  } catch (error) {
    say(`Could not save settings: ${error.message}`, 'error');
  } finally {
    setBusy(false);
  }
}
form.addEventListener('input', () => { dirty = true; say('Unsaved changes.', 'dirty'); });
form.addEventListener('submit', save);
loadButton.addEventListener('click', load);
say('Enter a Heichel ID and load settings.', 'ready');
