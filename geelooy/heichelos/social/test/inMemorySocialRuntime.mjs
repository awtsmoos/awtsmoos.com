// B"H
/**
 * Chapter 111: A server made of memory, but judged like stone.
 * This runtime lets the public social API fight real create/edit/delete flows:
 * users, ownership, questions, answers, comments, replies, media, references,
 * sections, series, copies, remixes, and deletion scars.
 */
export function createInMemorySocialRuntime() {
    const db = makeDb();
    const ids = { post: 0, section: 0, comment: 0, ref: 0, media: 0, series: 0, embed: 0 };
    const next = key => `${key}_${++ids[key]}`;
    const ok = (data, status = 200) => response(status, { ok: true, data, error: null });
    const fail = (status, error) => response(status, { ok: false, data: null, error });

    function fetcher(url, options = {}) {
        try {
            const currentUser = readUser(options);
            const method = options.method || 'GET';
            const payload = readBody(options);
            const path = new URL(url, 'http://awtsmoos').pathname.replace('/api/social', '');
            const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
            if (method === 'POST' && path === '/posts') return createPost(currentUser, payload);
            if (parts[0] === 'posts') return routePosts(parts, method, payload, currentUser);
            if (parts[0] === 'sections') return routeSections(parts, method, payload, currentUser);
            if (parts[0] === 'comments') return routeComments(parts, method, payload, currentUser);
            if (parts[0] === 'references') return routeReferences(parts, method);
            if (parts[0] === 'media') return routeMedia(parts, method, payload);
            if (parts[0] === 'series') return routeSeries(parts, method, payload, currentUser);
            if (parts[0] === 'questions') return routeQuestions(parts, method, payload, currentUser);
            if (parts[0] === 'answers') return routeAnswers(parts, method);
            if (parts[0] === 'embeds') return routeEmbeds(parts, method, payload, currentUser);
            return fail(404, `unrouted ${method} ${path}`);
        } catch (error) {
            return fail(500, error.message || 'runtime exploded');
        }
    }

    function createPost(author, body) {
        const id = body.id || next('post');
        const post = { sections: [], comments: [], references: [], attachments: [], seriesIds: [], ...body, id, author };
        db.posts.set(id, post);
        return ok(post, 201);
    }

    function routePosts(parts, method, body, user) {
        const item = db.posts.get(parts[1]);
        if (!item) return fail(404, 'post missing');
        if (parts.length === 2 && method === 'GET') return ok(item);
        if (parts.length === 2 && method === 'PUT') return owned(item, user) || update(item, body);
        if (parts.length === 2 && method === 'DELETE') return owned(item, user) || deletePost(item);
        return routePostChildren(item, parts.slice(2), method, body, user);
    }

    function routePostChildren(post, child, method, body, user) {
        const key = child[0];
        if (key === 'sections' && method === 'GET') return ok(post.sections.map(id => db.sections.get(id)).filter(Boolean));
        if (key === 'sections' && method === 'POST') return owned(post, user) || addSection(post, body);
        if (key === 'comments' && method === 'GET') return ok(post.comments.map(id => db.comments.get(id)).filter(Boolean));
        if (key === 'comments' && method === 'POST') return addComment(post, body, user, null);
        if (key === 'references' && method === 'GET') return ok(post.references.map(id => db.refs.get(id)).filter(Boolean));
        if (key === 'references' && method === 'POST') return addReference(post, body);
        if (key === 'reference-graph' && method === 'GET') return ok([...db.refs.values()].filter(ref => ref.fromId === post.id || ref.toId === post.id));
        if (key === 'attachments' && method === 'GET') return ok(post.attachments.map(id => db.media.get(id)).filter(Boolean));
        if (key === 'attachments' && method === 'POST') return owned(post, user) || addMedia(post, body);
        if (key === 'verse-scan' && method === 'GET') return scan(post, /verse|Genesis|light|בראשית/i);
        if (key === 'source-scan' && method === 'GET') return scan(post, /source|quote|citation|scan/i);
        if (key === 'copy-to-series' && method === 'POST') return copyPost(post, body.seriesId, user, 'copy');
        if (key === 'remix-to-series' && method === 'POST') return copyPost(post, body.seriesId, user, 'remix');
        return fail(404, 'post child missing');
    }

    function addSection(post, body) {
        const section = { id: body.id || next('section'), postId: post.id, ...body };
        db.sections.set(section.id, section);
        post.sections.push(section.id);
        return ok(section, 201);
    }

    function routeSections(parts, method, body, user) {
        const section = db.sections.get(parts[1]);
        if (!section) return fail(404, 'section missing');
        const parent = db.posts.get(section.postId);
        if (method === 'GET') return ok(section);
        if (method === 'PUT') return owned(parent, user) || update(section, body);
        if (method === 'DELETE') return owned(parent, user) || removeSection(section, parent);
        return fail(405, 'bad section method');
    }

    function addComment(post, body, author, parentId) {
        const comment = { id: body.id || next('comment'), postId: post.id, parentId, replies: [], ...body, author };
        db.comments.set(comment.id, comment);
        if (parentId) db.comments.get(parentId).replies.push(comment.id);
        else post.comments.push(comment.id);
        return ok(comment, 201);
    }

    function routeComments(parts, method, body, user) {
        const comment = db.comments.get(parts[1]);
        if (!comment) return fail(404, 'comment missing');
        if (parts[2] === 'replies' && method === 'GET') return ok(comment.replies.map(id => db.comments.get(id)).filter(Boolean));
        if (parts[2] === 'replies' && method === 'POST') return addComment(db.posts.get(comment.postId), body, user, comment.id);
        if (method === 'GET') return ok(comment);
        if (method === 'PUT') return owned(comment, user) || update(comment, body);
        if (method === 'DELETE') return owned(comment, user) || removeComment(comment);
        return fail(405, 'bad comment method');
    }

    function addReference(post, body) {
        const ref = { id: body.id || next('ref'), fromId: post.id, ...body };
        db.refs.set(ref.id, ref);
        post.references.push(ref.id);
        return ok(ref, 201);
    }

    function routeReferences(parts, method) {
        if (method !== 'DELETE') return fail(405, 'bad reference method');
        return removeMap(db.refs, parts[1], 'reference');
    }

    function addMedia(post, body) {
        const media = { id: body.id || next('media'), postId: post.id, ...body };
        db.media.set(media.id, media);
        post.attachments.push(media.id);
        return ok(media, 201);
    }

    function routeMedia(parts, method, body) {
        const media = db.media.get(parts[1]);
        if (!media) return fail(404, 'media missing');
        if (method === 'DELETE') return removeMap(db.media, media.id, 'media');
        if (parts[2] === 'audio-manifest') return ok({ id: media.id, src: media.src, cues: media.cues || [] });
        if (parts[2] === 'waveform') return ok({ id: media.id, samples: [0, 1, 0.35, 0.9, 0.2, 0.7] });
        if (parts[2] === 'slideshow-manifest') return ok({ id: media.id, frames: media.frames || [] });
        if (parts[2] === 'cues' && method === 'POST') return update(media, { cues: [...(media.cues || []), body] });
        return fail(404, 'media route missing');
    }

    function routeSeries(parts, method, body, user) {
        if (method === 'POST' && parts.length === 1) {
            const series = { id: body.id || next('series'), author: user, postIds: [], subseriesIds: [], references: [], ...body };
            db.series.set(series.id, series);
            return ok(series, 201);
        }
        const series = db.series.get(parts[1]);
        if (!series) return fail(404, 'series missing');
        if (method === 'GET' && parts.length === 2) return ok(series);
        if (method === 'PUT') return owned(series, user) || update(series, body);
        if (method === 'DELETE') return owned(series, user) || removeMap(db.series, series.id, 'series');
        if (parts[2] === 'posts' && method === 'GET') return ok(series.postIds.map(id => db.posts.get(id)).filter(Boolean));
        if (parts[2] === 'posts' && method === 'POST') return owned(series, user) || pushUnique(series.postIds, body.postId, series);
        if (parts[2] === 'subseries' && method === 'POST') return owned(series, user) || pushUnique(series.subseriesIds, body.seriesId, series);
        if (parts[2] === 'reorder' && method === 'POST') return owned(series, user) || update(series, { postIds: body.ids || [] });
        if (parts[2] === 'references' && method === 'GET') return ok(series.references);
        return fail(404, 'series route missing');
    }

    function routeQuestions(parts, method, body, user) {
        if (method === 'POST' && parts.length === 1) {
            const result = createPost(user, { ...body, kind: 'question' });
            const question = db.posts.get(JSON.parse(result.__body).data.id);
            db.questions.set(question.id, []);
            return result;
        }
        const answers = db.questions.get(parts[1]);
        if (!answers) return fail(404, 'question missing');
        if (method === 'GET' && parts.length === 2) return ok(db.posts.get(parts[1]));
        if (parts[2] === 'answers' && method === 'GET') return ok(answers.map(id => db.posts.get(id)).filter(Boolean));
        if (parts[2] === 'answers' && method === 'POST') { answers.push(body.postId); return ok({ questionId: parts[1], answerPostId: body.postId }); }
        if (parts[2] === 'accepted-answer' && method === 'POST') return update(db.posts.get(parts[1]), { acceptedAnswerId: body.postId });
        return fail(404, 'question route missing');
    }

    function routeAnswers(parts, method) {
        const answer = db.posts.get(parts[1]);
        if (!answer) return fail(404, 'answer missing');
        if (parts[2] === 'comments' && method === 'GET') return ok(answer.comments.map(id => db.comments.get(id)).filter(Boolean));
        return fail(404, 'answer route missing');
    }

    function routeEmbeds(parts, method, body, user) {
        if (method === 'POST') {
            const embed = { id: body.id || next('embed'), author: user, route: parts[1], ...body };
            db.embeds.set(embed.id, embed);
            return ok(embed, 201);
        }
        const embed = db.embeds.get(parts[1]);
        if (!embed) return fail(404, 'embed missing');
        if (method === 'GET') return ok(embed);
        if (method === 'PUT') return owned(embed, user) || update(embed, body);
        if (method === 'DELETE') return owned(embed, user) || removeMap(db.embeds, embed.id, 'embed');
        return fail(405, 'bad embed method');
    }

    function copyPost(post, seriesId, author, copyKind) {
        const clone = { ...post, id: next('post'), author, kind: 'remix', copiedFrom: { postId: post.id, kind: copyKind }, seriesIds: [seriesId] };
        db.posts.set(clone.id, clone);
        const series = db.series.get(seriesId);
        if (series) series.postIds.push(clone.id);
        return ok(clone, 201);
    }

    function response(status, body) {
        return { ok: status < 400, status, statusText: body.error || 'OK', __body: JSON.stringify(body), text: async () => JSON.stringify(body) };
    }
    function makeDb() { return { posts: new Map(), sections: new Map(), comments: new Map(), refs: new Map(), media: new Map(), series: new Map(), questions: new Map(), embeds: new Map() }; }
    function readUser(options) { return options.headers?.['x-user'] || options.headers?.['X-User'] || 'anonymous'; }
    function readBody(options) { try { return JSON.parse(options.body || '{}'); } catch { return {}; } }
    function owned(item, user) { if (!item) return fail(404, 'missing'); return item.author === user ? null : fail(403, 'forbidden'); }
    function update(item, body) { Object.assign(item, body); return ok(item); }
    function pushUnique(list, value, result) { if (!list.includes(value)) list.push(value); return ok(result); }
    function scan(post, pattern) { return ok(post.sections.map(id => db.sections.get(id)).filter(section => pattern.test(`${section.kind} ${section.text}`))); }
    function removeMap(map, id, label) { return map.delete(id) ? ok({ id, deleted: true }) : fail(404, `${label} missing`); }
    function removeSection(section, post) { db.sections.delete(section.id); post.sections = post.sections.filter(id => id !== section.id); return ok({ id: section.id, deleted: true }); }
    function removeComment(comment) { db.comments.delete(comment.id); const post = db.posts.get(comment.postId); if (post) post.comments = post.comments.filter(id => id !== comment.id); const parent = db.comments.get(comment.parentId); if (parent) parent.replies = parent.replies.filter(id => id !== comment.id); return ok({ id: comment.id, deleted: true }); }
    function deletePost(post) { db.posts.delete(post.id); return ok({ id: post.id, deleted: true }); }

    return { db, fetcher };
}
