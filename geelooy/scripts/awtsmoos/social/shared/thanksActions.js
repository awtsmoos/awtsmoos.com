// B"H
/** Contract-safe thanks shell: no unconfirmed endpoint is called. */
export function thanksFallback({href='',label='Thanks'}={}){const box=document.createElement('div');box.className='inline-thanks-shell';box.innerHTML=`<button class="g-social-button" type="button" aria-pressed="false" disabled>${label}</button><p class="g-social-status" aria-live="polite">Thanks/reaction API is not confirmed here, so no hidden request was sent.</p>`;if(href){const a=document.createElement('a');a.className='g-social-button';a.href=href;a.textContent='Open full post';box.append(a);}return box;}
export function bindThanksFallbacks(root=document){root.querySelectorAll('[data-thanks-action]').forEach(node=>node.replaceWith(thanksFallback({href:node.dataset.fallbackHref||''})));}
