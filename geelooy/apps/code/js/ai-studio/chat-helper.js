// B"H
/**
 * @file chat-helper.js
 * @brief Pure helpers for autofill, scroll behavior, and chat agent UX.
 */

export function shouldAutoScroll(box, threshold = 96) {
  if (!box) return true;
  const remaining = Number(box.scrollHeight || 0) - Number(box.scrollTop || 0) - Number(box.clientHeight || 0);
  return remaining <= threshold;
}

export function scrollToBottom(box) {
  if (!box) return false;
  box.scrollTop = box.scrollHeight || 0;
  return true;
}

export function buildAutofillPrompt(context = {}) {
  const name = context.filename || 'this file';
  const symbol = context.ast?.nearestSymbol ? ` near ${context.ast.nearestSymbol}` : '';
  const selected = context.selectedText ? ' Use my current selection.' : '';
  return `Review ${name}${symbol}, use available tools when helpful, and suggest the safest next code improvement.${selected}`;
}

export function appendChatText(existing = '', role = 'assistant', text = '') {
  const header = role === 'user' ? 'You' : 'Awtsmoos AI';
  const body = String(text || '').trim();
  return [String(existing || '').trim(), `### ${header}\n${body}`].filter(Boolean).join('\n\n');
}

export function toolAccessSummary(manifest = []) {
  const counts = manifest.reduce((acc, tool) => {
    const key = tool.capability || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return `Tools: ${counts['virtual-compatible'] || 0} virtual, ${counts['live-tunnel-preferred'] || 0} live-preferred, ${counts['requires-live-tunnel'] || 0} live-only.`;
}
