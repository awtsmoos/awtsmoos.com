// B"H
/**
 * @module MailModalFields
 * @description
 * Modal fields are small vessels: they preserve drafts, name failures, and close
 * without stealing the user's path through the mail chamber.
 *
 * Responsibilities:
 * - Build labeled compose fields.
 * - Read and reset compose values.
 * - Expose modal open/close helpers with Escape support.
 *
 * Safety:
 * - Does not call APIs directly.
 * - Mutates only provided modal/input elements.
 * - Emits labeled fields and keeps errors in role="alert" containers.
 */
export function field(label, tag, shaym, placeholder, extra = []) {
  return { tag: 'div', classList: ['input-group'], children: [
    { tag: 'label', classList: ['input-label'], attributes: { for: shaym }, textContent: label },
    { tag, shaym, classList: ['styled-input', ...extra], attributes: { id: shaym }, placeholder }
  ]};
}

export function composeValues(ui) {
  return {
    to: ui.getHtml('newTo')?.value.trim() || '',
    subject: ui.getHtml('newSub')?.value || '',
    body: ui.getHtml('newBody')?.value || ''
  };
}

export function setComposeError(ui, message = '') {
  const box = ui.getHtml('composeError');
  if (!box) return;
  box.textContent = message;
  box.classList.toggle('hidden', !message);
}

export function resetCompose(ui) {
  ['newTo', 'newSub', 'newBody'].forEach(name => {
    const el = ui.getHtml(name);
    if (el) el.value = '';
  });
  setComposeError(ui, '');
}

export function openModal(ui, shaym) {
  const modal = ui.getHtml(shaym);
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('visible'), 10);
}

export function closeModal(ui, shaym) {
  const modal = ui.getHtml(shaym);
  if (!modal) return;
  modal.classList.remove('visible');
  setTimeout(() => modal.classList.add('hidden'), 180);
}

export function bindModalEscape(ui, shaym) {
  const modal = ui.getHtml(shaym);
  if (!modal || modal.dataset.escapeBound === 'true') return;
  modal.dataset.escapeBound = 'true';
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal(ui, shaym);
  });
}
