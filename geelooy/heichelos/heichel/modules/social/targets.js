//B"H
export function normalizeTarget(target = {}) {
  return {
    entityType: target.entityType || 'post',
    entityId: target.entityId || '',
    sectionId: target.sectionId || '',
    paragraphId: target.paragraphId || '',
    sentenceId: target.sentenceId || '',
    audioTimestamp: Number(target.audioTimestamp || 0)
  };
}

export function targetKey(target = {}) {
  const t = normalizeTarget(target);
  return [t.entityType,t.entityId,t.sectionId,t.paragraphId,t.sentenceId,t.audioTimestamp].join(':');
}
