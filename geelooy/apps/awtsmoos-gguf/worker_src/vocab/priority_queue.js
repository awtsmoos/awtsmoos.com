
// B"H
export const PriorityQueueSource = () => {
    self.PriorityQueue = class PriorityQueue {
        constructor(compareFn) {
            this.heap = [];
            this.compare = compareFn || ((a, b) => a - b);
        }

        push(item) {
            this.heap.push(item);
            this._siftUp();
        }

        pop() {
            if (this.size() === 0) return null;
            const top = this.heap[0];
            const bottom = this.heap.pop();
            if (this.size() > 0) {
                this.heap[0] = bottom;
                this._siftDown();
            }
            return top;
        }

        size() {
            return this.heap.length;
        }

        isEmpty() {
            return this.heap.length === 0;
        }

        _siftUp() {
            let node = this.heap.length - 1;
            while (node > 0) {
                const parent = (node - 1) >>> 1;
                if (this.compare(this.heap[node], this.heap[parent]) > 0) {
                    this._swap(node, parent);
                    node = parent;
                } else {
                    break;
                }
            }
        }

        _siftDown() {
            let node = 0;
            while ((node * 2 + 1) < this.heap.length) {
                let left = (node * 2) + 1;
                let right = left + 1;
                let largest = left;

                if (right < this.heap.length && this.compare(this.heap[right], this.heap[left]) > 0) {
                    largest = right;
                }

                if (this.compare(this.heap[largest], this.heap[node]) > 0) {
                    this._swap(node, largest);
                    node = largest;
                } else {
                    break;
                }
            }
        }

        _swap(i, j) {
            const temp = this.heap[i];
            this.heap[i] = this.heap[j];
            this.heap[j] = temp;
        }
    };
};
