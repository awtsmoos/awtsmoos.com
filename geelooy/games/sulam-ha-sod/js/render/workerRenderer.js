// B"H
/**
 * Chapter 36: a tiny worker learned to pre-chew the sky.
 * Browsers that allow OffscreenCanvas may ask this helper to render static
 * star layers away from the main thread; unsupported vessels simply ignore it.
 */
self.onmessage = event => {
  const {type,width=960,height=540} = event.data || {};
  if(type !== 'primeBackground' || typeof OffscreenCanvas === 'undefined') return;
  const canvas = new OffscreenCanvas(width, height); const c = canvas.getContext('2d');
  c.fillStyle = '#10091f'; c.fillRect(0,0,width,height); c.fillStyle = '#ffffff12';
  for(let i=0;i<90;i++) c.fillRect((i*97)%width,(i*53)%300,2,2);
  const bitmap = canvas.transferToImageBitmap();
  self.postMessage({type:'backgroundReady',bitmap}, [bitmap]);
};
