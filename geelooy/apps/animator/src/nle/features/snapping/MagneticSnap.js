
// B"H
export class MagneticSnap {
  static calculate(rawMs, activeSequence, excludeId, pixelsPerSecond) {
    if (!activeSequence || !activeSequence.events) return rawMs;

    let bestSnap = rawMs;
    const msPerPixel = 1000 / pixelsPerSecond;
    let minDistanceMs = 15 * msPerPixel; 

    const gridInterval = 1000;
    const remainder = rawMs % gridInterval;
    const nearestGrid = (remainder < gridInterval / 2) ? rawMs - remainder : rawMs + (gridInterval - remainder);

    if (Math.abs(nearestGrid - rawMs) < minDistanceMs) {
      bestSnap = nearestGrid;
      minDistanceMs = Math.abs(nearestGrid - rawMs);
    }

    activeSequence.events.forEach(e => {
      if (e.id === excludeId) return; 
      
      const diffStart = Math.abs(e.start - rawMs);
      const diffEnd = Math.abs(e.end - rawMs);

      if (diffStart < minDistanceMs) { minDistanceMs = diffStart; bestSnap = e.start; }
      if (diffEnd < minDistanceMs) { minDistanceMs = diffEnd; bestSnap = e.end; }
    });

    return bestSnap;
  }
}
