// B\"H
/** Encounter budget keeps cars, animals, shops, and Klipah from stampeding. */
export function allocateSnakePathEncounters(segments, { maxPerSegment = 3 } = {}) {
  return segments.map(segment => ({
    segmentId: segment.id,
    cars: segment.index % 3 === 0 ? 1 : 0,
    animals: Math.min(maxPerSegment, 1 + (segment.index % 2)),
    shops: segment.index % 5 === 0 ? 1 : 0,
    danger: Math.min(maxPerSegment, Math.floor(segment.index / 3))
  }));
}
