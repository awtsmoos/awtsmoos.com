// B"H
import { safeTitle } from './window/title.js';
import { isPhoneWindow } from './window/mobile.js';
import { ensureWindowStyles } from './window/styles.js';
import { makeBody, makeHeader } from './window/frame.js';
export default class ResizableWindow {
  constructor({ title='Window', content='', handler, hideTitleBar=false, isFullscreen=false, programId=null } = {}) { this.title=safeTitle(title); this.content=content; this.handler=handler; this.hideTitleBar=hideTitleBar; this.programId=programId || this.title; this.id=`win-${Date.now()}-${Math.random().toString(36).slice(2)}`; this.createWindow(); if (isFullscreen || isPhoneWindow()) this.toggleFullscreen(); this.makeActive(); }
  createWindow() { this.win=document.createElement('div'); this.win.className='awts-window window'; this.win.dataset.windowId=this.id; Object.assign(this.win.style,{left:'96px',top:'96px',width:'720px',height:'520px'}); this.win.append(makeHeader(this), makeBody(this)); document.getElementById('desktop')?.appendChild(this.win); this.bindFrame(); ensureWindowStyles(); }
  bindFrame() { this.win.addEventListener('pointerdown',()=>this.makeActive()); this.winHeader?.addEventListener('pointerdown', e => this.startDrag(e)); }
  startDrag(e) { if (e.target.closest('.awtsBtn') || isPhoneWindow()) return; e.preventDefault(); const r=this.win.getBoundingClientRect(), dx=e.clientX-r.left, dy=e.clientY-r.top; const move=ev=>{ this.win.style.left=`${Math.max(0, ev.clientX-dx)}px`; this.win.style.top=`${Math.max(0, ev.clientY-dy)}px`; this.onresize?.(ev); }; const up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up)}; addEventListener('pointermove',move); addEventListener('pointerup',up); }
  toggleFullscreen() { if (!this.fullscreen) { this.old={left:this.win.style.left,top:this.win.style.top,width:this.win.style.width,height:this.win.style.height}; Object.assign(this.win.style,{left:'0',top:'0',width:'100%',height:'100%'}); this.fullscreen=true; } else { Object.assign(this.win.style,this.old || {}); this.fullscreen=false; } this.onresize?.({ type:'resize' }); }
  minimize() { this.lastDimensions={left:this.win.style.left,top:this.win.style.top,width:this.win.style.width,height:this.win.style.height,isFullscreened:this.fullscreen}; this.win.style.display='none'; this.handler?.onminimize?.(this); }
  restore() { this.win.style.display='block'; Object.assign(this.win.style,this.lastDimensions || {}); this.makeActive(); this.handler?.onrestore?.(this); }
  makeActive() { this.active=true; this.handler?.onactive?.(this); this.win.classList.add('active'); this.win.classList.remove('inactive'); }
  makeInactive() { this.active=false; this.win.classList.remove('active'); this.win.classList.add('inactive'); }
  close() { this.programInstance?.onclose?.(); this.win?.remove(); this.handler?.onclose?.(this); }
  addResizeHandles() {} makeDraggable() {}
}
/** B"H: the window class orchestrates; small helpers hold the details. */
