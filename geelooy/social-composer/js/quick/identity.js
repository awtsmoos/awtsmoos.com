// B"H
// Boruch Hashem
// Blessed is He
/** Awtsmoos.com reflects verified identities and keeps uploaded media with the identity that owns it.
 * B"H 2026-11-26 (Revelation fix): the quick composer must never present a
 * dead "Choose an alias" dropdown. Three explicit states, always:
 * signed-out -> a prominent Sign in button (returns here after login);
 * still verifying -> the picker is disabled and says so;
 * verification stalled/failed -> a Retry affordance, never a silent
 * empty list. Signed-in aliases arrive from the verified bootstrap and
 * the account's default/only alias is preselected by the panel. */
export function connectIdentity(root,composer,destination,tell=()=>{}) {
	const select=root.getElementById('alias'),native=document.getElementById('aliasSelect'),login=root.getElementById('login');
	const help=root.getElementById('identityHelp'),notice=document.getElementById('loginNotice');
	login.href='/login/?return='+encodeURIComponent(location.pathname+location.search);
	root.getElementById('identityRetry')?.addEventListener('click',()=>location.reload());
	let lastAlias=null,stallTimer=null;
	function signedOut() {return Boolean(notice && !notice.hidden);}
	function aliasCount() {return Math.max(0,native.options.length-1);}
	function render() {
		const identity=composer.state.snapshot().identity;
		select.replaceChildren(...Array.from(native.options,option=>new Option(option.textContent,option.value)));
		select.value=identity.aliasId || '';
		const out=signedOut();
		login.hidden=!out;
		select.disabled=out || native.disabled || aliasCount()===0;
		if(aliasCount()===0 && !out) {
			select.options[0].textContent='Loading your aliases…';
			if(!stallTimer) stallTimer=setTimeout(()=>{if(aliasCount()===0 && !signedOut()) help.hidden=false;},20000);
		} else {
			help.hidden=true;
			if(stallTimer) {clearTimeout(stallTimer);stallTimer=null;}
		}
		root.querySelector('.identity')?.classList.toggle('signed-out',out);
		root.getElementById('avatar').textContent=(identity.aliasName || identity.aliasId || '●').slice(0,1).toUpperCase();
		if(lastAlias!==identity.aliasId) {destination.clear();lastAlias=identity.aliasId;}
	}
	select.onchange=()=>{
		const chosen=select.value,snapshot=composer.state.snapshot();
		if(!chosen || chosen===snapshot.identity.aliasId) {render();return;}
		if(snapshot.rootAttachments.some(item=>item.status==='uploaded' || item.status==='uploading')) {
			render();tell('Remove uploaded attachments before switching your posting alias.');return;
		}
		composer.state.selectDestination(null);composer.aliasPanel.choose(chosen);render();tell('');
	};
	const observer=new MutationObserver(render);
	observer.observe(native,{childList:true,subtree:true,attributes:true});
	observer.observe(notice,{attributes:true,attributeFilter:['hidden']});
	render();return render;
}
