// B"H
export class InteractionEngine {
  static build(characters = {}, relationships = {}, arc = []) {
    const ids = Object.keys(characters);
    return ids.map(id => ({ id, links: this.links(id, relationships[id] || {}, arc), influence: this.influence(id, ids) }));
  }
  static links(id, relation, arc) {
    return arc.map((beat, index) => ({
      at: beat.at ?? index * 2000,
      source: id,
      target: relation.trusts || relation.mentors || relation.admires || relation.protects || 'storm_lantern',
      signal: beat.emotion === 'fear' ? 'seek_reassurance' : beat.emotion === 'victory' ? 'share_relief' : 'check_status',
      strength: beat.emotion === 'resolve' ? .9 : .55
    }));
  }
  static influence(id, ids) { return ids.filter(other => other !== id).slice(0, 3); }
}
