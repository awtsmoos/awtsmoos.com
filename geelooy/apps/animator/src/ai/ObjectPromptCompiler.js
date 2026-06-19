// B"H
export class ObjectPromptCompiler {
  static compile(text = '') {
    const t = String(text).toLowerCase();
    const id = t.includes('carrot') ? 'carrot' : t.includes('sandwich') ? 'sandwich' : 'apple';
    const action = t.includes('roll') ? 'roll' : t.includes('bite') ? 'bite' : 'hop';
    return { id, type: id, action, lifecycle: action === 'bite' ? 'consumed' : 'introduced' };
  }
}
