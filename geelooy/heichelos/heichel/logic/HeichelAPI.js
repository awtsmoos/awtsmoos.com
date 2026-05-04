
/**
 * B"H
 * @module HeichelAPI
 * @description
 * The 10 statements of creation in Bereishis are physically inside all 
 * creations. As the verse says, "Forever, Lord, Your Word stands in the heavens."
 * This module is the Kav (Line) that reaches into those heavens to pull down 
 * the exact data (posts, series, breadcrumbs) needed to manifest reality here.
 */

export class HeichelAPI {
    static async getHeichel(id) {
        try {
            const rt = await fetch(`/api/social/heichelos/${id}`);
            return await rt.json();
        } catch(e) {
            return null;
        }
    }

    static async doesOwn(alias, heichelID) {
        if(!alias) return false;
        try {
            const res = await fetch(`/api/social/alias/${alias}/heichelos/${heichelID}/ownership`);
            const data = await res.json();
            return !!data.yes;
        } catch(e) { return false; }
    }

    static async getBreadcrumb(heichelID, series) {
        try {
            const res = await fetch(`/api/social/heichelos/${heichelID}/series/${series}/breadcrumb`);
            return await res.json();
        } catch(e) { return[]; }
    }

    static async getSeriesDetails(heichelID, series) {
        const res = await fetch(`/api/social/heichelos/${heichelID}/series/${series}/details`);
        return await res.json();
    }

    static async getPostsDetails(heichelID, seriesId, propertyMap) {
        const params = new URLSearchParams({
            seriesId: seriesId,
            propertyMap: JSON.stringify(propertyMap)
        });
        const res = await fetch(`/api/social/heichelos/${heichelID}/posts/details?${params}`);
        return await res.json();
    }

    static async getSubSeriesDetails(heichelID, seriesId, subSeriesIds) {
        const res = await fetch(`/api/social/heichelos/${heichelID}/series/${seriesId}/details`, {
            method: "POST",
            body: new URLSearchParams({
                seriesIds: JSON.stringify(subSeriesIds)
            })
        });
        return await res.json();
    }
}
