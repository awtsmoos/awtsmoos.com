// B"H
export class CausalBranching {
  static resolve(sequence, time) {
    if (!sequence || !sequence.events) return null;
    const branches = sequence.events.filter(e => e.type === 'branch');
    if (!branches.length) return null;
    return branches.find(b => b.start <= time && (b.start + (b.duration || 1000)) >= time) || null;
  }
}