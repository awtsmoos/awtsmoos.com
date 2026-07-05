// B"H
/** @file NpcDialogueProof.js @description Tiny helper preserving dialogue proof shape. */
export function npcDialogueProof(olam) {
  const diag = olam?.__mitzvahNpcDiag || {};
  const lod = olam?.__mitzvahNpcLodDiag || {};
  return {
    ok:Boolean(diag.lastDialogueEvent),
    lastTalkName:diag.lastClickedNpc || lod.lastTalkName || null,
    dialogueOpen:Boolean(diag.lastDialogueEvent),
    source:diag.lastDialoguePayload?.source || null
  };
}

export default npcDialogueProof;
