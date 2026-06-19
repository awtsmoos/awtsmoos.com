// B"H
export class AttentionRenderBridge {
  static from(data = {}) {
    const target = data.attentionTarget || (data.lookAt ? { id: data.lookAt } : null);
    const dart = data.eyeDart || data.facePose?.eyes || {};
    return { targetId: target?.id || target || data.lookAt || null, pupilOffsetX: Number(dart.x ?? dart.dartX ?? 0), pupilOffsetY: Number(dart.y ?? dart.dartY ?? 0) };
  }
}
