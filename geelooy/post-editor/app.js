// B"H
/**
 * @module PostEditorApp
 * @description
 * Chapter 132: A complete structured editor shell for post root assets, verses,
 * subsections, draft save, and publish.
 */

const state = {
  aliasId: new URLSearchParams(location.search).get('alias') || 'coby',
  heichelId: new URLSearchParams(location.search).get('heichel') || 'ikar',
  seriesId: new URLSearchParams(location.search).get('series') || 'root',
  verses: []
};

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
  Object.entries(options.on || {}).forEach(([k, v]) => node.addEventListener(k, v));
  children.forEach(child => node.append(child));
  return node;
}

function input(name, label, type = 'text') {
  return el('label', {}, [document.createTextNode(label), el(type === 'textarea' ? 'textarea' : 'input', { attrs: { name, type } })]);
}

function verseCard(verse, index) {
  return el('article', { className: 'verse-card' }, [
    el('strong', { text: `Verse ${index + 1}` }),
    input(`verse_${index}_label`, 'Label'),
    input(`verse_${index}_text`, 'Text', 'textarea'),
    el('div', { className: 'upload-zone', text: 'Attach image/audio at this verse via asset IDs after upload.' }),
    el('button', { className: 'soft-btn', text: '+ Subsection', attrs: { type: 'button' }, on: { click: () => { verse.subsections.push({}); render(); } } }),
    ...verse.subsections.map((sub, subIndex) => subsectionCard(index, subIndex))
  ]);
}

function subsectionCard(verseIndex, subIndex) {
  return el('article', { className: 'subsection-card' }, [
    el('strong', { text: `Subsection ${subIndex + 1}` }),
    input(`verse_${verseIndex}_sub_${subIndex}_title`, 'Title'),
    input(`verse_${verseIndex}_sub_${subIndex}_text`, 'Text', 'textarea'),
    el('div', { className: 'upload-zone', text: 'Attach image/audio to this subsection.' })
  ]);
}

function collect(form) {
  const data = new FormData(form);
  const verses = state.verses.map((verse, index) => ({
    id: `verse_${index + 1}`,
    label: data.get(`verse_${index}_label`) || `Verse ${index + 1}`,
    text: data.get(`verse_${index}_text`) || '',
    assets: [],
    subsections: verse.subsections.map((_, subIndex) => ({ id: `sub_${index + 1}_${subIndex + 1}`, title: data.get(`verse_${index}_sub_${subIndex}_title`) || `Subsection ${subIndex + 1}`, text: data.get(`verse_${index}_sub_${subIndex}_text`) || '', assets: [] }))
  }));
  return { aliasId: state.aliasId, author: state.aliasId, heichelId: state.heichelId, seriesId: state.seriesId, title: data.get('title'), description: data.get('description'), verses: JSON.stringify(verses), rootAssets: '[]' };
}

async function saveDraft(form) {
  const body = new URLSearchParams(collect(form));
  const response = await fetch('/api/social/editor/posts/drafts', { method: 'POST', body });
  const json = await response.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  alert('B"H draft saved: ' + json.success.id);
  return json.success;
}

async function publish(form) {
  const draft = await saveDraft(form);
  const body = new URLSearchParams({ aliasId: state.aliasId, draftId: draft.id });
  const response = await fetch('/api/social/editor/posts/drafts/publish', { method: 'POST', body });
  const json = await response.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  alert('B"H published: ' + json.success.post.postId);
}

function render() {
  const root = document.querySelector('#post-editor-root');
  const form = el('form', { className: 'geelooy-card editor-form', on: { submit: event => { event.preventDefault(); saveDraft(event.currentTarget).catch(error => alert(error.message)); } } }, [
    input('title', 'Post title'), input('description', 'Root description', 'textarea'),
    el('div', { className: 'upload-zone', text: 'Root assets: upload images/audio to /api/social/assets/:alias/upload then attach asset IDs.' }),
    el('button', { className: 'soft-btn', text: '+ Verse', attrs: { type: 'button' }, on: { click: () => { state.verses.push({ subsections: [] }); render(); } } }),
    ...state.verses.map(verseCard),
    el('div', { className: 'editor-actions' }, [el('button', { className: 'soft-btn', text: 'Save Draft', attrs: { type: 'submit' } }), el('button', { className: 'gold-btn', text: 'Publish', attrs: { type: 'button' }, on: { click: () => publish(form).catch(error => alert(error.message)) } })])
  ]);
  root.replaceChildren(el('main', { className: 'editor-shell' }, [el('section', { className: 'editor-hero', html: '<p>B"H Structured Editor</p><h1>Post, Verses, Subsections, Assets</h1>' }), form]));
}

state.verses.push({ subsections: [{}] });
render();
