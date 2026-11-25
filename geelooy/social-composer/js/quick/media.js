// B"H
// Boruch Hashem
// Blessed is He
/** Awtsmoos.com gives each image and sound a visible place before publication. */
import {attachAudioEffects} from '../../../shared/social/media/AudioEffects.mjs?v=media-002';
const groups=[
	{types:['image/png','image/jpeg','image/webp','image/gif'],limit:8},
	{types:['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/ogg','audio/mp4','audio/m4a','audio/webm'],limit:64},
	{types:['video/mp4','video/webm','video/quicktime','video/ogg'],limit:100}
];
export function fileIssue(file) {
	const group=groups.find(item=>item.types.includes(file.type));
	if(!group) return 'Unsupported file type. Choose a supported photo, audio or video.';
	if(!file.size) return 'The file is empty.';
	if(file.size>group.limit*1024*1024) return `The file exceeds ${group.limit} MB.`;
	return '';
}
function sizeLabel(size) {
	return size>=1048576?`${(size/1048576).toFixed(1)} MB`:size?`${Math.max(1,Math.round(size/1024))} KB`:'';
}
/** A filename becomes a human title: "01-almighty_master (live).mp3" -> "Almighty master (live)". */
export function titleFromFilename(name) {
	const base=String(name || '').replace(/\.[a-z0-9]{2,5}$/i,'').replace(/^\d{1,3}[\s._-]+/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
	return base?base.charAt(0).toUpperCase()+base.slice(1):'';
}
/** Render previews and offer an optional author-selected visual garment for audio. */
export function connectMedia(root,composer,tell=()=>{}) {
	const actions=composer.controller.actions.mediaActions(),scope={kind:'root'};
	const container=root.getElementById('attachments');
	const titleField=root.getElementById('title');
	if(titleField) titleField.addEventListener('input',()=>{titleField.dataset.titleTouched='1';});
	let cleanups=[],savingEffect=false;
	for(const input of root.querySelectorAll('input[type=file]')) {
		input.onchange=()=>{
			const files=Array.from(input.files || []),valid=[],errors=[];
			for(const file of files) {
				const issue=fileIssue(file);
				if(issue) errors.push(`${file.name}: ${issue}`);else valid.push(file);
			}
			const remaining=Math.max(0,20-composer.state.snapshot().rootAttachments.length);
			if(valid.length>remaining) errors.push('A quick post can include up to 20 attachments.');
			if(valid.length && remaining) actions.add(scope,valid.slice(0,remaining));
			// Music made easy: the first audio file names the post (still
			// fully editable), and the text box becomes the track's notes.
			const firstAudio=valid.find(file=>file.type.startsWith('audio/'));
			if(firstAudio) {
				const titleInput=root.getElementById('title');
				if(titleInput && !titleInput.value.trim() && !titleInput.dataset.titleTouched) {
					const suggested=titleFromFilename(firstAudio.name);
					if(suggested) {
						titleInput.value=suggested;
						titleInput.dispatchEvent(new Event('input',{bubbles:true}));
					}
				}
				const body=root.getElementById('body');
				if(body) body.placeholder='Notes for this track — lyrics, the story behind it, credits…';
			}
			tell(errors.join(' '));input.value='';
		};
	}
	function render(items) {
		if(savingEffect) return;
		for(const cleanup of cleanups) cleanup();
		cleanups=[];container.replaceChildren();
		for(const item of items) {
			const card=document.createElement('article');card.className='attachment';
			const src=item.localUrl || item.publicPath;
			const tag=['image','gif'].includes(item.type)?'img':['audio','video'].includes(item.type)?item.type:'';
			if(src && tag) {
				const preview=document.createElement(tag);preview.src=src;
				if(tag==='img') {preview.alt=item.alt || item.name;preview.loading='lazy';}
				else {preview.controls=true;preview.preload='metadata';}
				card.append(preview);
				if(tag==='audio') {
					const effects=attachAudioEffects(card,preview,{initial:item.visualizer,onChange:mode=>{
						savingEffect=true;
						try {actions.update(scope,item.id,{visualizer:mode});}
						finally {savingEffect=false;}
					}});
					cleanups.push(()=>{preview.pause();effects.dispose();});
				}
			}
			const name=document.createElement('strong');name.textContent=item.name;
			const status=document.createElement('small');
			status.textContent=[sizeLabel(item.size),item.error || (item.status==='uploaded'?'Uploaded':item.status==='uploading'?'Uploading…':'Ready to upload')].filter(Boolean).join(' · ');
			const buttons=document.createElement('div');buttons.className='attachment-actions';
			const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.disabled=item.status==='uploading';remove.onclick=()=>actions.remove(scope,item.id);buttons.append(remove);
			if(tag==='img') {
				const cover=document.createElement('button');cover.type='button';cover.textContent=item.role==='cover'?'Cover selected':'Use as cover';cover.setAttribute('aria-pressed',String(item.role==='cover'));cover.onclick=()=>actions.update(scope,item.id,{role:item.role==='cover'?'inline':'cover'});buttons.append(cover);
			}
			card.append(name,status,buttons);container.append(card);
		}
	}
	return render;
}
