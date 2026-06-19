// B"H
import { World } from '../../world/model/World.js';
import { District } from '../../world/model/District.js';
import { Asset } from '../../world/model/Asset.js';
import { SceneDocument } from '../../world/model/SceneDocument.js';
import { DocumentRegistry } from '../../document/DocumentRegistry.js';
import { Timeline } from '../../animation/core/Timeline.js';
import { Track } from '../../animation/core/Track.js';
import { Keyframe } from '../../animation/core/Keyframe.js';
import { ShotPlanner } from '../../camera/production/ShotPlanner.js';

export class HealthyLunchScene {
  static build() {
    const kitchen = new District({ id: 'kitchen_district', children: [
      new Asset({ id: 'wall', assetId: 'wall' }), new Asset({ id: 'window', assetId: 'window' }),
      new Asset({ id: 'shelf', assetId: 'shelf' }), new Asset({ id: 'table', assetId: 'table' }),
      new Asset({ id: 'plate', assetId: 'plate', x: 345, y: 625 }),
      new Asset({ id: 'apple', assetId: 'apple', x: 286, y: 582 }),
      new Asset({ id: 'carrot', assetId: 'carrot', x: 365, y: 592 }),
      new Asset({ id: 'sandwich', assetId: 'sandwich', x: 440, y: 592 }),
      new Asset({ id: 'kid_marker', assetId: 'human', x: 210, y: 690, props: { color: '#2f7ed8' } }),
      new Asset({ id: 'guide_marker', assetId: 'human', x: 540, y: 690, props: { color: '#35a36f' } })
    ]});
    const timeline = new Timeline({ duration: 12000, tracks: [new Track('camera', [new Keyframe(0, ShotPlanner.plan('establish')), new Keyframe(3000, ShotPlanner.plan('table'))])] });
    return DocumentRegistry.set('healthy_lunch_authored_v1', new SceneDocument({ id: 'healthy_lunch_authored_v1', title: 'Healthy Lunch Authored Scene', world: new World({ id: 'healthy_lunch_world', districts: [kitchen] }), camera: ShotPlanner.plan('establish'), timeline }));
  }
}
export const HEALTHY_LUNCH_AUTHORED_SCENE = HealthyLunchScene.build();
