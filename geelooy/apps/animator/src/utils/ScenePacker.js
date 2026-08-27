// B"H
/**
 * @file ScenePacker.js
 * @description
 * THE DIVINE STACKER (Seder HaHishtalshelus).
 * B"H - This utility converts a simple "action list" into a timed "event list".
 * This ensures NO GAPS in the narrative, as everything follows immediately.
 */

export class ScenePacker {
  /**
   * Packs a linear script into timed events.
   * @param {Array} script - List of actions.
   * @param {number} startTime - Offset.
   */
  static pack(script, startTime = 0) {
    let t = startTime;
    const events = [];
    
    // Default Character Positions (The Divine Order)
    const actorPositions = {
      'c1': { x: -350, y: 0 }, // Left side
      'c2': { x: 0, y: 0 },    // Center
      'c3': { x: 350, y: 0 }   // Right side
    };

    // Default Scene Setup (Allowing environment flexibility)
    const firstSceneAction = script.find(i => i.type === 'action' && i.sceneType);
    const env = firstSceneAction?.sceneType || 'park';
    events.push({ type: 'scene_change', start: 0, end: 120000, sceneType: env });

    // Initialize character static positions (Expanded for c1, c2, c3, c4)
    const actorIds = ['c1', 'c2', 'c3', 'c4'];
    actorIds.forEach((id, i) => {
      const p = { x: -800 + i * 400, y: 0 }; 
      events.push({
        type: 'character',
        id,
        start: 0,
        end: 120000,
        pos: { from: p, to: p }
      });
    });

    script.forEach(item => {
      const duration = item.duration || 1500;
      
      if (item.type === 'talk') {
        // Speech Bubble
        events.push({
          type: 'speech',
          id: item.actor,
          start: t,
          end: t + duration,
          speech: item.text
        });

        // Camera Cut (Automatic focus on speaker)
        events.push({
          type: 'camera',
          start: t,
          end: t + duration,
          isCut: true,
          shotType: item.shot || 'closeup',
          target: item.actor
        });

        // Talking Flag
        events.push({
          type: 'character',
          id: item.actor,
          start: t,
          end: t + duration,
          actions: [
            { at: 0, key: 'isTalking', value: true },
            { at: 0, key: 'view', value: item.view || 'front' }
          ]
        });
      } else if (item.type === 'action') {
        events.push({
          type: 'character',
          id: item.actor,
          start: t,
          end: t + duration,
          actions: item.actions || []
        });
      } else if (item.type === 'camera') {
        events.push({
          type: 'camera',
          start: t,
          end: t + duration,
          isCut: true,
          shotType: item.shot || 'midshot',
          target: item.target
        });
      } else if (item.type === 'pause') {
        // Just advance time
      }
      
      t += duration;
    });
    
    // Total duration update
    return { events, duration: t };
  }
}
