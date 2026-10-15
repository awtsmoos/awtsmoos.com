// B"H - Alias Profile Logic
// Loads profile data, handles tabs, theme switching

(function() {
  // Get alias from URL: /@rashi or /aliases/rashi
  function getAliasId() {
    const path = window.location.pathname;
    const atMatch = path.match(/\/@([a-zA-Z0-9-_]+)/);
    if (atMatch) return atMatch[1];
    const aliasMatch = path.match(/\/aliases\/([a-zA-Z0-9-_]+)/);
    if (aliasMatch) return aliasMatch[1];
    return 'rashi'; // default
  }
  
  const aliasId = getAliasId();
  
  // Load profile
  async function loadProfile() {
    try {
      const res = await fetch(`/api/social/aliases/${aliasId}`);
      const data = await res.json();
      
      document.getElementById('profile-name').textContent = data.name || aliasId;
      document.getElementById('profile-alias').textContent = '@' + aliasId;
      document.title = `@${aliasId} - Awtsmoos`;
      
      // Avatar - use first letter if no image
      const avatar = document.getElementById('avatar');
      if (data.avatarUrl) {
        avatar.innerHTML = `<img src="${data.avatarUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        avatar.textContent = (data.name || aliasId).charAt(0).toUpperCase();
      }
      
      // Stats
      if (data.birthEnglish) {
        const age = new Date().getFullYear() - parseInt(data.birthEnglish);
        document.getElementById('stat-age').textContent = age;
        document.getElementById('bday-age').textContent = age;
        document.getElementById('birthday-banner').hidden = false;
      }
      
      // Load theme preference
      const savedTheme = localStorage.getItem(`theme-${aliasId}`) || data.theme || 'royal-gold';
      document.body.dataset.theme = savedTheme;
      
      // Load tabs
      loadPosts();
      loadAbout(data);
      loadSettings(data);
      
    } catch (e) {
      console.error('Failed to load profile', e);
      document.getElementById('profile-name').textContent = 'Profile not found';
    }
  }
  
  async function loadPosts() {
    // TODO: Fetch posts by alias
    const el = document.getElementById('tab-posts');
    el.innerHTML = '<div class="post-card"><h3>Loading posts...</h3></div>';
  }
  
  function loadAbout(data) {
    const el = document.getElementById('tab-about');
    el.innerHTML = `
      <div class="post-card">
        <h3>About</h3>
        <p>${data.bio || 'No biography yet.'}</p>
        ${data.locations ? `<p><strong>Locations:</strong> ${data.locations.join(', ')}</p>` : ''}
        ${data.birthEnglish ? `<p><strong>Born:</strong> ${data.birthEnglish} (${data.birthHebrew || ''})</p>` : ''}
      </div>
    `;
  }
  
  function loadSettings(data) {
    const el = document.getElementById('tab-settings');
    el.innerHTML = `
      <div class="post-card">
        <h3>Theme</h3>
        <p>Choose a theme for this profile:</p>
        <div class="theme-picker">
          <div class="theme-option" data-theme="royal-gold" title="Royal Gold"></div>
          <div class="theme-option" data-theme="mystic-blue" title="Mystic Blue"></div>
          <div class="theme-option" data-theme="eternal-fire" title="Eternal Fire"></div>
        </div>
      </div>
      <div class="post-card">
        <h3>Custom Colors</h3>
        <div class="setting-row">
          <span>Accent Color</span>
          <input type="color" id="custom-accent" value="#ffd700">
        </div>
        <div class="setting-row">
          <span>Background</span>
          <input type="color" id="custom-bg" value="#0a0a0f">
        </div>
      </div>
    `;
    
    // Theme picker
    el.querySelectorAll('.theme-option').forEach(opt => {
      if (opt.dataset.theme === document.body.dataset.theme) {
        opt.classList.add('active');
      }
      opt.addEventListener('click', () => {
        document.body.dataset.theme = opt.dataset.theme;
        localStorage.setItem(`theme-${aliasId}`, opt.dataset.theme);
        el.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  }
  
  // Tab switching
  document.querySelectorAll('.profile-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.profile-tabs .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(c => c.hidden = true);
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.hidden = false;
    });
  });
  
  // Init
  loadProfile();
})();
