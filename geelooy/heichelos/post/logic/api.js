//B"H
/**
 * API endpoints and initial data loading for the Post Reader.
 * Dedicated to the Awtsmoos who provides the flow of information.
 */

export async function fetchAwtsmoos(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
}

export async function loadInitial() {
    const myPath = location.pathname.split("/").filter(Boolean);
    const seriesId = myPath[myPath.length - 2];
    const postIdx = myPath[myPath.length - 1];
    const heichel = myPath[1];
    
    const series = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/details`);
    const postId = series.posts[postIdx];
    const post = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/post/${postId}`);
    
    window.post = post;
    window.series = series;

    const breadcrumb = await fetchAwtsmoos(`/api/social/heichelos/${heichel}/series/${seriesId}/breadcrumb`);
    window.breadcrumb = breadcrumb;
    
    if (document.querySelector("title")) {
        document.querySelector("title").innerText = `${series.prateem.name} | ${post.title}`;
    }
    
    return { post, series, heichel, seriesId, indexInSeries: parseInt(postIdx) };
}