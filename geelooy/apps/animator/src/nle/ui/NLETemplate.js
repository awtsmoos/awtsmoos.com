// B"H

/**
 * @file NLETemplate.js
 * @description
 * Chapter Sixteen: The playhead became a red thread of time.
 *
 * The editor is a small Mishkan for created moments. It now opens collapsed on
 * narrow glass, expands by will, mirrors the director clock, and draws a thin
 * playhead so the viewer can see time moving instead of guessing from chaos.
 *
 * @module NLETemplate
 */

/**
 * @class NLETemplate
 * @description JSON specs for the NLE UI.
 */
export class NLETemplate {
  /** @param {Object} state @returns {Object} HTML spec. */
  static shell(state) {
    const mode = state.mode || 'compact';
    return {
      tag: 'section',
      attrs: { className: 'aw-nle-shell aw-nle-mode-' + mode },
      children: [
        this.toolbar(state),
        mode === 'collapsed' ? this.collapsedBody(state) : this.editorBody(state)
      ]
    };
  }

  /** @param {Object} state @returns {Object} Toolbar spec. */
  static toolbar(state) {
    return {
      tag: 'div',
      attrs: { className: 'aw-nle-toolbar' },
      children: [
        { tag: 'button', attrs: { className: 'aw-nle-btn' }, on: { click: 'togglePlay' }, text: '▶ Play' },
        { tag: 'button', attrs: { className: 'aw-nle-btn' }, on: { click: 'addActionClip' }, text: '+ Action' },
        { tag: 'button', attrs: { className: 'aw-nle-btn' }, on: { click: 'addDialogueClip' }, text: '+ Dialogue' },
        { tag: 'button', attrs: { className: 'aw-nle-btn' }, on: { click: 'addCameraClip' }, text: '+ Camera' },
        { tag: 'button', attrs: { className: 'aw-nle-btn aw-nle-hide-btn' }, on: { click: 'cycleMode' }, text: state.mode === 'expanded' ? 'Hide' : 'Time' },
        { tag: 'div', attrs: { className: 'aw-nle-time' }, text: 'Time ' + Math.round(state.playhead || 0) + 'ms' }
      ]
    };
  }

  /** @param {Object} state @returns {Object} Collapsed body spec. */
  static collapsedBody(state = {}) {
    const shot = state.currentShot || 'stage';
    const speaker = state.currentSpeaker || 'none';
    return {
      tag: 'div',
      attrs: { className: 'aw-nle-collapsed-body' },
      children: [
        { tag: 'strong', text: shot + ' • ' + speaker },
        { tag: 'span', text: 'captions on screen' }
      ]
    };
  }


  /** @param {Object} state @returns {Object} Track list spec. */
  static trackList(state) {
    return {
      tag: 'div',
      attrs: { className: 'aw-nle-tracks' },
      children: (state.tracks || []).map(track => ({
        tag: 'div',
        attrs: { className: 'aw-nle-track-name' },
        dataset: { trackId: track.id },
        text: track.name
      }))
    };
  }

  /** @param {Object} state @returns {Object} Clip area spec. */
  static clipArea(state) {
    return {
      tag: 'div',
      attrs: { className: 'aw-nle-clips' },
      on: { pointerdown: 'scrubTimeline' },
      children: [
        this.playhead(state),
        ...(state.tracks || []).map(track => ({
          tag: 'div',
          attrs: { className: 'aw-nle-lane' },
          dataset: { trackId: track.id },
          children: (state.clips || []).filter(c => c.trackId === track.id).map(c => this.clip(c, state))
        }))
      ]
    };
  }

  /** @param {Object} state @returns {Object} Playhead spec. */
  static playhead(state) {
    return {
      tag: 'div',
      attrs: { className: 'aw-nle-playhead' },
      style: { left: String((state.playhead || 0) * 0.06 * (state.zoom || 1)) + 'px' }
    };
  }

  /** @param {Object} clip @param {Object} state @returns {Object} Clip spec. */
  static clip(clip, state) {
    const selected = state.selectedClipId === clip.id ? ' selected' : '';
    return {
      tag: 'button',
      attrs: { className: 'aw-nle-clip' + selected },
      dataset: { clipId: clip.id },
      style: {
        left: String((clip.start || 0) * 0.06 * (state.zoom || 1)) + 'px',
        width: String(Math.max(48, (clip.duration || 1000) * 0.06 * (state.zoom || 1))) + 'px'
      },
      on: { click: 'selectClip' },
      text: clip.name || 'Clip'
    };
  }

  /** @param {Object} state @returns {Object} Inspector spec. */
  static inspector(state) {
    return {
      tag: 'aside',
      attrs: { className: 'aw-nle-inspector' },
      children: [
        { tag: 'h3', text: 'Inspector' },
        { tag: 'div', attrs: { className: 'aw-nle-field' }, text: 'Entity: ' + (state.selectedEntityId || 'none') },
        { tag: 'div', attrs: { className: 'aw-nle-field' }, text: 'Clip: ' + (state.selectedClipId || 'none') },
        { tag: 'div', attrs: { className: 'aw-nle-field' }, text: 'Mode: ' + (state.mode || 'compact') },
        { tag: 'div', attrs: { className: 'aw-nle-field' }, text: 'Tracks: ' + (state.tracks || []).length },
        { tag: 'div', attrs: { className: 'aw-nle-field' }, text: 'Clips: ' + (state.clips || []).length }
      ]
    };
  }
}
