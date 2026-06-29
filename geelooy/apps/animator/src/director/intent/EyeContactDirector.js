// B"H
export class EyeContactDirector {
  static build(relationships = {}, arc = []) {
    const ids = Object.keys(relationships);
    return Object.fromEntries(ids.map(id => [id, this.timeline(id, relationships[id], arc)]));
  }
  static timeline(id, relation = {}, arc = []) {
    const base = relation.primary || relation.trusts || relation.admires || 'storm_lantern';
    return arc.flatMap((beat, i) => {
      const at = beat.at ?? i * 2000;
      return [
        { at, target: beat.object || 'storm_lantern', action: 'checkObject' },
        { at: at + 420, target: beat.look || base, action: 'seekConnection' },
        { at: at + 920, target: id === 'goat_sidekick' ? 'wrong_cord' : 'puddleGlow', action: 'microDart' }
      ];
    });
  }
}
