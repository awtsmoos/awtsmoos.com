// B"H
/** @module MailSocialLayout — navigation anchors now carry real href garments. */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';

const routes = [
  ['/', 'Home', 'Return to Geelooy home'],
  ['/heichelos', 'Heichelos', 'Open sacred spaces'],
  ['/email', 'Messages', 'Open mail chamber'],
  ['/profile', 'Profile', 'Open your profile']
];

function navItem([href, label, aria], current = false) {
  return {
    tag: 'a',
    classList: current ? ['active'] : [],
    attributes: { href, 'aria-label': aria, ...(current ? { 'aria-current': 'page' } : {}) },
    textContent: label
  };
}

function topLinks() {
  return [
    { tag:'a', classList:['mail-top-home'], attributes:{ href:'/' }, textContent:'← Geelooy' },
    { tag:'a', attributes:{ href:'/heichelos' }, textContent:'Heichelos' },
    { tag:'a', attributes:{ href:'/profile' }, textContent:'Profile' }
  ];
}

export function renderAppLayout(ui, root) {
  renderLoginOverlay(ui, root);
  renderComposeModal(ui, root);
  ui.html({ parent:root, tag:'div', shaym:'socialMailShell', classList:['mail-social-shell'], children:[
    { tag:'header', classList:['mail-social-topbar'], children:[
      { tag:'nav', classList:['mail-top-links'], attributes:{ 'aria-label':'Mail route shortcuts' }, children:topLinks() },
      { tag:'div', classList:['mail-title-lockup'], children:[
        { tag:'span', classList:['mail-kicker'], textContent:'Awtsmoos Mail' },
        { tag:'strong', textContent:'Messages / Living Transmissions' }
      ]}
    ]},
    { tag:'div', shaym:'appContainer', classList:['app-container','mail-social-frame'], children:[
      { tag:'aside', classList:['sidebar','mail-social-sidebar'], shaym:'sidebarPanel', ready:el => renderSidebar(ui, el) },
      { tag:'main', classList:['chat-area','mail-social-chat'], shaym:'chatPanel', ready:el => renderChat(ui, el) }
    ]},
    { tag:'nav', classList:['mail-bottom-nav'], attributes:{ 'aria-label':'Primary Geelooy routes' }, children:routes.map(route => navItem(route, route[0] === '/email')) }
  ]});
}
