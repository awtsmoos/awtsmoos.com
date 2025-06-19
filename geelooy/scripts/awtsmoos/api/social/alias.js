//B"H
export {
    get,
    getAliasOwnership,
    getAliasDetails,

    getPostsOfAliasInSeries,
    getHeichelosOfPostsOfAlias,
    getSeriesOfPostsOfAliasInHeichel,
    
}
async function get(pth, opts) {
    try {
        return await (
            await fetch(pth, opts)
        ).json()
    } catch(e) {
        return {
            error: {
                stack: e.stack,
                e
            }
        }
    }
}

async function getAliasOwnership(alias) {
    return await get(
        `/api/social/alias/${
            alias
        }/ownership`
    )
}

async function getAliasDetails(alias) {
    return await get(
        `/api/social/alias/${
            alias
        }/details`
    )
}


async function getPostsOfAliasInSeries({
    aliasId,
    heichelId,
    seriesId
}) {
    return await get(
        `/api/social/aliases/${
            aliasId
        }/postsMade/heichel/${
            heichelId   
        }/series/${
            seriesId
        }`
    )
}


async function getHeichelosOfPostsOfAlias({
    aliasId
}) {
    return await get(
        `/api/social/aliases/${
            aliasId
        }/postsMade/heichelos`
    )
}


async function getSeriesOfPostsOfAliasInHeichel({
    aliasId,
    heichelId
}) {
    return await get(
        `/api/social/aliases/${
            aliasId
        }/postsMade/heichel/${
            heichelId   
        }/series`
    )
}
