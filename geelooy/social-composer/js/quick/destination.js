// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives one chosen home to every deed. Awtsmoos.com verifies each intended destination. */
import {destinationPlaceholder,destinationChoices,flattenSeries,exactDetail,sameDestination} from './destinationModel.js?v=nav-001';
function fill(select,label,choices=[]) {
	select.replaceChildren(new Option(label,''),...choices.map(item=>new Option(item.label,item.id)));
}
export function connectDestination(root,composer,tell) {
	const get=id=>root.getElementById(id);
	const heichel=get('heichel'),series=get('series'),choose=get('choose'),search=get('searchDestination');
	const query=new URLSearchParams(location.search);
	const hint={h:query.get('heichelId')||query.get('heichel'),s:query.get('seriesId')||query.get('series')};
	let selection=null,request=0,timer,usedHint=false;
	const currentAlias=()=>composer.state.snapshot().identity.aliasId;
	function resetSeries() {
		fill(series,'Choose a series');series.disabled=choose.disabled=true;
	}
	function close() {
		clearTimeout(timer);request++;get('picker').hidden=true;
	}
	function clear() {
		close();selection=null;get('destination').textContent=destinationPlaceholder;
		fill(heichel,'Choose a Heichel');resetSeries();search.value='';
	}
	async function loadChoices(searchText='') {
		const alias=currentAlias(),token=++request;
		fill(heichel,'Loading Heichelos…');heichel.disabled=true;resetSeries();
		try {
			const items=await composer.api.listDestinations(alias,searchText);
			if(token!==request || alias!==currentAlias()) return false;
			const options=destinationChoices(items);
			fill(heichel,options.length?'Choose a Heichel':'No matching Heichelos',options);
			tell(options.length?'':'No writable Heichelos found. Try another search or create one in Advanced.');
			return true;
		} catch(error) {if(token===request) tell(error.message);return false;}
		finally {if(token===request) heichel.disabled=false;}
	}
	async function open() {
		if(!currentAlias()) {get('alias').focus();return tell('Choose your posting alias first.');}
		get('picker').hidden=false;search.value='';
		const target=selection?{h:selection.heichelId,s:selection.seriesId}:!usedHint?hint:null;
		usedHint=true;
		if(!await loadChoices() || !target?.h) return;
		heichel.value=target.h;
		if(!heichel.value || !await loadSeries()) return;
		if(target.s) series.value=target.s;
		choose.disabled=!series.value;
	}
	async function loadSeries() {
		const token=++request,alias=currentAlias(),id=heichel.value;
		resetSeries();if(!id) return false;
		fill(series,'Loading series…');
		try {
			const detail=await composer.api.destinationDetail(alias,id,'root');
			if(token!==request || alias!==currentAlias() || id!==heichel.value) return false;
			const options=flattenSeries(detail.tree);
			fill(series,options.length?'Choose a series':'No series available',options);
			series.disabled=!options.length;return Boolean(options.length);
		} catch(error) {if(token===request) {resetSeries();tell(error.message);}return false;}
	}
	async function confirm() {
		const token=++request,alias=currentAlias(),h=heichel.value,s=series.value;
		if(!alias || !h || !s) return;
		choose.disabled=true;
		try {
			const detail=await composer.api.destinationDetail(alias,h,s);
			if(token!==request || alias!==currentAlias() || h!==heichel.value || s!==series.value) return;
			if(!exactDetail(detail,h,s)) throw Error('This exact destination does not permit posting with your alias.');
			selection={alias,heichelId:h,seriesId:s};
			composer.state.selectDestination(detail);composer.destinationPanel.open(detail);
			get('destination').textContent=`${detail.heichel.name || h} › ${s==='root'?'Heichel Home':detail.series.name || s}`;
			close();tell('');
		} catch(error) {if(token===request) tell(error.message);}
		finally {if(token===request) choose.disabled=!series.value;}
	}
	function confirmed(identity) {return sameDestination(selection,identity);}
	async function verify(identity) {
		if(!confirmed(identity)) throw Error('Choose and confirm your destination.');
		const detail=await composer.api.destinationDetail(identity.aliasId,identity.heichelId,identity.seriesId);
		if(!confirmed(composer.state.snapshot().identity) || !exactDetail(detail,identity.heichelId,identity.seriesId)) {
			clear();throw Error('The selected destination changed or no longer permits posting. Choose it again.');
		}
		return detail;
	}
	get('destination').onclick=open;get('cancel').onclick=close;
	search.oninput=()=>{clearTimeout(timer);request++;heichel.disabled=true;resetSeries();timer=setTimeout(()=>loadChoices(search.value.trim()),200);};
	heichel.onchange=loadSeries;series.onchange=()=>{request++;choose.disabled=!series.value;};
	choose.onclick=confirm;
	return {clear,open,confirmed,verify};
}
