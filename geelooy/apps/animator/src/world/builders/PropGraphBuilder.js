
// B"H
import { PropFactory } from '../entities/props/PropFactory.js';

export class PropGraphBuilder {
  static buildAll(props, state, time) {
    if (!props) return [];

    const independentProps = props.filter(p => !p.parentId);

    return independentProps.map(prop => {
      const transform = { 
        x: prop.x || 0, 
        y: prop.y || 0, 
        rotation: prop.rotation || 0, 
        scaleX: prop.scale || 1, 
        scaleY: prop.scale || 1 
      };

      return PropFactory.build(prop, transform, time, null);
    });
  }
}
