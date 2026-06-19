/* B”H */
import { SceneJSONEditor } from '../../../panels/json/SceneEditor.js';
import { DEFAULT_SCENE } from '../../../../../data/scenes/default/index.js';

export class DirectorPanel {
  constructor(app) { this.app = app; }
  render() {
    return `
      <div class="director-panel" style="padding: 1rem; background: var(--bg-secondary); border-radius: 20px; border: 1px solid var(--border-color); display: flex; flex-direction: column; height: 100%;">
        <h3 style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 1.5rem; text-align: center;">CINEMATIC_DIRECTOR</h3>
        <div class="sequence-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
          <button class="seq-btn btn btn-primary" data-seq="intro">🎬 PLAY_DETAILED_DEFAULT_SCENE</button>
        </div>
        <div id="json-editor-mount" style="flex: 1; border-top: 1px solid var(--border-color); padding-top: 1rem;"></div>
        <button id="stop-sequence-btn" class="btn btn-sm" style="width: 100%; margin-top: 1.5rem; opacity: 0.5;">ABORT_ALL</button>
      </div>
    `;
  }
  attach(container) {
    const jsonEditor = new SceneJSONEditor(this.app.state, this.app);
    jsonEditor.mount(container.querySelector('#json-editor-mount'));
    container.querySelectorAll('.seq-btn').forEach(btn => btn.addEventListener('click', () => this.play(btn.dataset.seq)));
    container.querySelector('#stop-sequence-btn').addEventListener('click', () => { this.app.director.isPlaying = false; });
  }
  play(seqType) {
    if (seqType !== 'intro') return;
    this.app.state.set('activeSequence', DEFAULT_SCENE);
    this.app.director.play(DEFAULT_SCENE);
    if (this.app.timeline) this.app.timeline.refreshTracks();
  }
}
