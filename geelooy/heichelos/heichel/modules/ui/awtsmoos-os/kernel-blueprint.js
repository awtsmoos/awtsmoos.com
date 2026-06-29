// B"H
/**
 * @module AwtsmoosOsKernelBlueprint
 * @description
 * The first thin vessel of the new frontend civilization: command, dock,
 * object context, and live pulse, all reusable across every future screen.
 */
const DOCK = [
  ['Home', '/', 'home'], ['Universe', '#awtsmoos-os-command', 'universe'],
  ['Heichels', '/heichelos', 'heichels'], ['Objects', '/objects', 'objects'],
  ['People', '/profiles', 'people'], ['Mail', '/email', 'mail'],
  ['Civilization', '#awtsmoos-civilization', 'civilization'], ['Editor', '/heichelos/submit', 'editor']
];

const QUICK = ['Create', 'Graph', 'Search', 'Moderate', 'Migrate', 'Inspect'];

export function osKernel(actions = {}) {
  return { tag: 'section', attr: { class: 'awtsmoos-os-kernel', 'aria-label': 'Awtsmoos Civilization OS' }, children: [
    command(actions), dock(), pulse(), contextRail()
  ] };
}

function command(actions) {
  return { tag: 'div', attr: { id: 'awtsmoos-os-command', class: 'awtsmoos-command-center' }, children: [
    { tag: 'button', attr: { type: 'button', class: 'command-sigil', 'aria-label': 'Open command galaxy' }, children: ['⌘'], events: { click: actions.focusCommand } },
    { tag: 'input', attr: { type: 'search', placeholder: 'Command Awtsmoos: search, create, graph, mail, object, civilization…', 'aria-label': 'Awtsmoos command search' }, ref: 'osCommandInput', events: { input: actions.onOsCommand, focus: actions.openCommand } },
    { tag: 'div', attr: { class: 'command-quick-row' }, children: QUICK.map(label => ({ tag: 'button', attr: { type: 'button', 'data-os-command': label.toLowerCase() }, children: [label], events: { click: () => actions.runOsCommand?.(label.toLowerCase()) } })) },
    { tag: 'div', attr: { class: 'command-palette hidden', role: 'listbox' }, ref: 'osCommandPalette' }
  ] };
}

function dock() {
  return { tag: 'nav', attr: { class: 'awtsmoos-os-dock', 'aria-label': 'Awtsmoos OS dock' }, children: DOCK.map(([label, href, icon]) => ({
    tag: 'a', attr: { href, 'data-os-dock': icon }, children: [{ tag: 'span', children: [iconSymbol(icon)] }, { tag: 'strong', children: [label] }]
  })) };
}

function pulse() {
  return { tag: 'aside', attr: { class: 'awtsmoos-live-pulse', id: 'awtsmoos-civilization' }, children: [
    { tag: 'span', attr: { class: 'pulse-orb' } },
    { tag: 'div', children: [{ tag: 'strong', children: ['Civilization online'] }, { tag: 'small', ref: 'osStatusText', children: ['AwtsmoosDB root listening'] }] }
  ] };
}

function contextRail() {
  return { tag: 'aside', attr: { class: 'awtsmoos-context-rail', 'aria-label': 'Selected object context' }, ref: 'osContextRail', children: [
    { tag: 'p', attr: { class: 'rail-kicker' }, children: ['Object Context'] },
    { tag: 'h2', children: ['Nothing selected'] },
    { tag: 'p', children: ['Click any living object to reveal graph, events, comments, permissions, and storage reality.'] }
  ] };
}

function iconSymbol(icon) {
  return { home: '⌂', universe: '✺', heichels: '⌬', objects: '◇', people: '☉', mail: '✉', civilization: '♢', editor: '✎' }[icon] || '•';
}
