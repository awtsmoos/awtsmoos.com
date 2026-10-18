// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const api = require('../_awtsmoos.derech.js');

async function routes() {
  const handlers=new Map();
  const headers={};
  const response={ statusCode:200, setHeader(key,value){ headers[key.toLowerCase()]=value; }, end(value){ return value; } };
  await api.dynamicRoutes({ response, request:{url:'/api/tunnel/install/pairing-page'}, use(name,handler){handlers.set(name,handler);} });
  return {handlers,headers,response};
}

test('public manifest API returns the exact canonical release manifest',async()=>{
  const {handlers,headers,response}=await routes();
  assert(handlers.has('manifest.txt'));
  const reply=await handlers.get('manifest.txt')();
  const canonical=fs.readFileSync(path.resolve(__dirname,'../../../../apps/tunnel/agent/manifest.txt'),'utf8');
  assert.equal(reply.response,canonical);
  assert.equal(response.statusCode,200);
  assert.equal(headers['cache-control'].includes('no-store'),true);
});

test('obsolete approval endpoint never fakes authenticated approval',async()=>{
  const {handlers,response}=await routes();
  const reply=await handlers.get('pairing-approve')();
  assert.equal(response.statusCode,410);
  assert.equal(JSON.parse(reply).ok,false);
});
