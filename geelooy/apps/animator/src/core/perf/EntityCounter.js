
// B"H
export class EntityCounter {
  static count(state) {
    if (!state) return 0;
    let total = 0;
    
    const chars = state.get('characters') || {};
    total += Object.keys(chars).length; // Baseline per soul

    const scene = state.get('scene') || {};
    if (scene.mountains) total += scene.mountains.length;
    if (scene.buildings) total += scene.buildings.length;
    if (scene.foliage) total += scene.foliage.length;
    if (scene.props) total += scene.props.length;

    // Approximate polygons per entity
    return total * 125; 
  }
}
