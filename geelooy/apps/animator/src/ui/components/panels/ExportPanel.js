// B"H
import { Component } from '../../../core/ui/Component.js';
import { RealityExporter } from '../../../engine/reality/export/RealityExporter.js';
import { FoleySynth } from '../../../nle/audio/FoleySynth.js';

/**
 * @class ExportPanel
 * @description Provides capture controls for exporting the active canvas.
 */
export class ExportPanel extends Component {
  constructor(state, app) {
    super(state);
    this.app = app;
    this.isRecording = false;
    this.status = '';
  }

  render() {
    return {
      tag: 'div',
      attr: { className: 'export-panel' },
      children: [
        { tag: 'h3', attr: { className: 'export-panel-title' }, children: 'SEAL ETERNITY (EXPORT MP4/WEBM)' },
        { tag: 'p', attr: { className: 'export-panel-copy' }, children: this.status || 'Captures the active canvas emanation directly to your physical hard drive.' },
        {
          tag: 'button',
          attr: {
            id: 'btn-export-toggle',
            className: `btn export-panel-button ${this.isRecording ? 'btn-warn' : 'btn-primary'}`
          },
          children: this.isRecording ? '⏹ STOP & SAVE VIDEO' : '⏺ BEGIN RENDER CAPTURE',
          events: { click: () => this.toggleRecording() }
        }
      ]
    };
  }

  toggleRecording() {
    const canvas = document.getElementById('character-canvas');

    if (this.isRecording) {
      const result = RealityExporter.endHarvest();
      this.status = result.ok ? 'Recording sealed. Preparing download vessel.' : result.error;
      this.isRecording = false;
      this.app.director.stop();
      this.state.set('isPlaying', false);
      return this.refresh();
    }

    if (!canvas) {
      this.status = 'Canvas not found. Cannot export the void.';
      return this.refresh();
    }

    const seq = this.state.get('activeSequence');
    this.app.director.play(seq, 0);
    this.state.set('isPlaying', true);

    const result = RealityExporter.beginHarvest(canvas, FoleySynth.ctx);
    if (!result.ok) {
      this.status = result.error;
      this.app.director.stop();
      this.state.set('isPlaying', false);
      return this.refresh();
    }

    this.status = 'Recording the active canvas...';
    this.isRecording = true;
    setTimeout(() => {
      if (this.isRecording) this.toggleRecording();
    }, (seq ? (seq.duration || 10000) : 10000) + 500);

    return this.refresh();
  }

  refresh() {
    const mount = document.getElementById('export-panel-mount');
    if (mount) this.update(mount);
  }
}
