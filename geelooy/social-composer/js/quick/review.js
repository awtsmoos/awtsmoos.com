// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives the deed a witness and a destination; Awtsmoos.com opens the actual result, never an imagined post. */
import {buildPostPayload} from '../model/PostPayload.js';
import {buildPublicationPlan} from '../publishing/PublicationPlan.js';
import {requiresAdvanced} from './postReadiness.js?v=clean-004';
import {showPublished} from './publishedRoute.js?v=nav-001';
const digest=snapshot=>JSON.stringify([buildPostPayload(snapshot),buildPublicationPlan(snapshot)]);
export function openQuickReview(root,composer,destination,tell,detail) {
	const {state,workflow}=composer;
	const snapshot=state.snapshot(), original=digest(snapshot);
	const dialog=document.createElement('dialog');
	dialog.className='quick-review';
	dialog.innerHTML='<div class="review-head"><h2>Review post</h2><button type="button" data-close aria-label="Close review">×</button></div><div class="review-content"><p class="review-meta" data-author></p><p class="review-meta" data-destination></p><h3 data-title></h3><p data-body class="review-body"></p><p data-summary class="review-meta"></p><div data-media class="review-media"></div><p data-audience class="review-audience"></p><p data-message role="status" aria-live="polite" hidden></p></div><div class="review-actions"><button type="button" data-back>Back</button><button type="button" class="primary" data-publish>Publish</button></div>';
	const find=selector=>dialog.querySelector(selector);
	const put=(selector,value)=>{const node=find(selector);node.textContent=value || '';node.hidden=!value;};
	const message=text=>put('[data-message]',text);
	const publish=find('[data-publish]'), back=find('[data-back]'), close=find('[data-close]');
	const moderated=detail?.access?.actions?.content?.mode==='submit';
	put('[data-author]',`Posting as ${snapshot.identity.aliasName || snapshot.identity.aliasId}`);
	put('[data-destination]',`${snapshot.identity.heichelName || snapshot.identity.heichelId} › ${snapshot.identity.seriesId==='root'?'Heichel Home':snapshot.identity.seriesName || snapshot.identity.seriesId}`);
	put('[data-title]',snapshot.title);
	put('[data-body]',snapshot.rootBlocks[0]?.text);
	put('[data-summary]',snapshot.summary);
	put('[data-audience]',moderated?'Public after moderator approval':'Public · Publish now');
	for(const item of snapshot.rootAttachments) {
		const line=document.createElement('div');line.textContent=`${item.name || item.type}${item.role==='cover'?' · Cover':''}`;find('[data-media]').append(line);
	}
	publish.textContent=moderated?'Submit for review':'Publish';
	const issues=workflow.issues(snapshot);
	if(issues.length) {message(issues.join(' '));publish.disabled=true;}
	let busy=false;
	function dismiss() {if(!busy) dialog.close();}
	close.onclick=back.onclick=dismiss;
	dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
	dialog.addEventListener('close',()=>dialog.remove(),{once:true});
	publish.onclick=async()=>{
		if(busy) return;
		busy=true;publish.disabled=back.disabled=close.disabled=true;
		try {
			if(requiresAdvanced(state.snapshot()) || digest(state.snapshot())!==original) throw Error('The draft changed. Go back and review it again.');
			message('Checking destination…');
			const fresh=await destination.verify(snapshot.identity);
			if(digest(state.snapshot())!==original || fresh.access.actions.content.mode!==detail.access.actions.content.mode) throw Error('The post or destination permissions changed. Go back and review again.');
			message(moderated?'Submitting…':'Publishing…');
			const result=await workflow.publish({navigate:false});
			if(!result) throw Error(composer.status.element?.textContent || 'Could not publish. Your draft remains saved.');
			destination.clear();
			state.selectDestination(null);
			dialog.close();
			showPublished(root,result,tell);
		} catch(error) {message(error.message);}
		finally {busy=false;publish.disabled=back.disabled=close.disabled=false;}
	};
	root.append(dialog);dialog.showModal();
}
