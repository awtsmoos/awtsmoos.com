// B"H
export class LensVocabulary{static get(name='normal'){return this.map[name]||this.map.normal;}static map={wide:{name:'wide',zoomBias:.82,parallax:'strong'},normal:{name:'normal',zoomBias:1,parallax:'medium'},portrait:{name:'portrait',zoomBias:1.16,parallax:'soft'},telephoto:{name:'telephoto',zoomBias:1.28,parallax:'flat'},macro:{name:'macro',zoomBias:1.42,parallax:'flat'}};}
