
// B"H
/**
 * @file analysis.js
 * @description Synchronous Analytical Algorithms.
 */

class AlgoAnalysis {
    constructor(manager) {
        this.manager = manager;
    }

    pageRank(options = {}) {
        const damping = options.damping || 0.85;
        const iterations = options.iterations || 20;
        
        const { nodes, reverseAdj, adjList } = this.manager.query.projectGraphSync();
        
        let scores = new Map();
        const initialScore = 1.0 / nodes.length;
        nodes.forEach(n => scores.set(n, initialScore));
        
        for(let i=0; i<iterations; i++) {
            const newScores = new Map();
            let sinkScore = 0;
            
            for(const n of nodes) {
                const outDegree = (adjList.get(n) || []).length;
                if(outDegree === 0) {
                    sinkScore += scores.get(n);
                }
            }
            
            for(const n of nodes) {
                let rank = (1 - damping) / nodes.length;
                rank += (damping * sinkScore / nodes.length);
                
                const incoming = reverseAdj.get(n) || [];
                for(const src of incoming) {
                    const srcOut = (adjList.get(src) || []).length;
                    rank += damping * (scores.get(src) / srcOut);
                }
                newScores.set(n, rank);
            }
            scores = newScores;
        }
        
        const sorted = Array.from(scores.entries()).sort((a,b) => b[1] - a[1]);
        return sorted.map(([id, score]) => ({ id, score }));
    }
}

module.exports = AlgoAnalysis;
