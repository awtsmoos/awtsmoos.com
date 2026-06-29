// B"H
import { aliasDisplay, cleanAlias, createAlias, ensureDefaultAlias, getAliases, isValidAlias, setDefaultAlias } from './aliasIdentity.js';

export default function createProfileDropdown(parentElement) {
  const container = document.createElement('div');
  container.className = 'awtsmoosDrop';
  parentElement.replaceChildren(container);
  container.innerHTML = html();
  addStyles();
  const els = refs(container);
  bindAuthForms(els);
  bindMenus(els);
  hydrateIdentity(els);
}

function html() {
  return `<div id="notLoggedIn" class="notLoggedIn hidden"><div class="btn dropt" id="signinButton">Local OS Ready · Sign In / Reconnect <span class="arrow">▼</span></div><div id="signinDropdown" class="hidden dropdown-content"><div class="local-mode-note">IndexedDB files keep working here. Sign in only to sync, publish, and use alias URLs.</div><div id="loginForm"><h3>Sign In / Reconnect Account</h3><input id="loginUsername" placeholder="Username"><input type="password" id="loginPassword" placeholder="Password"><button id="loginSubmit">Sign In</button><div class="description"><a href="#" id="toggleRegister">Create one</a> | <a href="/login">Full Login</a></div></div><div id="registerForm" class="hidden"><h3>Create Account</h3><input id="registerUsername" placeholder="Username"><input type="password" id="registerPassword" placeholder="Password"><button id="registerSubmit">Create Account</button><div class="description"><a href="#" id="toggleLogin">Sign In</a> | <a href="/login">Full Login</a></div></div><div id="authMessage" class="validation-message"></div></div></div><div id="loggedIn" class="loggedIn hidden"><div class="btn dropt" id="dropdownProfile"><span class="currentAliasName prim">Local mode</span> <span id="awtsDownIndicator" class="arrow">▼</span></div><div id="awtsmoosProfileDropContent" class="hidden dropdown-content"><div class="welcome"><span id="modeBadge" class="mode-badge">Local</span> <span id="usernameDisplay"></span></div><div class="currentAlias" id="aliasSection">Current alias: <a class="currentAliasName" href="#">Local mode</a></div><div class="local-mode-note" id="localModeNote">Local IndexedDB mode: files work here; reconnect to sync and publish.</div><button class="btn dropt" id="switchAlias">Switch Alias <span id="aliasIndicator" class="arrow">▼</span></button><div id="aliasInfo" class="hidden dropdown-content"></div><hr><a href="/profile">Manage Your Aliases</a><div id="logoutSection"><a href="/logout?redirect=${encodeURIComponent(location.href)}">Logout</a></div></div></div>`;
}

function refs(root) { return Object.fromEntries([...root.querySelectorAll('[id]')].map(el => [el.id, el])); }

function addStyles() {
  if (!document.querySelector('link[href="/style/social/profileStyles.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = '/style/social/profileStyles.css';
    document.head.appendChild(link);
  }
  if (document.querySelector('.awtsmoos-os-login-polish')) return;
  const style = document.createElement('style');
  style.className = 'awtsmoos-os-login-polish';
  style.textContent = `.awtsmoosDrop .btn.dropt{border-radius:999px;background:linear-gradient(135deg,rgba(34,197,94,.95),rgba(14,165,233,.92));box-shadow:0 0 18px rgba(14,165,233,.25);font-weight:700}.awtsmoosDrop .dropdown-content{border-radius:14px;border:1px solid rgba(125,211,252,.35);box-shadow:0 18px 50px rgba(0,0,0,.35);backdrop-filter:blur(14px)}.local-mode-note{margin:8px 0;padding:10px;border-radius:10px;background:rgba(14,165,233,.12);border:1px solid rgba(14,165,233,.25);color:#dff6ff;line-height:1.35}.mode-badge{display:inline-flex;padding:3px 8px;border-radius:999px;background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.45);color:#bbf7d0;font-size:11px;text-transform:uppercase;letter-spacing:.06em}`;
  document.head.appendChild(style);
}

async function hydrateIdentity(els) {
  const identity = await ensureDefaultAlias();
  if (!identity.username && !identity.alias) return showLoggedOut(els);
  showLoggedIn(els, identity);
  window.dispatchEvent(new CustomEvent('awtsmoosLogin', { detail:{ username:identity.username, mode:identity.mode } }));
  if (identity.alias) emitAlias(identity.alias);
}

function showLoggedOut(els) { els.loggedIn.classList.add('hidden'); els.notLoggedIn.classList.remove('hidden'); }
function showLoggedIn(els, identity) { els.notLoggedIn.classList.add('hidden'); els.loggedIn.classList.remove('hidden'); els.usernameDisplay.textContent = identity.username || 'Local IndexedDB'; els.modeBadge.textContent = identity.mode === 'synced' ? 'Synced' : 'Local'; els.localModeNote.classList.toggle('hidden', identity.mode === 'synced'); paintAlias(identity.alias); }
function paintAlias(alias) { const clean = cleanAlias(alias); document.querySelectorAll('.currentAliasName').forEach(el => { el.textContent = aliasDisplay(clean); if (el.tagName === 'A') el.href = clean ? `/@${encodeURIComponent(clean)}` : '#'; }); }

function bindMenus(els) {
  els.signinButton.addEventListener('click', () => toggle(els.signinDropdown));
  els.dropdownProfile.addEventListener('click', () => toggle(els.awtsmoosProfileDropContent));
  els.switchAlias.addEventListener('click', async e => { e.preventDefault(); toggle(els.aliasInfo); if (!els.aliasInfo.classList.contains('hidden')) renderAliases(els.aliasInfo, await getAliases()); });
  els.toggleRegister.addEventListener('click', e => { e.preventDefault(); els.loginForm.classList.add('hidden'); els.registerForm.classList.remove('hidden'); });
  els.toggleLogin.addEventListener('click', e => { e.preventDefault(); els.registerForm.classList.add('hidden'); els.loginForm.classList.remove('hidden'); });
  els.logoutSection.querySelector('a')?.addEventListener('click', () => window.dispatchEvent(new CustomEvent('awtsmoosLogout', { detail:{ source:'profile-dropdown' } })));
  window.addEventListener('awtsmoosAliasChange', e => paintAlias(e.detail?.id));
}

function renderAliases(aliasInfo, aliases) { aliasInfo.replaceChildren(); aliases.forEach(item => addAliasRow(aliasInfo, cleanAlias(item.id || item.aliasId || item), aliases)); const form = aliasForm(); const create = document.createElement('button'); create.className = 'btn dropt'; create.textContent = 'Create New Alias'; create.addEventListener('click', () => toggle(form)); aliasInfo.append(create, form); }
function addAliasRow(aliasInfo, id, aliases) { if (!id) return; const row = document.createElement('button'); row.className = 'aliasId'; row.textContent = aliasDisplay(id); row.addEventListener('click', async () => { await setDefaultAlias(id); emitAlias(id); renderAliases(aliasInfo, aliases); }); aliasInfo.appendChild(row); }

function aliasForm() {
  const form = document.createElement('div');
  form.className = 'hidden dropdown-content alias-form';
  form.innerHTML = '<input id="aliasName" placeholder="Alias Name"><input id="aliasId" placeholder="Alias ID"><textarea id="aliasDescription" placeholder="Description"></textarea><div id="validationMessage" class="validation-message"></div><button id="createAliasSubmit">Create</button>';
  form.querySelector('#createAliasSubmit').addEventListener('click', async () => {
    const name = form.querySelector('#aliasName').value.trim();
    const id = form.querySelector('#aliasId').value.trim();
    const msg = form.querySelector('#validationMessage');
    const made = name ? await createAlias(name, id || name) : '';
    msg.textContent = made ? 'Alias created.' : 'Could not create alias.';
    msg.className = `validation-message ${made ? 'valid' : 'invalid'}`;
    if (made) { await setDefaultAlias(made); emitAlias(made); }
  });
  return form;
}

function bindAuthForms(els) { els.loginSubmit.addEventListener('click', () => auth('/login/', els.loginUsername.value, els.loginPassword.value, els.authMessage)); els.registerSubmit.addEventListener('click', () => auth('/register/', els.registerUsername.value, els.registerPassword.value, els.authMessage, true)); }
async function auth(url, username, password, message, registering = false) { if (!username || !password) return setMessage(message, 'Please enter username and password', false); const resp = await fetch(url, { method:'POST', body:new URLSearchParams({ username, password }), headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, credentials:'include' }).then(r => r.text()); if (resp.includes('success')) { window.dispatchEvent(new CustomEvent('awtsmoosLogin', { detail:{ username, registering } })); return registering ? setMessage(message, 'Account created. Sign in now.', true) : location.reload(); } setMessage(message, registering ? 'Registration failed' : 'Sign in failed. Local IndexedDB mode still works.', false); }
function setMessage(el, text, ok) { el.textContent = text; el.className = `validation-message ${ok ? 'valid' : 'invalid'}`; }
function toggle(el) { el.classList.toggle('hidden'); }
function emitAlias(alias) { if (isValidAlias(alias)) window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail:{ id:cleanAlias(alias) } })); }

/**
 * B"H
 * The profile dropdown announces the covenant: local OS is ready before sign-in,
 * and sign-in is an upgrade into sync, publishing, and alias light.
 */
