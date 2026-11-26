// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos makes one clear entrance; Awtsmoos.com keeps writing, media and the chosen home together. */
import {markup} from '../quick/markup.js?v=nav-001';
import {connectDestination} from '../quick/destination.js?v=nav-001';
import {connectIdentity} from '../quick/identity.js?v=nav-001';
import {connectMedia} from '../quick/media.js?v=media-002';
import {connectNext} from '../quick/next.js?v=revelation-002';
import {requiresAdvanced} from '../quick/postReadiness.js?v=nav-001';
import {applyComposerMode} from './composerModes.js';
async function loadStyle(name) {
	const response=await fetch(`/social-composer/js/quick/${name}.css?v=nav-001`);
	if(!response.ok) throw Error('Could not load quick composer styling.');
	return response.text();
}
export async function installQuickPostLayout() {
	const composer=window.RichSocialComposer;
	if(!composer || document.getElementById('isolated-quick-post')) return;
	const {state,controller}=composer, context=state.context || {};
	if(context.canonicalSource || context.cloneSource || context.questionId || context.createIntent) return;
	const css=(await Promise.all(['quick','quickExtras'].map(loadStyle))).join('\n');
	const host=document.createElement('div');
	host.id='isolated-quick-post';
	host.style.cssText='position:fixed!important;inset:0!important;z-index:2147480000!important;overflow:auto!important;background:#fff!important;';
	const root=host.attachShadow({mode:'open'}), style=document.createElement('style');
	style.textContent=css;root.innerHTML=markup;root.prepend(style);
	const get=id=>root.getElementById(id);
	const tell=message=>{get('status').textContent=message || '';get('status').hidden=!message;};
	const destination=connectDestination(root,composer,tell);
	const identity=connectIdentity(root,composer,destination,tell);
	const renderMedia=connectMedia(root,composer,tell);
	connectNext(root,composer,destination,tell);
	const title=get('title'),body=get('body');
	title.oninput=()=>state.set('title',title.value);
	body.oninput=()=>{
		const block=state.snapshot().rootBlocks[0];
		if(block?.type==='paragraph') controller.actions.block('text',{scope:{kind:'root'},blockId:block.id,value:body.value});
	};
	function renderText(snapshot) {
		if(title.value!==snapshot.title) title.value=snapshot.title;
		const simple=snapshot.rootBlocks.length===1 && snapshot.rootBlocks[0].type==='paragraph';
		body.readOnly=!simple;get('complex').hidden=!requiresAdvanced(snapshot);
		const text=snapshot.rootBlocks[0]?.text || '';
		if(body.value!==text) body.value=text;
	}
	state.addEventListener('change',event=>{
		const {reason,snapshot}=event.detail;
		if(reason.startsWith('identity:') || reason==='replace') identity();
		if(reason.startsWith('attachments:') || reason==='replace') renderMedia(snapshot.rootAttachments);
		renderText(snapshot);
	});
	const nativeStatus=document.getElementById('statusMessage');
	new MutationObserver(()=>{
		if(!nativeStatus.hidden && nativeStatus.dataset.kind==='error') tell(nativeStatus.textContent);
	}).observe(nativeStatus,{childList:true,subtree:true,attributes:true});
	const legacy=[document.querySelector('.composer-civilization-header'),document.querySelector('.composerLayout')].filter(Boolean);
	const savedOverflow=document.documentElement.style.overflow;
	function setVisible(visible) {
		context.quickPostActive=visible;
		legacy.forEach(node=>node.inert=visible);
		host.style.setProperty('display',visible?'block':'none','important');
		document.documentElement.style.overflow=visible?'hidden':savedOverflow;
		if(visible) {destination.clear();state.selectDestination(null);}
		else {applyComposerMode('advanced');controller.renderAll(state.snapshot());}
	}
	get('advanced').onclick=()=>setVisible(false);
	const back=document.createElement('button');back.type='button';back.textContent='Quick post';back.onclick=()=>setVisible(true);
	legacy[0]?.append(back);
	renderText(state.snapshot());renderMedia(state.snapshot().rootAttachments);
	document.body.append(host);setVisible(new URLSearchParams(location.search).get('mode')!=='advanced');
}
