
/* B”H */
import { AppCore } from './core/app/AppCore.js';
import { SceneInitializer } from './core/app/SceneInitializer.js';
import { AppUI } from './core/app/AppUI.js';
import { Animation } from './core/app/Animation.js';
import { ViewportManager } from './core/renderer/ViewportManager.js';
import { LoadingScreen } from './ui/components/hud/LoadingScreen.js';

/**
 * The Genesis Ritual.
 * We now summon the world in the correct order of emanation.
 */
async function init() {
  const loading = new LoadingScreen();
  document.body.appendChild(loading.element);
  loading.update(10, 'Clearing the Void...');

  try {
    const app = new AppCore();
    SceneInitializer.init(app.state);
    loading.update(30, 'Speaking UI into existence...');
    
    // 1. Create the physical vessels (HTML/DOM)
    AppUI.setup(app);
    
    // 2. Initialize the Viewport monitor with manifest nodes
    loading.update(50, 'Measuring the Dimensions...');
    ViewportManager.init('character-canvas', 'main-stage');
    
    // 3. Initialize Render Context
    app.initContext('character-canvas');
    
    // 4. Set the active history
    const testSeq = {
      duration: 120000, loop: true,
      events: [
        { type: 'camera', start: 0, end: 10000, from: {x:0, y:-200, zoom:0.2}, to: {x:0, y:-100, zoom:0.6} },
        { type: 'character', id: 'main', start: 0, end: 8000, pos: {from:{x:-1200,y:0}, to:{x:-200,y:0}}, actions:[{at:0, key:'isWalking', value:true}] },
        { type: 'speech', id: 'main', start: 8500, end: 15000, speech: "B\"H! EVERYTHING LOADS!" },
        { type: 'character', id: 'friend', start: 5000, end: 15000, pos: {from:{x:1200,y:0}, to:{x:300,y:0}}, actions:[{at:0, key:'isWalking', value:true}, {at:0, key:'flipX', value:true}] }
      ]
    };
    app.state.set('activeSequence', testSeq);
    app.director.play(testSeq);
    
    // Refresh NLE to show clips
    if (app.timeline) app.timeline.refresh();

    loading.update(90, 'Starting the Cycle...');
    Animation.loop(app);
    
    loading.update(100, 'Creation Refreshed.');
    setTimeout(() => loading.remove(), 800);
    
    console.log('B"H: Universe manifest.');
  } catch (error) {
    console.error('The universe collapsed:', error);
    loading.update(0, 'Creation Error: ' + error.message);
  }
}

window.addEventListener('DOMContentLoaded', init);
