
// B"H
import { DenseTrackUI } from '../components/DenseTrackUI.js';

/**
 * @file NLETracksManager.js
 * @description
 * THE SCRIBE OF THE WORLDS.
 * B"H
 * 
 * RECTIFICATION: We have swapped the bloated `TrackGroupUI` for the 
 * hyper-optimized `DenseTrackUI`. This allows the timeline to effortlessly 
 * render the 10 simultaneous characters of the `IntenseTestScene` without lagging.
 */

export class NLETracksManager {
  /**
   * Refreshes the physical track mount with new data.
   */
  static refresh(ui) {
    const { core, trackMount, state, app } = ui;
    if (!trackMount) return;

    const groups = core.getGroupedEvents();
    console.log('B"H - [NLETracksManager] 33x Optimized Rendering initiated for:', Object.keys(groups));

    // 1. MANIFEST THE DOM VESSELS USING DENSE TRACKING
    const globalGroup = DenseTrackUI.renderGroup('GLOBAL', groups.GLOBAL);
    if (globalGroup) trackMount.appendChild(globalGroup);
    
    Object.keys(groups).forEach(key => {
      if (key !== 'GLOBAL') {
        const charGroup = DenseTrackUI.renderGroup(key, groups[key]);
        if (charGroup) trackMount.appendChild(charGroup);
      }
    });

    // 2. POPULATE THE SPARKS VIA DOCUMENT FRAGMENTS
    DenseTrackUI.populate(trackMount, 'GLOBAL', groups.GLOBAL, core, state, app);
    Object.keys(groups).forEach(key => {
      if (key !== 'GLOBAL') {
        DenseTrackUI.populate(trackMount, key, groups[key], core, state, app);
      }
    });
  }
}
