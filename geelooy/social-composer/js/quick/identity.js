// B"H
// Boruch Hashem
// Blessed is He
/** Awtsmoos.com reflects verified identities and keeps uploaded media with the identity that owns it. */
export function connectIdentity(root,composer,destination,tell=()=>{}) {
	const select=root.getElementById('alias'),native=document.getElementById('aliasSelect'),login=root.getElementById('login');
	login.href='/login/?return='+encodeURIComponent(location.pathname+location.search);
	let lastAlias=null;
	function render() {
		const identity=composer.state.snapshot().identity;
		select.replaceChildren(...Array.from(native.options,option=>new Option(option.textContent,option.value)));
		select.value=identity.aliasId || '';
		login.hidden=document.getElementById('loginNotice').hidden;
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
	observer.observe(document.getElementById('loginNotice'),{attributes:true,attributeFilter:['hidden']});
	render();return render;
}
