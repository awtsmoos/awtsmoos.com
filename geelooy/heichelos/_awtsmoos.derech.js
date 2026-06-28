/**
 * B"H
 * @module HeichelRouteGate
 * @description Chapter 642: the route gate no longer lets `/series/root/error`
 * become a ghost post. Root/error is a corrupted shell URL and returns to the
 * living Heichel dashboard while true numeric/indexed posts still open readers.
 */
module.exports = async $i => {
  await $i.use({
    "/": async () => await $i.$ga("_awtsmoos.index.html"),
    "/:heichel/series/root/error": async vars => await renderHeichelShell(vars.heichel),
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
  function qp(mapName, map) { return new URLSearchParams({ [mapName]: JSON.stringify(map) }).toString(); }
  function heichelFields() { return qp("propertyMap", { id: true, name: true, title: true, description: true, author: true, createdAt: true, dayuh: true }); }
  function postFields() { return qp("propertyMap", { id: true, title: true, content: true, author: true, parentSeriesId: true, seriesId: true, createdAt: true, dayuh: true }); }
  async function getHeichel(heichelId) {
    const hch = await $i.fetchAwtsmoos(`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`);
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
    Object.assign($sd, { parentSeriesId: $i.$_GET.parentSeriesId, contentID: $i.$_GET.id, type: $i.$_GET.type, baseE: `/api/social/heichelos/${v.heichel}`, id: $i.$_GET.id, aliasID: al, heichel: v.heichel });
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
    const post = await $i.fetchAwtsmoos(`/api/social/heichelos/${vars.heichel}/post/${encodeURIComponent(vars.post)}?${postFields()}`);
    const heichelDetails = await $i.fetchAwtsmoos(`/api/social/heichelos/${encodeURIComponent(vars.heichel)}?${heichelFields()}`);
    const aliasDetails = post?.author ? await $i.fetchAwtsmoos(`/api/social/aliases/${encodeURIComponent(post.author)}?${qp("propertyMap", { id: true, name: true, title: true, description: true })}`) : null;
    if (aliasDetails && post?.author) aliasDetails.id = post.author;
    if (heichelDetails) heichelDetails.id = vars.heichel;
    if (post) { post.id = vars.post; post.heichel = heichelDetails; }
    return await $i.$ga("./post/_awtsmoos.post.html", { heichel: heichelDetails, post, alias: aliasDetails });
  }
  async function renderIndexedPost(vars) {
    if (vars.series === "root" && !/^\d+$/.test(String(vars.index || ""))) return renderHeichelShell(vars.heichel);
    return await $i.$ga("./post/_awtsmoos.post.html", { heichel: vars.heichel, parentSeries: vars.series, indexInSeries: vars.index });
  }
  function getDetails() {
    const t = $i.$_GET.type;
    const $sd = { alias: $i.$_GET.editingAlias, returnURL: $i.$_GET.returnURL };
    if (t === "post" || t === "series") Object.assign($sd, { type: t, ttitle: t[0].toUpperCase() + t.substring(1), tdesc: t === "post" ? "content" : "description" });
    else if (t === "comment") Object.assign($sd, { parentType: $i.$_GET.parentType, parentId: $i.$_GET.parentId, type: "comment", ttitle: "Comment", tdesc: "content" });
    return $sd;
  }
};
