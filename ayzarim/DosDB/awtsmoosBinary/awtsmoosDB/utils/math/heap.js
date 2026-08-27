
// B"H
class BinaryHeap {
    constructor(scoreFn) { this.content = []; this.scoreFn = scoreFn; }
    push(element) { this.content.push(element); this.bubbleUp(this.content.length - 1); }
    pop() {
        const result = this.content[0], end = this.content.pop();
        if (this.content.length > 0) { this.content[0] = end; this.sinkDown(0); }
        return result;
    }
    size() { return this.content.length; }
    bubbleUp(n) {
        const element = this.content[n], score = this.scoreFn(element);
        while (n > 0) {
            const parentN = Math.floor((n + 1) / 2) - 1, parent = this.content[parentN];
            if (score >= this.scoreFn(parent)) break;
            this.content[parentN] = element; this.content[n] = parent; n = parentN;
        }
    }
    sinkDown(n) {
        const length = this.content.length, element = this.content[n], elemScore = this.scoreFn(element);
        while (true) {
            const child2N = (n + 1) * 2, child1N = child2N - 1;
            let swap = null;
            if (child1N < length) { const child1 = this.content[child1N]; if (this.scoreFn(child1) < elemScore) swap = child1N; }
            if (child2N < length) { const child2 = this.content[child2N], child2Score = this.scoreFn(child2), scoreToCompare = (swap === null) ? elemScore : this.scoreFn(this.content[child1N]); if (child2Score < scoreToCompare) swap = child2N; }
            if (swap === null) break;
            this.content[n] = this.content[swap]; this.content[swap] = element; n = swap;
        }
    }
}
module.exports = BinaryHeap;
