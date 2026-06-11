// B"H
/**
 * @module HeichelEditorApp
 * @description
 * Chapter 133: Heichel settings, admins, contributors, and submission policy in
 * one focused mobile form.
 */

const params = new URLSearchParams(location.search);
const heichelId = params.get('heichel') || 'ikar';
const actorAlias = params.get('alias') || 'coby';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  Object.entries(options.attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
  Object.entries(options.on || {}).forEach(([key, value]) => node.addEventListener(key, value));
  children.forEach(child => node.append(child));
  return node;
}

function field(name, label, type = 'text') {
  return el('label', {}, [document.createTextNode(label), el(type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input', { attrs: { name, type } })]);
}

async function request(url, body) {
  const response = await fetch(url, { method: 'POST', body: new URLSearchParams({ actorAlias, ...body }) });
  const json = await response.json();
  if (!json.success) throw new Error(JSON.stringify(json));
  return json.success;
}

function settingsForm() {
  return el('form', { className: 'geelooy-card editor-form', on: { submit: async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await request(`/api/social/heichelos/${heichelId}/settings/full`, data); alert('B"H settings saved'); } catch (e) { alert(e.message); } } } }, [
    field('name', 'Heichel name'), field('description', 'Description', 'textarea'), field('banner', 'Banner asset URL'), field('themePreset', 'Theme preset'), field('submissionPolicy', 'Submission policy'), field('maxImageMB', 'Max image MB', 'number'), field('maxAudioMB', 'Max audio MB', 'number'), el('button', { className: 'gold-btn', text: 'Save Heichel Settings', attrs: { type: 'submit' } })
  ]);
}

function inviteForm() {
  return el('form', { className: 'geelooy-card editor-form', on: { submit: async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await request(`/api/social/heichelos/${heichelId}/invites`, data); alert('B"H invite sent'); } catch (e) { alert(e.message); } } } }, [
    field('toAlias', 'Alias to invite'), field('role', 'Role: admin or contributor'), el('button', { className: 'soft-btn', text: 'Invite', attrs: { type: 'submit' } })
  ]);
}

function submissionForm() {
  return el('form', { className: 'geelooy-card editor-form', on: { submit: async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); data.aliasId = actorAlias; try { await request(`/api/social/heichelos/${heichelId}/submissions/full`, data); alert('B"H submitted'); } catch (e) { alert(e.message); } } } }, [
    field('title', 'Submission title'), field('content', 'Submission content', 'textarea'), field('seriesId', 'Series ID'), el('button', { className: 'gold-btn', text: 'Submit Post For Review', attrs: { type: 'submit' } })
  ]);
}

function render() {
  document.querySelector('#heichel-editor-root').replaceChildren(el('main', { className: 'editor-shell' }, [
    el('section', { className: 'editor-hero', html: `<p>B"H Heichel Governance</p><h1>${heichelId}</h1><p>Actor: @${actorAlias}</p>` }),
    settingsForm(), inviteForm(), submissionForm()
  ]));
}

render();
