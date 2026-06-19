// B"H

/**
 * The oracle gives numbers to shame the void. Empty wall and empty floor are no
 * longer invisible sins; they become measured pressure toward better framing.
 */
export class FrameQualityOracle {
  static score(plan = {}, camera = {}) {
    const zoom = Number(camera.zoom || 1);
    const mobile = Boolean(plan.mobile);
    const shotVariety = plan.beat && plan.beat !== 'plain' ? 22 : 0;
    const subjectScale = Math.min(34, zoom * (mobile ? 18 : 14));
    const storyAnchor = plan.staging?.tableAnchor ? 18 : 0;
    const roomDensity = plan.room?.density === 'production' ? 16 : 4;
    const penalty = zoom < 1 && mobile ? 18 : 0;
    const score = Math.round(subjectScale + shotVariety + storyAnchor + roomDensity - penalty);
    return { score: Math.max(0, Math.min(100, score)), target: plan.qualityTarget || 70 };
  }
}
