
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';
import { IdResolver } from '../../../core/events/IdResolver.js';

/**
 * @file TrackGroupUI.js
 * @description
 * THE ASSEMBLY OF LANES (Ma'arachet HaShevilim).
 * B"H
 * Rectified the structure so the left header and the right lane exist 
 * side-by-side in perfect unison. A broken UI reflects a shattered vessel!
 */

export class TrackGroupUI {
  static render(groupName, tracks) {
    const groupHeader = {
      tag: 'div',
      attr: { className: 'nle-group-header' },
      children: [{ tag: 'span', children: `❖ ${groupName.toUpperCase()}` }]
    };

    const trackRows = Object.keys(tracks || {}).map(trackType => {
      const laneId = IdResolver.getLaneId(groupName, trackType);
      
      return {
        tag: 'div',
        attr: { className: 'nle-track-row' }, // THIS IS THE RECTIFICATION
        children: [
          { 
            tag: 'div', 
            attr: { className: 'nle-sub-header' }, 
            children: [{ tag: 'span', children: trackType }] 
          },
          { 
            tag: 'div', 
            attr: { id: laneId, className: 'nle-track-lane' } 
          }
        ]
      };
    });

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-track-group' },
      children: [groupHeader, ...trackRows]
    });
  }
}
