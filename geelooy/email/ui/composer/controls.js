// B"H
/**
 * @module MailComposerControls
 * @description
 * Editor controls are small labeled instruments. The Awtsmoos does not ask the
 * user to guess what a glyph does; each control declares its name and purpose.
 *
 * Responsibilities:
 * - Build mode tabs, window controls, and visual toolbar buttons.
 * - Keep control specs out of the composer view orchestrator.
 * - Emit native buttons with title and aria-label.
 *
 * Safety:
 * - Does not call APIs directly.
 * - Does not mutate global state except browser editing commands when clicked.
 * - Emits native buttons with real attributes.
 */
export function modeTab(label, mode, active, onClick) {
  return {
    tag: 'button',
    classList: ['mode-tab', active ? 'active' : null].filter(Boolean),
    dataset: { mode },
    attributes: { type: 'button', 'aria-pressed': String(active), title: `Switch to ${label} mode` },
    textContent: label,
    events: { click: onClick }
  };
}

export function iconControl(text, label, shaym, click, style = '') {
  return {
    tag: 'button', shaym,
    classList: ['icon-btn', 'win-ctrl'],
    attributes: { type: 'button', 'aria-label': label, title: label },
    title: label, style, textContent: text,
    events: { click }
  };
}

export function visualToolbar() {
  return {
    tag: 'div', shaym: 'visualToolbar', classList: ['visual-toolbar'],
    attributes: { 'aria-label': 'Visual formatting toolbar' },
    children: [
      tool('B', 'Bold', 'bold', 'font-weight:bold'),
      tool('I', 'Italic', 'italic', 'font-style:italic'),
      heading('H1', 'Header 1', '<h1>'),
      heading('H2', 'Header 2', '<h2>')
    ]
  };
}

export function tool(label, title, command, style = '') {
  return { tag: 'button', attributes: { type: 'button', 'aria-label': title }, title, textContent: label, style, events: { click: () => document.execCommand(command) } };
}

export function heading(label, title, value) {
  return { tag: 'button', attributes: { type: 'button', 'aria-label': title }, title, textContent: label, events: { click: () => document.execCommand('formatBlock', false, value) } };
}
