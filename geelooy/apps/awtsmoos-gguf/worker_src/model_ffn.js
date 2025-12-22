
// B"H
export const ModelFFNSource = () => {
    
    self.computeFFN = function(x, l, params, prefix) {
        const p = `blk.${l}.`;
        
        let w_g = self.loadWeight(`${p}ffn_gate.weight`);
        let w_u = self.loadWeight(`${p}ffn_up.weight`);
        let w_d = self.loadWeight(`${p}ffn_down.weight`);
        
        if (!w_g || !w_u || !w_d) return new Float32Array(params.n_embd);

        const n_ff = w_g.length / params.n_embd;
        const gate = self.matVecMul(x, w_g, n_ff);
        const up = self.matVecMul(x, w_u, n_ff);
        
        // Activation
        let act;
        if (params.act_fn === 'gelu') {
            act = self.gelu(gate);
        } else {
            act = self.silu(gate);
        }

        for(let i=0; i<n_ff; i++) act[i] *= up[i];
        
        return self.matVecMul(act, w_d, params.n_embd);
    };
};
