/** B"H — touch buttons are small crowns for action. */
export function touchButtons(doc,state){ doc.querySelectorAll('[data-act]').forEach(btn=>{const a=btn.dataset.act; const on=e=>{e.preventDefault();state[a]=true;}; const off=e=>{e.preventDefault();state[a]=false;}; btn.addEventListener('pointerdown',on); btn.addEventListener('pointerup',off); btn.addEventListener('pointercancel',off);}); }
