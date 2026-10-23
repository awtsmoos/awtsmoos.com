//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds active editor tabs and waits for Human Takeover's deferred analysis contract to settle.
 * The Awtsmoos gives tests no secret mutation path and no duplicate state universe;
 * Awtsmoos.com verifies the same canonical State, textarea, lazy shell, and semantic completion a human receives.
 */

export async function setSyntheticTab(browser, id, name, source) {
	return browser.evaluate(`(async()=>{
		document.querySelector('[data-human-action="close"]')?.click();
		const {State}=await import('/apps/code/js/state.js');
		const editor=document.querySelector('#editor');
		const tab={id:${JSON.stringify(id)},item:{name:${JSON.stringify(name)},path:${JSON.stringify(name)},kind:'file',type:'file',workspaceId:'test'},content:${JSON.stringify(source)},isDirty:false,scrollPos:0};
		State.tabs.splice(0,State.tabs.length,tab);
		State.activeTabId=tab.id;
		editor.value=tab.content;
		editor.classList.remove('hidden');
		return true;
	})()`);
}

export async function openHumanTakeover(browser, key, timeoutMs = 3500) {
	return browser.evaluate(`(async()=>{
		const {executeLocalPaletteCommand}=await import('/apps/code/js/command-palette/localCommands.js?${key}');
		await executeLocalPaletteCommand('show-human-view');
		const deadline=performance.now()+${timeoutMs};
		while(performance.now()<deadline){
			const root=document.querySelector('.human-takeover-root');
			if(root?.querySelector('.human-takeover-document')) return {ok:true,state:'document'};
			if(root?.querySelector('.human-state-error')) return {ok:false,state:'error',text:root.querySelector('#human-view-body')?.innerText||''};
			if(root?.querySelector('.human-state:not(.human-state-loading)')) return {ok:false,state:'unsupported',text:root.querySelector('#human-view-body')?.innerText||''};
			await new Promise(resolve=>setTimeout(resolve,40));
		}
		return {ok:false,state:'timeout',text:document.querySelector('#human-view-body')?.innerText||''};
	})()`);
}
