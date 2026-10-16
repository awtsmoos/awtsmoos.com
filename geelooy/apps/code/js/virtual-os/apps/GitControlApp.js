//B"H
//Boruch Hashem
//Blessed is He

import { H } from '../ui/h.js';

/** Import public GitHub text sources into the user's owned hosted-VFS alias.
 *  The key is deliberately never saved or included in the URL.
 */
async function importGithub({repository,branch,destination,key,onProgress}) {
	const controller=new AbortController();
	const timer=setTimeout(()=>controller.abort(),25000);
	try{
		onProgress('Contacting the authorized Virtual OS controller…');
		const response=await fetch('/api/tunnel/control/fs/awtsmoos-os',{
			method:'POST',credentials:'include',cache:'no-store',
			headers:{'content-type':'application/json','x-awtsmoos-api-key':key},
			body:JSON.stringify({action:'gitClone',url:repository,ref:branch,destination,autoPreview:false}),
			signal:controller.signal
		});
		const result=await response.json();
		if(!response.ok||result?.ok!==true) {
			throw Error((result?.error||('HTTP '+response.status))+(result?.stage?' at '+result.stage:''));
		}
		return result;
	}finally{clearTimeout(timer);}
}
function label(text){return H({tag:'div',className:'vos-settings-title',text});}
function field(type,placeholder,value='',accessibleName=placeholder){
	const input=H({tag:'input',className:'vos-app-input',attrs:{type,placeholder,autocomplete:type==='password'?'off':'on',spellcheck:'false','aria-label':accessibleName}});
	input.value=value;
	return input;
}
export function renderGitControlApp(windowState,container,desktopState,env) {
	const mode=localStorage.getItem('awtsmoos.vibe.git.mode')||'off';
	const url=field('url','https://github.com/owner/repository','','Public GitHub repository URL');
	const branch=field('text','main','main','GitHub branch name');
	const destination=field('text','my-alias/repos/repository','','Owned Virtual OS destination path');
	const key=field('password','Scoped tunnel.write API key','','One-use-per-request tunnel write key');
	const feedback=H({tag:'div',className:'vos-git-status-line',attrs:{role:'status','aria-live':'polite','aria-atomic':'true'},text:'Ready. Import a public GitHub source snapshot into an owned Virtual OS alias.'});
	const button=H({tag:'button',className:'vos-app-button',text:'Import GitHub sources',attrs:{type:'button'}});
	let busy=false;
	button.addEventListener('click',async()=>{
		if(busy)return;
		const repository=url.value.trim(),ref=branch.value.trim(),target=destination.value.trim(),credential=key.value.trim();
		if(!repository||!ref||!target||!credential){
			feedback.textContent='Enter the public repository, branch, owned destination and tunnel.write key.';
			return;
		}
		busy=true;button.disabled=true;button.textContent='Importing…';key.value='';
		feedback.textContent='Checking repository, permissions and destination…';
		try{
			const receipt=await importGithub({repository,branch:ref,destination:target,key:credential,onProgress:text=>{feedback.textContent=text;}});
			const ignored=receipt.skippedBinary?.length||0;
			feedback.textContent=(receipt.alreadyImported?'Already imported. ':'Imported. ')+receipt.filesImported+
				' source files → '+receipt.destination+' in '+receipt.elapsedMs+' ms.'+
				(ignored?' '+ignored+' binary files excluded; use native Git for full checkout.':'')+
				' Source snapshot only (no Git history or push).';
		}catch(error){feedback.textContent='Import failed: '+(error.name==='AbortError'?'request exceeded 25 seconds':error.message);}
		finally{busy=false;button.disabled=false;button.textContent='Import GitHub sources';}
	});
	container.replaceChildren(H({
		tag:'div',className:'vos-app vos-git-control-app',children:[
			{tag:'div',className:'vos-app-toolbar',children:[
				{tag:'strong',text:'GitHub → Virtual OS'},
				{tag:'span',className:'vos-app-path',text:env.workspace.name||'Workspace'}
			]},
			{tag:'div',className:'vos-git-card',children:[
				label('Import a public GitHub repository (source snapshot)'),
				url,branch,destination,key,button,feedback,
				{tag:'div',className:'vos-git-status-line',text:'Private repositories, arbitrary host shell, Git history and push are not supported here. Your API key stays in memory for this request and is cleared from the input.'}
			]},
			{tag:'div',className:'vos-git-card',children:[
				label('GitHub sync policy'),
				{tag:'div',className:'vos-git-status-line',text:'Current policy: '+mode},
				{tag:'div',className:'vos-git-status-line',text:'Source imports are manual and never enable automatic commits or pushes.'}
			]}
		]
	}));
}
export {importGithub};
