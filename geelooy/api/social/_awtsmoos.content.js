//B"H
/**
 * Quora-like and feed-like content routes: posts, questions, answers, sections,
 * reposts and shares. The Awtsmoos lets the editor and Node stress tests use
 * one direct social content API.
 *
 * Chapter 107: An answer born in a corridor must be found in that corridor.
 * The route now carries `seriesId` from query/body into answer listing, so a
 * non-root question does not vanish behind the root gate.
 */

const {
    createPost,
    createQuestion,
    createAnswer,
    listAnswers,
    createSection,
    listSections,
    createRepost
} = require('./helper/socialContent.js');

const { er } = require('./helper/general.js');

function needs(method, expected) {
    return method === expected ? null : er({ code: 'BAD_METHOD', message: `Use ${expected}.` });
}

function answerSeries($i) {
    return $i.$_GET?.seriesId || $i.$_GET?.series || $i.$_POST?.seriesId || $i.$_POST?.series || 'root';
}

module.exports = ({ $i } = {}) => ({
    "/content/heichelos/:heichel/posts": async vars => {
        const bad = needs($i.request.method, 'POST');
        if (bad) return bad;
        return await createPost({ $i, heichelId: vars.heichel });
    },

    "/content/heichelos/:heichel/questions": async vars => {
        const bad = needs($i.request.method, 'POST');
        if (bad) return bad;
        return await createQuestion({ $i, heichelId: vars.heichel });
    },

    "/content/heichelos/:heichel/questions/:question/answers": async vars => {
        if ($i.request.method === 'GET') return await listAnswers({
            $i,
            heichelId: vars.heichel,
            questionId: vars.question,
            seriesId: answerSeries($i)
        });
        if ($i.request.method === 'POST') return await createAnswer({ $i, heichelId: vars.heichel, questionId: vars.question });
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/content/heichelos/:heichel/posts/:post/sections": async vars => {
        if ($i.request.method === 'GET') return await listSections({ $i, heichelId: vars.heichel, postId: vars.post });
        if ($i.request.method === 'POST') return await createSection({ $i, heichelId: vars.heichel, postId: vars.post });
        return er({ code: 'BAD_METHOD', message: 'Use GET or POST.' });
    },

    "/content/repost": async () => {
        const bad = needs($i.request.method, 'POST');
        if (bad) return bad;
        return await createRepost({ $i });
    },

    "/content/share": async () => {
        const bad = needs($i.request.method, 'POST');
        if (bad) return bad;
        $i.$_POST.kind = $i.$_POST.kind || 'crossLinks';
        return await createRepost({ $i });
    }
});
