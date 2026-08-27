
/* B”H */
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';

/**
 * @class TrackGroupUI
 * @description
 * THE HOUSES OF GATHERING (Batei Knessiot).
 * Generates the nested structure for Character and Global event tracks.
 * By validating `tracksObj`, we protect the emanation from undefined errors 
 * that previously shattered the vessels (TypeError: Cannot convert undefined...).
 */
export class TrackGroupUI {
  static render(groupName, tracksObj) {
    // Ultimate safeguard against the Void
    const safeObj = (typeof tracksObj === 'object' && tracksObj !== null) ? tracksObj : {};
    const cleanId = String(groupName).replace(/[^a-zA-Z0-9]/g, '-');
    
    const subTracks = Object.keys(safeObj).map(trackName => ({
      tag: 'div',
      attr: { className: 'nle-sub-track' },
      children: [
        { tag: 'div', attr: { className: 'nle-sub-header' }, children: trackName },
        { tag: 'div', attr: { className: 'nle-track-lane', id: `lane-${cleanId}-${trackName}` } }
      ]
    }));

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-track-group' },
      children: [
        {
          tag: 'div',
          attr: { className: 'nle-group-header' },
          children: [
            { tag: 'span', attr: { className: 'group-icon' }, children: '❖' },
            ` ${groupName}`
          ]
        },
        {
          tag: 'div',
          attr: { className: 'nle-group-body' },
          children: subTracks
        }
      ]
    });
  }
}
