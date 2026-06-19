// B"H
import { AppCore } from './core/app/AppCore.js';
import { AppUI } from './core/app/AppUI.js';
import { CameraControls } from './core/app/CameraControls.js';
import { RenderLoop } from './core/renderer/pipeline/RenderLoop.js';
import { DiegeticEditor } from './engine/reality/interaction/DiegeticEditor.js';
import { RuachInterface } from './engine/reality/breath/RuachInterface.js';
import { ToastManager } from './core/ui/toast/ToastManager.js';
import { TooltipManager } from './ui/components/tooltip/TooltipManager.js';
import { DefaultSceneInstaller } from './core/app/DefaultSceneInstaller.js';
import { AutoPlayCovenant } from './core/playback/AutoPlayCovenant.js';
import { CanvasSizeGuardian } from './rectification/CanvasSizeGuardian.js';
import { MobileViewportGuardian } from './rectification/MobileViewportGuardian.js';
import { DebugSystem } from './debug/DebugSystem.js';
import { SelectionBridge } from './interaction/SelectionBridge.js';
import { NLESystem } from './nle/NLESystem.js';

/** Boot with runtime proof: stale preserved scenes are purged unless legacy=1. */
async function boot() {
  MobileViewportGuardian.bind();
  const legacy = new URLSearchParams(location.search).get('legacy') === '1';
  if (!legacy) {
    localStorage.removeItem('aw_preserve_scene');
    localStorage.setItem('aw_real_character_scene', 'real-characters-restored-v2');
  }

  const app = new AppCore();
  AppUI.setup(app);
  app.initContext('character-canvas');
  if (!app.ctx?.canvas || !app.ctx?.ctx) return console.error('B"H - Canvas context failed.');

  CanvasSizeGuardian.bind(app.ctx.canvas, app.ctx);
  DebugSystem.install(app);
  CameraControls.setup(app);
  DiegeticEditor.bind(app.ctx.canvas, app.state);
  SelectionBridge.bind(app);
  ToastManager.init();
  TooltipManager.init();

  const sequence = DefaultSceneInstaller.install(app, { force: !legacy, legacy });
  app.director.play(sequence, 0);
  AutoPlayCovenant.resume(app);
  NLESystem.install(app);

  const awakenRuach = () => {
    RuachInterface.awaken(app.state);
    app.ctx.canvas.removeEventListener('pointerdown', awakenRuach);
  };
  app.ctx.canvas.addEventListener('pointerdown', awakenRuach, { once: true, passive: true });

  RenderLoop.start(app);
  window.__AWTSMOOS_PARK_APP__ = app;
  console.log('B"H - [main] Runtime proof boot complete.', app.state.get('scene'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
