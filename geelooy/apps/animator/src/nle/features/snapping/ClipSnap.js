
// B"H
export class ClipSnap {
  static findNearestEdge(ms, events, excludeId) {
    let nearest = null;
    let minDiff = Infinity;

    events.forEach(e => {
      if (e.id === excludeId) return; // Don't snap to yourself!
      
      const diffStart = Math.abs(e.start - ms);
      const diffEnd = Math.abs(e.end - ms);

      if (diffStart < minDiff) { minDiff = diffStart; nearest = e.start; }
      if (diffEnd < minDiff) { minDiff = diffEnd; nearest = e.end; }
    });

    return nearest;
  }
}
