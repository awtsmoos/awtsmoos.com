// B"H
import { CartoonProductionModel } from './CartoonProductionModel.js';

/**
 * @file CartoonStudioPanel.js
 * @description
 * The long-form studio panel: twenty-minute runtime, 200 edit beats, continuity,
 * assets, audio, animation passes, fur/cloth, render queue, export, and NLE seed.
 */
export class CartoonStudioPanel {
  static install(app) {
    if (document.getElementById('cartoon-studio')) return;
    (document.getElementById('hud-overlay') || document.body).insertAdjacentHTML('beforeend', this.html());
    const root = document.getElementById('cartoon-studio'); root.__plan = CartoonProductionModel.create(); this.bind(app, root); this.render(root);
  }

  static html() {
    return `<section id="cartoon-studio" class="cartoon-studio" data-state="peek" data-tab="shots"><button class="cartoon-tab" data-studio-toggle>20m Studio</button><div class="cartoon-card"><header><b>Nonstop Episode Foundry</b><span id="runtime-chip"></span></header><textarea id="cartoon-prompt" placeholder="Describe a full original 20+ minute family-satire episode..."></textarea><nav><button data-tab="shots">Shots</button><button data-tab="beats">Beats</button><button data-tab="assets">Assets</button><button data-tab="audio">Audio</button><button data-tab="anim">Anim</button><button data-tab="queue">Queue</button></nav><div class="cartoon-row"><button data-generate-cartoon>Generate</button><button data-seed-nle>NLE</button><button data-export-bible>JSON</button></div><div class="cartoon-meter"><i></i><span id="cartoon-status">Ready for 20+ minutes nonstop</span></div><div id="cartoon-pane"></div></div></section>`;
  }

  static bind(app, root) {
    root.querySelector('[data-studio-toggle]').onclick = () => root.dataset.state = root.dataset.state === 'open' ? 'peek' : 'open';
    root.querySelector('[data-generate-cartoon]').onclick = () => { root.__plan = CartoonProductionModel.create(root.querySelector('#cartoon-prompt').value); this.status(root, 'Generated full production plan'); this.render(root); };
    root.querySelector('[data-seed-nle]').onclick = () => this.seedNLE(app, root.__plan, root);
    root.querySelector('[data-export-bible]').onclick = () => this.export(root.__plan, root);
    root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { root.dataset.tab = b.dataset.tab; this.render(root); });
  }

  static render(root) {
    const p = root.__plan; root.querySelector('#runtime-chip').textContent = `${this.time(p.runtimeMs)} · ${p.beats.length} beats`;
    const views = { shots: this.shots(p), beats: this.beats(p), assets: this.assets(p), audio: this.audio(p), anim: this.anim(p), queue: this.queue(p) };
    root.querySelector('#cartoon-pane').innerHTML = views[root.dataset.tab] || views.shots;
  }

  static shots(p) { return `<ol class="cartoon-shotlist">${p.shots.map((s) => `<li><b>${s.name}</b><em>${this.time(s.start)} → ${this.time(s.start + s.duration)} · ${s.track}</em><small>${s.description}</small></li>`).join('')}</ol>`; }
  static beats(p) { return `<ol class="cartoon-shotlist">${p.beats.slice(0, 80).map((b) => `<li><b>${b.name}</b><em>${this.time(b.start)} · ${b.kind}</em><small>${b.camera}</small></li>`).join('')}<li><b>${p.beats.length - 80} more beats in JSON export</b></li></ol>`; }
  static assets(p) { const m = p.assetsManifest; return `<div class="cartoon-bin">${[...m.characters.map((c) => `${c.name}: ${c.rig}, fur ${c.furCards}`), ...m.backgrounds.map((b) => `${b.name}: ${b.layers} layers`), ...m.props.map((x) => `${x.name}: ${x.states.join('/')}`)].map((a) => `<span>${a}</span>`).join('')}</div>`; }
  static audio(p) { return `<pre class="cartoon-json">${this.escape(JSON.stringify({ voices: p.audio.voices, cues: p.audio.cues.length, foley: p.audio.foley.length, musicBeds: p.audio.musicBeds }, null, 2))}</pre>`; }
  static anim(p) { return `<ol class="cartoon-shotlist">${p.animationPasses.slice(0, 80).map((a) => `<li><b>${a.beatId}</b><em>${a.estimatedFrames} frames</em><small>${a.passes.join(' → ')}</small></li>`).join('')}<li><b>${p.animationPasses.length - 80} more animation passes in JSON export</b></li></ol>`; }
  static queue(p) { return `<pre class="cartoon-json">${this.escape(JSON.stringify({ continuity: p.continuityLedger.length, queue: p.renderQueue, exports: p.exportTargets }, null, 2))}</pre>`; }

  static seedNLE(app, p, root) {
    const store = app?.state?.get?.('nle_store'); if (!store?.set) return this.status(root, 'NLE store not ready yet');
    const track = { Camera: 'track_camera', Dialogue: 'track_dialogue', Action: 'track_action', Effects: 'track_effects' };
    const clips = p.beats.map((b) => ({ id: b.id, trackId: track[b.track] || 'track_action', start: b.start, duration: b.duration, type: 'episode-beat', name: b.name, payload: b }));
    store.set({ clips, duration: p.runtimeMs, selectedClipId: clips[0]?.id || null, mode: 'expanded' });
    this.status(root, `${clips.length} NLE beat clips seeded: ${this.time(p.runtimeMs)}`);
  }

  static export(p, root) { const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'awtsmoos-long-cartoon-production-bible.json' }); a.click(); URL.revokeObjectURL(a.href); this.status(root, 'Full production bible exported'); }
  static status(root, text) { root.querySelector('#cartoon-status').textContent = text; }
  static time(ms) { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  static escape(text) { return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
}
