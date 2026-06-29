// B"H
const assert = require('assert/strict');
const { buildVirtualOsGraphActions } = require('../actionGroups/virtualOsGraphActions.js');

function actions(payload) {
  return buildVirtualOsGraphActions({ payload });
}

(async () => {
  const graphId = `test:${Date.now()}`;
  await actions({ graphId }).virtualOsGraphReset();

  let result = await actions({ graphId, object:{ id:'folder:root', type:'folder', title:'Root', path:'/root', children:['file:one'] } }).virtualOsGraphUpsert();
  assert.equal(result.object.id, 'folder:root');

  await actions({ graphId, object:{ id:'file:one', type:'file', title:'One', path:'/root/one.txt', refs:['folder:root'] } }).virtualOsGraphUpsert();
  result = await actions({ graphId, id:'folder:root' }).virtualOsGraphReferences();
  assert.equal(result.references.children[0].id, 'file:one');
  assert.equal(result.references.reverse[0].id, 'file:one');

  result = await actions({ graphId, path:'/root/one.txt' }).virtualOsGraphPathLookup();
  assert.equal(result.object.id, 'file:one');

  result = await actions({ graphId, id:'folder:root', depth:2 }).virtualOsGraphTraverse();
  assert.equal(result.traversal.objects.some(object => object.id === 'file:one'), true);

  result = await actions({ graphId, operations:[{ op:'explode', id:'bad' }] }).virtualOsGraphTransaction();
  assert.equal(result.ok, false);
  assert.equal((await actions({ graphId, id:'file:one' }).virtualOsGraphGet()).object.id, 'file:one');

  result = await actions({ graphId, id:'file:one' }).virtualOsGraphDelete();
  assert.equal(result.deleted.id, 'file:one');
  console.log("B'H server virtual OS graph actions passed");
})();

/**
 * B"H
 * The server mirror is tested as a court of actions. Objects enter, reference
 * each other, survive a failed transaction, then depart by delete with history
 * still breathing behind them.
 */
