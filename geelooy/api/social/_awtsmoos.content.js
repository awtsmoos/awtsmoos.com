//B"H
/**
 * Quora-like content routes: questions, answers, sections, reposts and shares.
 */

const {
    createQuestion,
    createAnswer,
    listAnswers,
    createSection,
    listSections,
    createRepost
} = require('./helper/socialContent.js');

const { er } = require('./helper/general.js');

module.exports = ({ $i } = {}) => ({
    "/content/heichelos/:heichel/questions": async vars => {
        if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
        return await createQuestion({ $i, heichelId: vars.heichel });
    },

    "/content/heichelos/:heichel/questions/:question/answers": async vars => {
        if ($i.request.method === 'GET') {
            return await listAnswers({ $i, heichelId: vars.heichel, questionId: vars.question });
        }
        if ($i.request.method === 'POST') {
            return await createAnswer({ $i, heichelId: vars.heichel, questionId: vars.question });
        }
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/content/heichelos/:heichel/posts/:post/sections": async vars => {
        if ($i.request.method === 'GET') {
            return await listSections({ $i, heichelId: vars.heichel, postId: vars.post });
        }
        if ($i.request.method === 'POST') {
            return await createSection({ $i, heichelId: vars.heichel, postId: vars.post });
        }
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/content/repost": async () => {
        if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
        return await createRepost({ $i });
    },

    "/content/share": async () => {
        if ($i.request.method !== 'POST') return er({ code: 'BAD_METHOD', message: 'Use POST.' });
        $i.$_POST.kind = $i.$_POST.kind || 'crossLinks';
        return await createRepost({ $i });
    }
});
