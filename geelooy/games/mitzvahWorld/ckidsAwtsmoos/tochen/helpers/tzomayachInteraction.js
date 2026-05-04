
/**B"H */

export default class Interaction {
    me = null;
    opts = {};
	constructor(me, opts = {}) {
        this.me = me;
        this.opts = opts;
        this.approachTxt = typeof(opts.approachTxt) 
        == "function" ? opts.approachTxt :
            (() => this.me.name);
        
	}

    sealayk(nivra ) {
        // B"H: silent

        this.me.olam.htmlAction({
            shaym: this.opts.npcMessageShaym,
            methods: {
                classList: {
                    remove: "active"
                }
            }
        });
        this.nivraYotsee(nivra)
    }

    nivraYotsee(nivra) {
        if(nivra.type != "chossid") return;

        if(nivra.interactingWith)
            this.me.ayshPeula("close dialogue");
        
        if(this.me.wasApproached) {
            this.me.ayshPeula("was moved away from")
        }
        
        // B"H: Also close the store if it's open
        if(this.me.olam) {
            this.me.olam.htmlAction({ shaym: "storeScreen", methods: { classList: { add: "hidden" } } });
        }
        
        this.me.clear("initial approach");
    }

    clearEvents() {
        this.me.clear("accepted interaction");
    }

	nivraNeechnas(nivra) {
        if(nivra.type != "chossid") return;
        
        this.me.on("sealayk", () => {
            this.sealayk(nivra)
        })
		this.me.on("initial approach", () => {
            this.me.inRangeNivra = nivra;
            this.me.ayshPeula("was approached", nivra)
            if(this.opts.approachShaym)
                this.me.olam.htmlAction({
                    shaym: this.opts.approachShaym,
                    methods: { classList: { remove: "hidden" } },
                    properties: { textContent: this.approachTxt() }
                });

			nivra.ayshPeula("you approached", this.me);
			this.me.wasApproached = nivra;


			this.me.on("was moved away from", () => {
                this.me.ayshPeula("someone left", nivra)
                this.me.inRangeNivra = null;
				if(this.opts.approachShaym)
                    this.me.olam.htmlAction({
                        shaym: this.opts.approachShaym,
                        methods: { classList: { add: "hidden" } },
                        properties: { textContent: "" }
                    });
				this.me.wasApproached = false;

				nivra.interactingWith = null;
				nivra.ayshPeula("you moved away from", this.me);

				this.clearEvents();
				this.me.clear("was moved away from");
			});


			this.me.on("accepted interaction", () => {

                if(this.opts.approachShaym)
                    this.me.olam.htmlAction({
                        shaym: this.opts.approachShaym,
                        methods: { classList: { add: "hidden" } },
                        properties: { textContent: "" }
                    });
                if(typeof(this.opts.approachAction) == "function") {
                    this.opts.approachAction(nivra, this);
                }
				
				nivra.interactingWith = this.me;

				this.me.on("close dialogue", (message) => {
					nivra.ayshPeula("the dialogue was closed from", this.me)
					this.me.wasApproached = false;
					this.clearEvents();
					if (nivra.interactingWith) {
						this.me.ayshPeula("initial approach")
					}
					nivra.interactingWith = null;
				});
			});
		});

        if (!this.me.wasApproached) {
            this.me.ayshPeula("initial approach");
        }
	}
}
