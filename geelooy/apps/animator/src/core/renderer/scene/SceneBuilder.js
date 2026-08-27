
/* B"H */
import { NodeFactory as N } from '../../../engine/graph/NodeFactory.js';
import { EnvironmentBuilders } from './EnvironmentBuilders.js';

/**
 * @class SceneBuilder
 * @description
 * THE ARCHITECT OF THE BACKGROUND.
 * Constructs the declarative JSON nodes for the Earth and Firmament.
 * Provides a massive, infinite backdrop so the void (Black Canvas) is never exposed,
 * no matter how far the camera strays.
 */
export class SceneBuilder {
  static build(sceneData, width, height, time, camera) {
    const camX = camera.x || 0;
    const camY = camera.y || 0;
    const zoom = camera.zoom || 1;
    const cx = width / 2;
    const cy = height / 2;

    const timeOfDay = sceneData?.timeOfDay || 0.5;

    // The Infinite Sky and Earth (Absolute bounds to prevent black canvas)
    const skyFill = timeOfDay < 0.3 ? '#87CEEB' : (timeOfDay < 0.6 ? '#e67e22' : '#000428');
    const sky = N.rect('infinite_sky', -50000, -50000, 100000, 100000, { fill: skyFill });
    
    // Stars
    let stars = null;
    if (timeOfDay >= 0.6) {
       // Night time, generate stars
       const starNodes = [];
       // Procedural star generation
       for (let i = 0; i < 200; i++) {
           const sx = (Math.random() - 0.5) * cx * 4;
           const sy = (Math.random() - 1.0) * cy * 2;
           const r = Math.random() * 1.5 + 0.5;
           const opan = Math.random() * 0.5 + 0.1;
           starNodes.push(N.circle(`star_${i}`, sx, sy, r, { fill: `rgba(255,255,255,${opan})` }));
       }
       stars = N.group('stars_layer', { x: cx - camX * 0.05 * zoom, y: cy - camY * 0.05 * zoom, scaleX: zoom, scaleY: zoom }, starNodes);
    }
    
    // The Ground horizon shifts slightly with the camera but is massively tall
    const groundY = cy - (camY * zoom);
    const ground = N.rect('infinite_earth', -50000, groundY, 100000, 100000, { fill: '#2e412e' });

    // Parallax Groups
    const mountains = N.group('mountains', { x: cx - camX * 0.2 * zoom, y: cy - camY * 0.2 * zoom, scaleX: zoom, scaleY: zoom }, 
      (sceneData?.mountains || []).map(m => m.type ? EnvironmentBuilders[m.type](m) : EnvironmentBuilders.mountain(m))
    );

    const cloudsInfo = sceneData?.clouds || { count: 8, speed: 0.05, coverage: 0.5 };
    const cloudNodes = [];
    for (let c = 0; c < cloudsInfo.count; c++) {
        // Procedural cloud generation that drifts based on time and index
        const baseX = ((c * 400) + (time * cloudsInfo.speed)) % (width * 3) - width;
        const cy_cloud = -200 + ((c % 3) * 50);
        cloudNodes.push(
            N.group(`cloud_${c}`, { x: baseX, y: cy_cloud, scaleX: 1.5, scaleY: 1.2, opacity: cloudsInfo.coverage }, [
                N.circle('c1', -40, 10, 30, { fill: '#fff' }),
                N.circle('c2', 0, -10, 45, { fill: '#fff' }),
                N.circle('c3', 40, 15, 25, { fill: '#fff' }),
                N.circle('c4', 20, 20, 25, { fill: '#fff' }),
                N.circle('c5', -20, 25, 20, { fill: '#fff' })
            ])
        );
    }
    const clouds = N.group('clouds', { x: cx - camX * 0.1 * zoom, y: cy - camY * 0.1 * zoom, scaleX: zoom, scaleY: zoom }, cloudNodes);

    const buildings = N.group('buildings', { x: cx - camX * 0.7 * zoom, y: cy - camY * 0.7 * zoom, scaleX: zoom, scaleY: zoom }, 
      (sceneData?.buildings || []).map(b => b.type ? EnvironmentBuilders[b.type](b) : EnvironmentBuilders.building(b))
    );

    const foliage = N.group('foliage', { x: cx - camX * zoom, y: cy - camY * zoom, scaleX: zoom, scaleY: zoom }, 
      (sceneData?.foliage || []).map(f => {
         // Trees, bushes
         return f.type ? EnvironmentBuilders[f.type](f) : EnvironmentBuilders.tree(f);
      })
    );

    const props = N.group('props', { x: cx - camX * zoom, y: cy - camY * zoom, scaleX: zoom, scaleY: zoom }, 
      (sceneData?.props || []).map(p => {
         if (p.type && EnvironmentBuilders[p.type]) {
            return EnvironmentBuilders[p.type](p);
         }
         return EnvironmentBuilders.bench(p); // default fallback
      })
    );

    return N.group('scene_root', null, [
      sky,
      stars,
      EnvironmentBuilders.celestialBody(width, height, timeOfDay),
      clouds,
      ground,
      mountains,
      buildings,
      foliage,
      props
    ].filter(Boolean));
  }
}
