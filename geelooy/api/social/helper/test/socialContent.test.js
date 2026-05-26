//B"H
const assert = require('assert');
const content = require('../socialContent.js');

function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) { store.set(path, value); return { path, value }; },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (!rest || rest.includes('/')) continue;
        out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}

(async () => {
  const $i = { db: makeDb(), $_POST: {} };
  $i.$_POST = { aliasId: 'alice', postId: 'q1', title: 'What is Awtsmoos?', content: 'Question body', seriesId: 'root', sections: JSON.stringify([{ id: 's1', title: 'Context', content: 'Section body' }]) };
  const question = await content.createQuestion({ $i, heichelId: 'h1' });
  assert.equal(question.success.contentType, 'question');
  assert.equal(question.success.sections.length, 1);

  $i.$_POST = { aliasId: 'bob', answerId: 'a1', title: 'Answer', content: 'Answer body', seriesId: 'root' };
  const answer = await content.createAnswer({ $i, heichelId: 'h1', questionId: 'q1' });
  assert.equal(answer.success.contentType, 'answer');

  const answers = await content.listAnswers({ $i, heichelId: 'h1', questionId: 'q1' });
  assert.equal(answers.success.length, 1);
  assert.equal(answers.success[0].kind, 'answers');

  $i.$_POST = { aliasId: 'alice', sectionId: 's2', title: 'More', content: 'More section' };
  const section = await content.createSection({ $i, heichelId: 'h1', postId: 'q1' });
  assert.equal(section.success.id, 's2');

  const sections = await content.listSections({ $i, heichelId: 'h1', postId: 'q1' });
  assert.equal(sections.success.length, 2);

  $i.$_POST = { aliasId: 'alice', kind: 'reposts', fromType: 'comment', fromId: 'c1', fromHeichelId: 'h1', toType: 'post', toId: 'q1', toHeichelId: 'h1' };
  const repost = await content.createRepost({ $i });
  assert.equal(repost.success.kind, 'reposts');

  console.log('B"H socialContent.test passed');
})().catch(error => { console.error(error); process.exit(1); });
