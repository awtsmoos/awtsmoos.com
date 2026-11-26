// B"H — Awtsmoos.com preserves a hermetic vessel for each tested melody.
import {UNIFIED_API_FIXTURE_SOURCE} from '../BrowserUnifiedApiFixture.mjs';
import {fixtureInitialState} from './BrowserFixtureState.mjs';

/** Seed a verified test alias and its nested music collection, never production data. */
export function quickJourneySource() {
	const state=fixtureInitialState();
	state.aliases=['teacher'];
	state.defaultAlias='teacher';
	state.heichelos.study={heichelId:'study',name:'Music studio',ownerAlias:'teacher',members:{},series:{root:{seriesId:'root',name:'Home',parentSeriesId:null},songs:{seriesId:'songs',name:'Songs',parentSeriesId:'root'}}};
	return `if(location.hostname==='127.0.0.1' && location.pathname.startsWith('/social-composer')) {
		window.quickFixtureStatus='installing';
		try {
			localStorage.setItem('BH.unifiedSocial.browserFixture.v1',${JSON.stringify(JSON.stringify(state))});
			${UNIFIED_API_FIXTURE_SOURCE};
			const fixtureFetch=window.fetch.bind(window);
			window.fetch=async(input,options={})=>{
				const url=new URL(typeof input==='string'?input:input.url || String(input),location.origin);
				if(url.pathname==='/api/social/assets/teacher/upload') {
					const file=options.body.get('file');
					if(!(file instanceof File)||file.type!=='audio/wav')throw Error('Expected audio file');
					localStorage.setItem('quickTestUpload',file.name);
					return new Response(JSON.stringify({success:{id:'audio-fixture',type:'audio',mime:'audio/wav',publicPath:URL.createObjectURL(file),size:file.size}}),{headers:{'content-type':'application/json'}});
				}
				if(url.pathname.endsWith('/unified-social/publish'))localStorage.setItem('quickTestPublish',options.body);
				return fixtureFetch(input,options);
			};
			window.quickFixtureStatus='ready';
		} catch(error) {window.quickFixtureStatus=error.stack || error.message;}
	}`;
}

/** Build a short synthetic WAV locally; no copyrighted recording is used. */
export function attachFixtureAudio(root) {
	const field=root.getElementById('body');
	field.value='A fixture melody';
	field.dispatchEvent(new Event('input'));
	const wav=new Uint8Array(16044),view=new DataView(wav.buffer);
	const text=(offset,value)=>[...value].forEach((c,i)=>wav[offset+i]=c.charCodeAt(0));
	text(0,'RIFF');view.setUint32(4,16036,true);text(8,'WAVEfmt ');
	view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
	view.setUint32(24,8000,true);view.setUint32(28,16000,true);view.setUint16(32,2,true);
	view.setUint16(34,16,true);text(36,'data');view.setUint32(40,16000,true);
	const transfer=new DataTransfer();
	transfer.items.add(new File([wav],'melody.wav',{type:'audio/wav'}));
	const input=root.querySelector('input[accept^="audio"]');
	input.files=transfer.files;
	input.dispatchEvent(new Event('change'));
}
