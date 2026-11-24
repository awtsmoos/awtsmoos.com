// B"H — The Awtsmoos gives each creation its true home.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canonicalPostRoute,safeReaderPath} from '../../shared/social/model/CanonicalPostRoute.mjs';
import {publishedRoute} from '../../social-composer/js/quick/publishedRoute.js';
const coordinates={heichelId:'music',seriesId:'songs',postId:'melody'};
const expected='/heichelos/music/series/songs/post/melody';
test('canonical route keeps exact series',()=>{
	assert.equal(canonicalPostRoute(coordinates),expected);
	assert.equal(canonicalPostRoute({...coordinates,seriesId:undefined}),'');
	assert.equal(canonicalPostRoute({...coordinates,seriesId:'..'}),'');
	assert.equal(canonicalPostRoute({...coordinates,postId:'a/b'}),'');
});
test('reader path permits only same-origin exact coordinates',()=>{
	assert.equal(safeReaderPath('https://awtsmoos.com'+expected),expected);
	for(const value of ['javascript:alert(1)','https://example.com'+expected,'//example.com'+expected,'/profile/',expected+'/extra','/heichelos/music/series/songs/post/a%2Fb'])assert.equal(safeReaderPath(value),'',value);
});
test('published versus moderated receipts',()=>{
	const canonical={heichelId:'music',seriesId:'songs',id:'melody'};
	assert.equal(publishedRoute({status:'published',canonical}),expected);
	assert.equal(publishedRoute({status:'partial',canonical}),expected);
	for(const status of ['submitted','scheduled','failed'])assert.equal(publishedRoute({status,canonical}),'');
});
