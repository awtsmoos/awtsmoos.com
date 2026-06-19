// B"H
export class ExpressionPersonality {
  static bias(profile = 'neutral') {
    return { child: 1.18, bright_child: 1.22, warm_teacher: 0.92, shy: 0.72, bold: 1.28 }[profile] || 1;
  }
}
