
/* B”H */
import { HouseGenerator } from './urban/house/HouseGenerator.js';

/**
 * @class SceneJSONEngine
 * @description
 * The Ma'aseh Bereishit Engine. Updates routing to the deeply nested HouseGenerator.
 */
export class SceneJSONEngine {
  static parse(sceneDefinition) {
    let entities =[];
    if (!sceneDefinition.elements || !Array.isArray(sceneDefinition.elements)) return entities;
    sceneDefinition.elements.forEach(element => { entities = entities.concat(this.processElement(element)); });
    return entities;
  }

  static processElement(element) {
    let results =[];
    if (element.modifiers && Array.isArray(element.modifiers)) {
      let currentBatch = [this.buildBaseEntity(element)];
      element.modifiers.forEach(mod => {
        if (mod.type === 'array') currentBatch = this.applyArrayModifier(currentBatch, mod);
      });
      results = results.concat(currentBatch);
    } else if (element.type === 'group') {
      element.children.forEach(child => {
        const processedChildren = this.processElement(child).map(c => ({
          ...c, x: (c.x || 0) + (element.x || 0), y: (c.y || 0) + (element.y || 0)
        }));
        results = results.concat(processedChildren);
      });
    } else {
      results.push(this.buildBaseEntity(element));
    }
    return results;
  }

  static buildBaseEntity(element) {
    if (element.type === 'house') return HouseGenerator.generateHouse(element.x, element.y, element.w || 150, element.h || 120, element.color || '#5c4033', 1);
    return { ...element };
  }

  static applyArrayModifier(entities, modifier) {
    const count = modifier.count || 1;
    const offset = modifier.offset || { x: 0, y: 0 };
    const scaled = modifier.scaleStep || 1;
    let multiplied =[];
    for (let i = 0; i < count; i++) {
      entities.forEach(entity => {
        multiplied.push({
          ...entity,
          x: (entity.x || 0) + (offset.x * i),
          y: (entity.y || 0) + (offset.y * i),
          scale: (entity.scale || 1) * Math.pow(scaled, i),
          colors: entity.colors ? { ...entity.colors } : undefined
        });
      });
    }
    return multiplied;
  }
}
