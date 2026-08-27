// B"H
/**
 * @file ssh.js
 * @brief SSH settings cards for the Awtsmoos Code settings dialog.
 *
 * Chapter 19: The Awtsmoos split the long settings scroll into smaller
 * vessels. SSH profiles now live here, each profile a little gate into a
 * distant filesystem, purified before it is saved.
 */

export function escapeAttr(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

export function profilesHtml(profiles = []) {
  if (!profiles.length) return '<div class="ssh-empty">No SSH profiles saved yet.</div>';
  return profiles.map(profileHtml).join('');
}

export function profileHtml(profile = {}) {
  const auth = profile.authMethod || 'password';
  const safe = escapeAttr;
  return `<div class="ssh-profile-card" data-id="${safe(profile.id || '')}">
    <div class="settings-grid two">
      <input class="ssh-profile-name" placeholder="Profile name" value="${safe(profile.name || '')}">
      <button class="ssh-profile-remove secondary-btn" type="button">Remove</button>
    </div>
    <div class="settings-grid three">
      <input class="ssh-profile-host" placeholder="Host" value="${safe(profile.host || '')}">
      <input class="ssh-profile-port" type="number" min="1" max="65535" value="${safe(profile.port || 22)}">
      <input class="ssh-profile-user" placeholder="User" value="${safe(profile.user || '')}">
    </div>
    <input class="ssh-profile-path" placeholder="Initial path" value="${safe(profile.initialPath || '/')}">
    <select class="ssh-profile-auth">
      <option value="password" ${auth === 'password' ? 'selected' : ''}>Password</option>
      <option value="privateKey" ${auth !== 'password' ? 'selected' : ''}>Private Key</option>
    </select>
    <input class="ssh-profile-password" type="password" placeholder="Password" value="${safe(profile.password ? atob(profile.password) : '')}">
    <textarea class="ssh-profile-key" rows="5" placeholder="Private key">${safe(profile.privateKey || profile.pem || '')}</textarea>
    <input class="ssh-profile-passphrase" type="password" placeholder="Private key passphrase" value="${safe(profile.passphrase || '')}">
  </div>`;
}

export function bindSshProfileEvents(container) {
  container.querySelectorAll('.ssh-profile-card').forEach(card => bindCard(card));
}

export function collectSshProfiles(container) {
  return Array.from(container.querySelectorAll('.ssh-profile-card')).map(card => collectCard(card)).filter(p => p.host && p.user);
}

export function blankProfile() {
  return { id: `ssh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, port: 22, initialPath: '/', authMethod: 'password' };
}

function bindCard(card) {
  const remove = card.querySelector('.ssh-profile-remove');
  const auth = card.querySelector('.ssh-profile-auth');
  const sync = () => syncAuth(card);
  if (remove) remove.onclick = () => card.remove();
  if (auth) auth.onchange = sync;
  sync();
}

function syncAuth(card) {
  const isKey = card.querySelector('.ssh-profile-auth')?.value !== 'password';
  card.querySelector('.ssh-profile-password').style.display = isKey ? 'none' : '';
  card.querySelector('.ssh-profile-key').style.display = isKey ? '' : 'none';
  card.querySelector('.ssh-profile-passphrase').style.display = isKey ? '' : 'none';
}

function collectCard(card) {
  const authMethod = card.querySelector('.ssh-profile-auth')?.value || 'password';
  const profile = {
    id: card.dataset.id || blankProfile().id,
    name: card.querySelector('.ssh-profile-name')?.value.trim() || '',
    host: card.querySelector('.ssh-profile-host')?.value.trim() || '',
    port: Number(card.querySelector('.ssh-profile-port')?.value || 22),
    user: card.querySelector('.ssh-profile-user')?.value.trim() || '',
    initialPath: card.querySelector('.ssh-profile-path')?.value.trim() || '/',
    authMethod
  };
  if (authMethod === 'password') {
    const password = card.querySelector('.ssh-profile-password')?.value || '';
    if (password) profile.password = btoa(password);
  } else {
    profile.privateKey = card.querySelector('.ssh-profile-key')?.value.trim() || '';
    profile.passphrase = card.querySelector('.ssh-profile-passphrase')?.value || '';
  }
  return profile;
}
