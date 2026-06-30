// B"H
/** @module MailComposerView — semantic mode gates and keyboard-visible tools. */
import { handleInput, handleSend, handleMagneticMove, handleMagneticLeave, switchMode, toggleSubject, initComposerListeners, toggleFullscreen, toggleMinimize, toggleEnterSend } from './actions.js';
import { composerState } from './state.js';

export function renderComposerView(ui, parent) {
  initComposerListeners();
  ui.html({ parent, tag:'div', shaym:'composerArea', classList:['composer-area'], children:[{ tag:'div', classList:['composer-box'], children:[topBar(ui), content(ui)] }] });
}
function activateMode(event, ui) {
  document.querySelectorAll('.mode-tab').forEach(tab => tab.setAttribute('aria-pressed', String(tab === event.currentTarget)));
  switchMode(event, ui);
}
function topBar(ui) {
  return { tag:'div', classList:['flex','space-between','align-center'], style:'background:rgba(255,255,255,.02);padding-right:10px;border-bottom:1px solid rgba(255,255,255,.05);', events:{ click:event => restoreIfMinimized(event, ui) }, children:[
    { tag:'div', classList:['composer-tabs'], attributes:{ role:'group','aria-label':'Composer mode' }, children:[modeTab('VISUAL','visual',true,ui), modeTab('MARKDOWN','markdown',false,ui), modeTab('HTML','html',false,ui)] },
    { tag:'div', classList:['flex','gap-2'], children:[
      icon('ENTER: ↵','Enter sends toggle','btnEnterSend', event => toggleEnterSend(event), 'font-size:.7rem;width:auto;padding:0 6px;border:1px solid #333;margin-right:8px;'),
      icon('🏷️','Toggle subject','', () => toggleSubject(ui)),
      icon('⛶','Maximize composer','', () => toggleFullscreen(ui)),
      icon('_','Minimize composer','', event => { event.stopPropagation(); toggleMinimize(ui); })
    ]}
  ]};
}
function modeTab(label, mode, active, ui) {
  return { tag:'button', classList:['mode-tab', active ? 'active' : null].filter(Boolean), dataset:{ mode }, attributes:{ type:'button','aria-pressed':String(active) }, textContent:label, events:{ click:event => activateMode(event, ui) } };
}
function icon(text, label, shaym, click, style = '') {
  return { tag:'button', shaym, classList:['icon-btn','win-ctrl'], attributes:{ type:'button','aria-label':label }, title:label, style, textContent:text, events:{ click } };
}
function restoreIfMinimized(event, ui) {
  const area = ui.getHtml('composerArea');
  if (area?.classList.contains('minimized') && event.target.tagName !== 'BUTTON') toggleMinimize(ui);
}
function content(ui) {
  return { tag:'div', shaym:'composerContent', classList:['composer-content'], children:[visualToolbar(), subjectLine(), inputArea(ui), actionBar(ui)] };
}
function visualToolbar() {
  return { tag:'div', shaym:'visualToolbar', classList:['visual-toolbar'], attributes:{ 'aria-label':'Visual formatting toolbar' }, children:[tool('B','Bold','bold','font-weight:bold'), tool('I','Italic','italic','font-style:italic'), heading('H1','Header 1','<h1>'), heading('H2','Header 2','<h2>')] };
}
function tool(label, title, command, style = '') {
  return { tag:'button', attributes:{ type:'button','aria-label':title }, title, textContent:label, style, events:{ click:() => document.execCommand(command) } };
}
function heading(label, title, value) {
  return { tag:'button', attributes:{ type:'button','aria-label':title }, title, textContent:label, events:{ click:() => document.execCommand('formatBlock', false, value) } };
}
function subjectLine() {
  return { tag:'div', shaym:'subjectWrapper', classList:['subject-wrapper','hidden'], children:[{ tag:'input', shaym:'chatSubject', classList:['subject-input'], attributes:{ 'aria-label':'Transmission subject' }, placeholder:'New Subject Protocol...' }] };
}
function inputArea(ui) { return { tag:'div', classList:['input-wrapper'], children:[visualEditor(ui), codeEditor(ui)] }; }
function sendOnKey(event, ui) {
  if (event.key !== 'Enter') return;
  if (composerState.enterToSend && !event.shiftKey) { event.preventDefault(); handleSend(ui); }
  if (!composerState.enterToSend && event.ctrlKey) { event.preventDefault(); handleSend(ui); }
}
function visualEditor(ui) {
  return { tag:'div', shaym:'visualEditor', classList:['message-input','visual-editor'], contentEditable:true, attributes:{ role:'textbox','aria-multiline':'true','aria-label':'Write the transmission' }, events:{ input:handleInput, keydown:event => sendOnKey(event, ui) } };
}
function codeEditor(ui) {
  return { tag:'textarea', shaym:'codeEditor', classList:['message-input','source-editor','hidden'], attributes:{ 'aria-label':'Source transmission editor' }, events:{ input:handleInput, keydown:event => { if (event.key === 'Enter' && event.ctrlKey) { event.preventDefault(); handleSend(ui); } } } };
}
function actionBar(ui) {
  return { tag:'div', classList:['composer-action-row'], style:'padding:8px;display:flex;justify-content:flex-end;border-top:1px solid rgba(255,255,255,.05);', children:[{ tag:'button', classList:['send-btn'], attributes:{ type:'button','aria-label':'Send transmission' }, textContent:'➤', events:{ click:() => handleSend(ui), mousemove:handleMagneticMove, mouseleave:handleMagneticLeave } }] };
}
