// B"H
// Awtsmoos.com verifies each small vessel before its release.
import assert from 'node:assert/strict';
import {destinationChoices,flattenSeries,exactDetail,sameDestination} from '../js/quick/destinationModel.js';
import {hasPostContent,suggestedTitle,requiresAdvanced} from '../js/quick/postReadiness.js';
import {fileIssue} from '../js/quick/media.js';
const allow={actions:{content:{mode:'direct'}}};
const deny={actions:{content:{mode:'denied'}}};
const detail={heichel:{heichelId:'music'},series:{seriesId:'songs'},access:allow};
assert.equal(exactDetail(detail,'music','songs'),true);
assert.equal(exactDetail(detail,'music','root'),false);
assert.equal(exactDetail({...detail,access:deny},'music','songs'),false);
assert.equal(sameDestination({alias:'a',heichelId:'music',seriesId:'songs'},{aliasId:'b',heichelId:'music',seriesId:'songs'}),false);
const tree={seriesId:'root',name:'Home',children:[{seriesId:'songs',name:'Songs'}]};
assert.equal(flattenSeries(tree).length,2);
const draft={title:'',rootBlocks:[{type:'paragraph',text:'\nA new song\nSecond line'}],rootAttachments:[],sections:[],secondaryDestinations:[],postKind:'post'};
assert.equal(hasPostContent(draft),true);
assert.equal(suggestedTitle(draft),'A new song');
assert.equal(requiresAdvanced(draft),false);
assert.equal(requiresAdvanced({...draft,publication:{scheduledAt:1}}),true);
assert.equal(suggestedTitle({...draft,rootBlocks:[{type:'paragraph',text:''}],rootAttachments:[{name:'Melody.mp3'}]}),'Melody');
assert.equal(fileIssue({type:'audio/mpeg',size:100}), '');
assert.ok(fileIssue({type:'application/pdf',size:100}));
assert.ok(fileIssue({type:'image/png',size:9*1024*1024}));
console.log('Quick refinement assertions passed');
