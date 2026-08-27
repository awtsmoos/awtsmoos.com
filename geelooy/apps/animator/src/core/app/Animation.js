
/* B"H */
import { SceneRenderer } from '../renderer/scene/Manager.js';
import { CharacterRenderer } from '../renderer/character/Manager.js';
import { PropManager } from '../../world/entities/PropManager.js';
import { PostProcessor } from '../renderer/effects/PostProcessor.js';
import { CameraShake } from '../camera/Shake.js';
import { HUDManager } from '../../ui/components/hud/HUDManager.js';

/**
 * @class Animation
 * @description
 * THE WHEEL OF TIME (Gilgul HaZman).
 * Separates the eternal breath of the Awtsmoos (Real Time) from the decreed actions 
 * of the script (Director Time).
 */
export class Animation {
  static loop(app, timestamp) {
    const realTime = timestamp || performance.now();
    
    if (app.director) app.director.update();
    HUDManager.update(app.state);

    const characters = app.state.get('characters') || {};
    const props = app.state.get('props') || [];
    const scene = app.state.get('scene');
    const isWalkingGlobal = app.state.get('isWalking');
    const isTalkingGlobal = app.state.get('isTalking');
    
    const directorTime = app.director ? app.director.getElapsed() : 0;
    const isPlaying = app.director ? app.director.isPlaying : false;

    app.ctx.clear();
    
    let shakeIntensity = 0;
    if (scene && scene.shakeIntensity) shakeIntensity = scene.shakeIntensity;
    Object.values(characters).forEach(c => {
       if (c.action === 'hate' || c.isTalking) shakeIntensity += 1.5;
       if (c.action === 'scream') shakeIntensity += 4.5;
       if (c.morphParams && c.morphParams.mouthGrimace > 0.5) shakeIntensity += 1.0;
    });

    const shake = CameraShake.getOffset(shakeIntensity, realTime);

    SceneRenderer.render(app.ctx.ctx, scene, app.ctx.width, app.ctx.height, realTime, app.ctx.camera, app.state);

    app.ctx.ctx.save();
    
    const cam = app.ctx.camera;
    const zoom = cam.zoom * (shake.scale || 1.0);
    const centerX = app.ctx.width / 2;
    const centerY = app.ctx.height / 2;

    app.ctx.ctx.translate(centerX + shake.x, centerY + shake.y);
    app.ctx.ctx.scale(zoom, zoom);
    if (shake.r) {
       app.ctx.ctx.rotate(shake.r);
    }
    app.ctx.ctx.translate(-cam.x, -cam.y);

    CharacterRenderer.render(app.ctx.ctx, characters, isWalkingGlobal, isTalkingGlobal, realTime, directorTime, isPlaying, app.state, app.character);
    
    PropManager.render(app.ctx.ctx, props, characters);

    app.ctx.ctx.restore();
    
    PostProcessor.apply(app.ctx.ctx, app.ctx.width, app.ctx.height, scene.timeOfDay);

    requestAnimationFrame((t) => this.loop(app, t));
  }
}
