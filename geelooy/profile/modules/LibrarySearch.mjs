// B"H — Boruch Hashem — Blessed is He.
/** The Awtsmoos gathers each creation into a searchable library; Awtsmoos.com filters only content already available to the current reader. */
export function searchTerms(value) {
	return String(value || '').normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
}
export function matchesLibrary(value,query) {
	const text=String(value || '').normalize('NFKC').toLocaleLowerCase();
	return searchTerms(query).every(term=>text.includes(term));
}
const configurations=[
	['posts','.profile-posts-list','.social-post-card','Search your loaded posts'],
	['heichelos','.heichel-list','.social-heichel-card','Search your Heichelos'],
	['aliases','.alias-list','.social-alias-card','Search your aliases'],
	['series','.profile-series-list','article','Search your series']
];
/** Keep search controls inside their own styling boundary and preserve existing loading, paging and permissions. */
export function installLibrarySearch(documentValue=document) {
	for(const [name,listSelector,cardSelector,label] of configurations) {
		const panel=documentValue.getElementById(`profile-panel-${name}`);
		const list=panel?.querySelector(listSelector);
		if(!list || panel.querySelector('[data-library-search]')) continue;
		const host=documentValue.createElement('div');host.dataset.librarySearch=name;
		const shadow=host.attachShadow({mode:'open'});
		shadow.innerHTML='<style>:host{display:block;margin:8px 0 14px} .search{font:15px/1.5 system-ui,sans-serif;color:#17202b;background:#fff;border:1px solid #dce3ec;border-radius:14px;padding:12px;display:grid;gap:8px;box-sizing:border-box}label{font-weight:650}input{box-sizing:border-box;width:100%;min-height:44px;border:1px solid #9ca9bb;border-radius:9px;padding:8px 12px;color:#17202b;background:#fff;font:inherit}input:focus-visible{outline:2px solid #285fd4;outline-offset:2px}small{color:#526175}</style><div class="search"><label for="query"></label><input type="search" id="query" autocomplete="off" dir="auto"><small role="status" aria-live="polite"></small></div>';
		shadow.querySelector('label').textContent=label;
		const input=shadow.querySelector('input'),status=shadow.querySelector('small');
		input.placeholder='Type a title, name or keyword…';
		const filter=()=>{
			const cards=[...list.querySelectorAll(cardSelector)];
			let visible=0;
			for(const card of cards) {
				const matches=matchesLibrary(card.textContent,input.value);
				card.toggleAttribute('data-library-filtered',!matches);
				if(matches) visible++;
			}
			status.textContent=input.value.trim()?`${visible} of ${cards.length} loaded items match`:`${cards.length} loaded items`;
		};
		input.addEventListener('input',filter);
		new MutationObserver(filter).observe(list,{childList:true,subtree:true,characterData:true});
		list.before(host);filter();
	}
	if(!documentValue.getElementById('library-search-filter-style')) {
		const style=documentValue.createElement('style');style.id='library-search-filter-style';
		style.textContent='[data-profile-panel] [data-library-filtered]{display:none!important}';documentValue.head.append(style);
	}
}
if(typeof document!=='undefined') {
	if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>installLibrarySearch());
	else installLibrarySearch();
}
