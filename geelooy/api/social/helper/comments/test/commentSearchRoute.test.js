// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const searchRoutes = require("../routes/search.js");
const { indexCommentSearchRecord } = require("../commentAwtsmoosDbBridge.js");

(async () => {
    const $i = {
        request: { method: "GET" },
        $_GET: { seriesId: "s1", q: "route-search" },
        db: {
            directory: fs.mkdtempSync(path.join(os.tmpdir(), "awts-comment-route-"))
        }
    };

    await indexCommentSearchRecord({
        $i,
        comment: {
            id: "route-comment",
            author: "aliasA",
            content: "This route-search comment must be found.",
            dayuh: { verseSection: "root" }
        },
        heichelId: "h1",
        seriesId: "s1",
        parentId: "post1",
        parentType: "post",
        postId: "post1",
        aliasId: "aliasA"
    });

    const routes = searchRoutes({ $i });
    const result = await routes["/heichelos/:heichel/comments/search"]({ heichel: "h1" });
    assert.equal(result.success.length, 1);
    assert.equal(result.success[0].record.id, "route-comment");

    $i.$_GET = { q: "route-search" };
    const missing = await routes["/heichelos/:heichel/comments/search"]({ heichel: "h1" });
    assert.equal(missing.error.code, "MISSING_PARAMS");

    $i.request.method = "POST";
    $i.$_GET = { seriesId: "s1", q: "route-search" };
    const wrongMethod = await routes["/heichelos/:heichel/comments/search"]({ heichel: "h1" });
    assert.equal(wrongMethod.error.code, "GET_ONLY");

    console.log('B"H commentSearchRoute.test passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
