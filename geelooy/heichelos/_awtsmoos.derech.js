/**
 * B"H
 * @module HeichelRouteGate
 * @description
 * Chapter 94: The Awtsmoos repairs the gate that the mobile styling pass shook.
 *
 * `/heichelos/:heichel/series/:series?view=series` is an old public covenant.
 * It must render the same Heichel app shell as `/heichelos/:heichel`, letting
 * the browser app read the series id from the path. The new mobile UI may dress
 * the page, but the old route may never fall into invalid-route JSON.
 */

module.exports = async $i => {
    await $i.use({
        "/": async () => await $i.$ga("_awtsmoos.index.html"),

        "/:heichel/series/:series/index": async vars => await renderHeichelShell(vars.heichel),
        "/:heichel/series/:series": async vars => await renderHeichelShell(vars.heichel),

        "/:heichel/delete": async v => await renderDelete(v),
        "/:heichel/edit": async () => await $i.$ga("_awtsmoos.submitToHeichel.html"),
        "/:heichel/submit": async v => await renderSubmit(v),
        "/:heichel/submitPost": async v => await $i.$ga("./heichel/submit/_awtsmoos.post.html", { heichel: v.heichel }),
        "/:heichel/post/:post": async vars => await renderPost(vars),
        "/:heichel/series/:series/:index": async vars => await renderIndexedPost(vars),
        "/:heichel": async v => await renderHeichelShell(v.heichel)
    });

    async function getHeichel(heichelId) {
        const hch = await $i.fetchAwtsmoos(`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}`);
        if (hch && !hch.error) hch.id = heichelId;
        return hch;
    }

    async function renderHeichelShell(heichelId) {
        const hch = await getHeichel(heichelId);
        if (hch) return await $i.$ga("./heichel/_awtsmoos.heichel.html", { heichel: hch });
        return await $i.$ga("_awtsmoos.heichelNotFound.html");
    }

    async function renderDelete(v) {
        const al = $i.$_GET.editingAlias;
        const doesOwn = await $i.fetchAwtsmoos(`/api/social/aliases/${al}/ownership`);
        if (!doesOwn || doesOwn.no) return `You don't own the alias ${al}, which is needed.`;
        const $sd = getDetails();
        $sd.parentSeriesId = $i.$_GET.parentSeriesId;
        $sd.contentID = $i.$_GET.id;
        $sd.type = $i.$_GET.type;
        $sd.baseE = `/api/social/heichelos/${v.heichel}`;
        $sd.id = $i.$_GET.id;
        $sd.aliasID = al;
        $sd.heichel = v.heichel;
        return await $i.$ga("_awtsmoos.deleteEntry.html", { heichel: v.heichel, aliasID: al, seriesId: $sd.parentSeriesId, $$sd: $sd });
    }

    async function renderSubmit(v) {
        const $sd = getDetails();
        const zr = $i.$_GET.series || $i.$_GET.seriesId;
        const n = $sd.type === "comment" ? "comments" : $sd.type === "post" ? "posts" : $sd.type === "series" ? "addNewSeries" : "n";
        $sd.endpoint = `/api/social/heichelos/${v.heichel}/${n}`;
        $sd.method = "POST";
        return await $i.$ga("_awtsmoos.submitToHeichel.html", { heichel: v.heichel, series: zr || "root", $$sd: $sd, endpointType: n });
    }

    async function renderPost(vars) {
        const post = await $i.fetchAwtsmoos(`/api/social/heichelos/${vars.heichel}/post/${encodeURIComponent(vars.post)}`);
        const heichelDetails = await $i.fetchAwtsmoos(`/api/social/heichelos/${encodeURIComponent(vars.heichel)}`);
        const aliasDetails = post?.author ? await $i.fetchAwtsmoos(`/api/social/aliases/${encodeURIComponent(post.author)}`) : null;
        if (aliasDetails && post?.author) aliasDetails.id = post.author;
        if (heichelDetails) heichelDetails.id = vars.heichel;
        if (post) {
            post.id = vars.post;
            post.heichel = heichelDetails;
        }
        return await $i.$ga("./post/_awtsmoos.post.html", { heichel: heichelDetails, post, alias: aliasDetails });
    }

    async function renderIndexedPost(vars) {
        return await $i.$ga("./post/_awtsmoos.post.html", { heichel: vars.heichel, parentSeries: vars.series, indexInSeries: vars.index });
    }

    function getDetails() {
        const t = $i.$_GET.type;
        const alias = $i.$_GET.editingAlias;
        const $sd = { alias, returnURL: $i.$_GET.returnURL };
        if (t === "post" || t === "series") {
            $sd.type = t;
            $sd.ttitle = t[0].toUpperCase() + t.substring(1);
            $sd.tdesc = t === "post" ? "content" : "description";
        } else if (t === "comment") {
            $sd.parentType = $i.$_GET.parentType;
            $sd.parentId = $i.$_GET.parentId;
            $sd.type = "comment";
            $sd.ttitle = "Comment";
            $sd.tdesc = "content";
        }
        return $sd;
    }
};
