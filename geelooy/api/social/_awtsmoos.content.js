//B"H
/**
 * @module SocialContentRoutes
 * @description
 * Chapter 453: Content routes reject broken section vessels at the gate.
 *
 * A malformed `sections` string should never become a silent empty array. The
 * stress harness exposed that false success, so post/question/answer creation
 * now validates supplied section JSON before writing.
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
function body($i) { return { ...($i.$_GET || {}), ...($i.$_POST || {}) }; }
function answerSeries($i) {
    const b = body($i);
    return b.seriesId || b.series || 'root';
}
function validateSections($i) {
    const b = body($i);
    const raw = b.sections || b.verses;
    if (raw === undefined || raw === null || raw === '') return null;
    if (Array.isArray(raw)) return null;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return er({ code: 'BAD_SECTIONS', message: 'sections must be a JSON array.' });
        return null;
    } catch (error) {
        return er({ code: 'BAD_SECTIONS_JSON', message: 'sections must be valid JSON.', details: String(error.message || error) });
    }
}

module.exports = ({ $i } = {}) => ({
    "/content/heichelos/:heichel/posts": async vars => {
        const bad = needs($i.request.method, 'POST') || validateSections($i);
        if (bad) return bad;
        return await createPost({ $i, heichelId: vars.heichel });
    },
    "/content/heichelos/:heichel/questions": async vars => {
        const bad = needs($i.request.method, 'POST') || validateSections($i);
        if (bad) return bad;
        return await createQuestion({ $i, heichelId: vars.heichel });
    },
    "/content/heichelos/:heichel/questions/:question/answers": async vars => {
        if ($i.request.method === 'GET') return await listAnswers({ $i, heichelId: vars.heichel, questionId: vars.question, seriesId: answerSeries($i) });
        if ($i.request.method === 'POST') {
            const bad = validateSections($i);
            if (bad) return bad;
            return await createAnswer({ $i, heichelId: vars.heichel, questionId: vars.question });
        }
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
