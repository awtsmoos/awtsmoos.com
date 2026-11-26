// B"H
// Boruch Hashem
// Blessed is He
/** Awtsmoos.com checks the chosen home before and after carrying the media into its vessel. */
import {hasPostContent,suggestedTitle,requiresAdvanced} from './postReadiness.js?v=clean-004';
import {openQuickReview} from './review.js?v=revelation-002';
export function connectNext(root,composer,destination,tell) {
	const get=id=>root.getElementById(id), next=get('next');
	const {state,controller}=composer;
	let busy=false;
	next.onclick=async()=>{
		if(busy) return;
		const initial=state.snapshot();
		if(!composer.aliasPanel.aliases.some(alias=>alias.aliasId===initial.identity.aliasId)) {
			get('alias').focus();return tell('Sign in and choose your posting alias first.');
		}
		if(requiresAdvanced(initial)) return tell('This draft has advanced content or settings. Open Advanced to review them.');
		if(!hasPostContent(initial)) {get('body').focus();return tell('Write something or attach a photo, audio or video.');}
		if(!get('picker').hidden) return tell('Finish choosing your destination or cancel the picker first.');
		if(!destination.confirmed(initial.identity)) return destination.open();
		if(initial.rootAttachments.some(item=>item.status==='uploading')) return tell('An attachment is already uploading.');
		busy=true;
		const controls=[...root.querySelectorAll('button,input,select,textarea')];
		const disabled=controls.map(control=>control.disabled);
		controls.forEach(control=>control.disabled=true);
		get('attachments').inert=true;
		try {
			next.textContent='Checking…';
			await destination.verify(initial.identity);
			if(!initial.title.trim()) state.set('title',suggestedTitle(initial));
			const pending=initial.rootAttachments.filter(item=>item.status!=='uploaded' || !item.publicPath);
			for(const [index,item] of pending.entries()) {
				if(!destination.confirmed(state.snapshot().identity)) throw Error('Your destination changed. Confirm it again.');
				if(!item.file) throw Error(`Choose ${item.name || 'the attachment'} again before publishing.`);
				next.textContent=`Uploading ${index+1}/${pending.length}`;
				tell(`Uploading ${item.name}…`);
				await controller.actions.mediaActions().upload({kind:'root'},item);
				const uploaded=state.snapshot().rootAttachments.find(attachment=>attachment.id===item.id);
				if(uploaded?.status!=='uploaded' || !uploaded.publicPath) throw Error(uploaded?.error || 'Attachment upload failed.');
			}
			next.textContent='Checking…';
			const detail=await destination.verify(initial.identity);
			tell('');openQuickReview(root,composer,destination,tell,detail);
		} catch(error) {tell(error.message);}
		finally {
			controls.forEach((control,index)=>control.disabled=disabled[index]);
			get('attachments').inert=false;
			next.textContent='Next';busy=false;
		}
	};
}
