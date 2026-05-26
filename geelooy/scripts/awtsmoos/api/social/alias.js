//B"H
export {
    get,
    getAliasOwnership,
    getAliasDetails,

    getPostsOfAliasInSeries,
    getHeichelosOfPostsOfAlias,
    getSeriesOfPostsOfAliasInHeichel,
    getHeichelosOfCommentsOfAlias,
    getCommentSeriesOfAliasInHeichel,
};

function encodePathSegment(value) {
    return encodeURIComponent(String(value || ""));
}

async function get(pth, opts) {
    try {
        const response = await fetch(pth, opts);
        const text = await response.text();
        let json = null;
        if (text) {
            try {
                json = JSON.parse(text);
            } catch (e) {
                return {
                    error: {
                        code: "INVALID_JSON",
                        message: e.message || "Invalid JSON response",
                        raw: text
                    }
                };
            }
        }

        if (!response.ok) {
            return {
                error: {
                    code: response.status,
                    message: response.statusText,
                    details: json
                }
            };
        }

        return json;
    } catch (e) {
        return {
            error: {
                message: e.message || "Fetch failed",
                stack: e.stack
            }
        };
    }
}

async function getAliasOwnership(alias) {
    return await get(
        `/api/social/alias/${encodePathSegment(alias)}/ownership`
    );
}

async function getAliasDetails(alias) {
    return await get(
        `/api/social/alias/${encodePathSegment(alias)}/details`
    );
}

async function getPostsOfAliasInSeries({
    aliasId,
    heichelId,
    seriesId,
    path
}) {
    return await get(
        `/api/social/aliases/${encodePathSegment(aliasId)}/postsMade/heichel/${encodePathSegment(heichelId)}/pathToSeries/${btoa(encodeURIComponent(path || ""))}`
    );
}

async function getHeichelosOfPostsOfAlias({
    aliasId
}) {
    return await get(
        `/api/social/aliases/${encodePathSegment(aliasId)}/postsMade/heichelos`
    );
}

async function getSeriesOfPostsOfAliasInHeichel({
    aliasId,
    heichelId
}) {
    return await get(
        `/api/social/aliases/${encodePathSegment(aliasId)}/postsMade/heichel/${encodePathSegment(heichelId)}/series`
    );
}

async function getHeichelosOfCommentsOfAlias({
    aliasId
}) {
    return await get(
        `/api/social/aliases/${encodePathSegment(aliasId)}/commentsMade/heichelos`
    );
}

async function getCommentSeriesOfAliasInHeichel({
    aliasId,
    heichelId
}) {
    return await get(
        `/api/social/aliases/${encodePathSegment(aliasId)}/commentsMade/heichel/${encodePathSegment(heichelId)}/series`
    );
}
