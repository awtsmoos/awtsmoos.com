// B"H
// --- Merkava VM Polyfills ---
// Provides simulated SharedArrayBuffer and Atomics for the VM environment.
// This allows "Atomics" to work in the VM even if the browser doesn't support them or security headers are missing.

(function(root) {
    root.MerkavaVM = root.MerkavaVM || {};

    class SharedArrayBufferSim {
        constructor(length) {
            this.byteLength = length;
            this._data = new Uint8Array(length);
        }
    }

    const AtomicsSim = {
        add(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = old + value;
            return old;
        },
        sub(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = old - value;
            return old;
        },
        and(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = old & value;
            return old;
        },
        or(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = old | value;
            return old;
        },
        xor(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = old ^ value;
            return old;
        },
        load(typedArray, index) {
            return typedArray[index];
        },
        store(typedArray, index, value) {
            typedArray[index] = value;
            return value;
        },
        exchange(typedArray, index, value) {
            const old = typedArray[index];
            typedArray[index] = value;
            return old;
        },
        compareExchange(typedArray, index, expectedValue, replacementValue) {
            const old = typedArray[index];
            if (old === expectedValue) {
                typedArray[index] = replacementValue;
            }
            return old;
        },
        // B"H - Wait/Notify are tricky in a synchronous simulator,
        // but we can provide the API surface.
        wait(typedArray, index, value, timeout) {
            if (typedArray[index] !== value) return 'not-equal';
            // In a real shared memory, we'd block. Here, we can't block the JS main thread easily.
            // We return 'ok' effectively simulating an instant wake-up.
            return 'ok'; 
        },
        notify(typedArray, index, count) {
            return count; // No actual threads to wake in this sim
        }
    };

    root.MerkavaVM.Polyfills = {
        SharedArrayBuffer: SharedArrayBufferSim,
        Atomics: AtomicsSim
    };

})(typeof self !== 'undefined' ? self : this);