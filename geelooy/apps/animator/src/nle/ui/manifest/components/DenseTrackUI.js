// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';
import { ClipRenderer } from '../../ClipRenderer.js';
import { IdResolver } from '../../../core/events/IdResolver.js';

/**
 * Compact grouped timeline rows for large NLE manifests.
 */
export class DenseTrackUI {
  static renderGroup(groupName, tracks) {
    const totalEvents = Object.values(tracks).reduce((acc, arr) => acc + arr.length, 0);
    if (totalEvents === 0) return null;

    const groupHeader = {
      tag: 'div',
      attr: { className: 'nle-dense-group-header' },
      children: [
        { tag: 'span', attr: { className: 'nle-dense-group-name' }, children: `▼ ${groupName.toUpperCase()}` },
        { tag: 'span', attr: { className: 'nle-dense-group-count' }, children: `(${totalEvents} SPARKS)` }
      ]
    };

    const trackRows = Object.keys(tracks).map(trackType => {
      const events = tracks[trackType];
      if (events.length === 0) return null;

      const laneId = IdResolver.getLaneId(groupName, trackType);
      return {
        tag: 'div',
        attr: { className: 'nle-dense-track-row' },
        children: [
          { tag: 'div', attr: { className: 'nle-dense-sub-header' }, children: [{ tag: 'span', children: trackType }] },
          { tag: 'div', attr: { id: laneId, className: 'nle-dense-track-lane' } }
        ]
      };
    }).filter(Boolean);

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-dense-track-group' },
      children: [groupHeader, ...trackRows]
    });
  }

  static populate(trackMount, groupName, tracks, core, state, app) {
    Object.keys(tracks).forEach(trackType => {
      const events = tracks[trackType];
      if (events.length === 0) return;

      const laneId = IdResolver.getLaneId(groupName, trackType);
      const lane = trackMount.querySelector(`#${laneId}`);
      if (!lane) return;

      const fragment = document.createDocumentFragment();
      events.forEach(event => {
        const clip = ClipRenderer.render(event, core, trackType);
        clip.addEventListener('click', e => {
          e.stopPropagation();
          trackMount.querySelectorAll('.nle-clip').forEach(c => c.classList.remove('selected'));
          clip.classList.add('selected');
          import('../inspector/InspectorPanel.js').then(({ InspectorPanel }) => {
            InspectorPanel.show(event, document.getElementById('inspector-mount'), state, app);
          });
        });
        fragment.appendChild(clip);
      });
      lane.appendChild(fragment);
    });
  }
}
