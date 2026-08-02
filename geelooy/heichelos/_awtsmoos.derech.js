/**
 * B"H
 * @module HeichelRouteGate
 * @description
 * Chapter 580: A public link arrives with one final name, and the gate no
 * longer mistakes that living post ID for a numbered place in the series.
 * Numeric endings still open indexed entries; named endings open the post.
 */
module.exports = async $i => {
	await $i.use({
		"/": async () => await $i.$ga("_awtsmoos.index.html"),
		"/submit": async () => await renderGlobalSubmit(),
		"/:heichel/series/root/error": async vars => await renderHeichelShell(vars.heichel),
		"/:heichel/series/:series/index": async vars => await renderHeichelShell(vars.heichel),
		"/:heichel/series/:series": async vars => await renderHeichelShell(vars.heichel),
		"/:heichel/delete": async vars => await renderDelete(vars),
		"/:heichel/edit": async () => await $i.$ga("_awtsmoos.submitToHeichel.html"),
		"/:heichel/submit": async vars => await renderSubmit(vars.heichel),
		"/:heichel/submitPost": async vars => await $i.$ga("./heichel/submit/_awtsmoos.post.html", {
			heichel: vars.heichel
		}),
		"/:heichel/post/:post": async vars => await renderPost(vars),
		"/:heichel/series/:series/post/:post": async vars => await renderSeriesPost(vars),
		"/:heichel/series/:series/:entry": async vars => await renderSeriesEntry(vars),
		"/:heichel": async vars => await renderHeichelShell(vars.heichel)
	});

	function queryMap(mapName, map) {
		return new URLSearchParams({ [mapName]: JSON.stringify(map) }).toString();
	}

	function heichelFields() {
		return queryMap("propertyMap", {
			id: true,
			name: true,
			title: true,
			description: true,
			author: true,
			createdAt: true,
			dayuh: true
		});
	}

	function postFields() {
		return queryMap("propertyMap", {
			id: true,
			title: true,
			content: true,
			author: true,
			parentSeriesId: true,
			seriesId: true,
			createdAt: true,
			dayuh: true
		});
	}

	async function getHeichel(heichelId) {
		const heichel = await $i.fetchAwtsmoos(
			`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`
		);
		if (heichel && !heichel.error) {
			heichel.id = heichelId;
		}
		return heichel;
	}

	async function renderHeichelShell(heichelId) {
		const heichel = await getHeichel(heichelId);
		if (heichel) {
			return await $i.$ga("./heichel/_awtsmoos.heichel.html", { heichel });
		}
		return await $i.$ga("_awtsmoos.heichelNotFound.html");
	}

	async function renderGlobalSubmit() {
		const target = $i.$_GET.heichel || $i.$_GET.heichelId || "ikar";
		return await renderSubmit(target);
	}

	async function renderDelete(vars) {
		const aliasId = $i.$_GET.editingAlias;
		const ownership = await $i.fetchAwtsmoos(`/api/social/aliases/${aliasId}/ownership`);
		if (!ownership || ownership.no) {
			return `You don't own the alias ${aliasId}, which is needed.`;
		}
		const details = getDetails();
		details.parentSeriesId = $i.$_GET.parentSeriesId;
		details.contentID = $i.$_GET.id;
		details.type = $i.$_GET.type;
		details.baseE = `/api/social/heichelos/${vars.heichel}`;
		details.id = $i.$_GET.id;
		details.aliasID = aliasId;
		details.heichel = vars.heichel;
		return await $i.$ga("_awtsmoos.deleteEntry.html", {
			heichel: vars.heichel,
			aliasID: aliasId,
			seriesId: details.parentSeriesId,
			$$sd: details
		});
	}

	async function renderSubmit(heichelId) {
		const details = getDetails();
		const seriesId = $i.$_GET.series || $i.$_GET.seriesId;
		const endpointType = details.type === "comment"
			? "comments"
			: details.type === "post"
				? "posts"
				: details.type === "series"
					? "addNewSeries"
					: "n";
		details.endpoint = `/api/social/heichelos/${heichelId}/${endpointType}`;
		details.method = "POST";
		return await $i.$ga("_awtsmoos.submitToHeichel.html", {
			heichel: heichelId,
			series: seriesId || "root",
			$$sd: details,
			endpointType
		});
	}

	async function renderPost(vars) {
		const post = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${vars.heichel}/post/${encodeURIComponent(vars.post)}?${postFields()}`
		);
		const heichelDetails = await $i.fetchAwtsmoos(
			`/api/social/heichelos/${encodeURIComponent(vars.heichel)}?${heichelFields()}`
		);
		const aliasDetails = post?.author
			? await $i.fetchAwtsmoos(
				`/api/social/aliases/${encodeURIComponent(post.author)}?${queryMap("propertyMap", {
					id: true,
					name: true,
					title: true,
					description: true
				})}`
			)
			: null;
		if (aliasDetails && post?.author) {
			aliasDetails.id = post.author;
		}
		if (heichelDetails) {
			heichelDetails.id = vars.heichel;
		}
		if (post) {
			post.id = vars.post;
			post.heichel = heichelDetails;
		}
		return await $i.$ga("./post/_awtsmoos.post.html", {
			heichel: heichelDetails,
			post,
			alias: aliasDetails
		});
	}

	async function renderSeriesPost(vars) {
		return await $i.$ga("./post/_awtsmoos.post.html", {
			heichel: vars.heichel,
			parentSeries: vars.series,
			postId: vars.post
		});
	}

	async function renderSeriesEntry(vars) {
		if (vars.series === "root" && vars.entry === "error") {
			return await renderHeichelShell(vars.heichel);
		}
		if (/^\d+$/.test(vars.entry)) {
			return await $i.$ga("./post/_awtsmoos.post.html", {
				heichel: vars.heichel,
				parentSeries: vars.series,
				indexInSeries: vars.entry
			});
		}
		return await $i.$ga("./post/_awtsmoos.post.html", {
			heichel: vars.heichel,
			parentSeries: vars.series,
			postId: vars.entry
		});
	}

	function getDetails() {
		const type = $i.$_GET.type;
		const alias = $i.$_GET.editingAlias;
		const details = {
			alias,
			returnURL: $i.$_GET.returnURL
		};
		if (type === "post" || type === "series") {
			details.type = type;
			details.ttitle = type[0].toUpperCase() + type.substring(1);
			details.tdesc = type === "post" ? "content" : "description";
		} else if (type === "comment") {
			details.parentType = $i.$_GET.parentType;
			details.parentId = $i.$_GET.parentId;
			details.type = "comment";
			details.ttitle = "Comment";
			details.tdesc = "content";
		}
		return details;
	}
};
