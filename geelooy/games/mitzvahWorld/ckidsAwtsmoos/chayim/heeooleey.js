/**
B"H
**/

/**
 * Heeoolee - The foundational essence of event-driven existence.
 * Has event listeners for when an update has occurred.
 */
export default class Heeoolee {
    events = {};
    constructor() {}

	static extend(target) {
	 Object.getOwnPropertyNames(Heeoolee.prototype).forEach((name) => {
		if (
		name !== 'constructor' && 
		name != "extend" &&
		!target.hasOwnProperty(name)
		) {
		  target[name] = Heeoolee.prototype[name];
		}
	  });
	}

    clearAll() {
        this.events = {}
    }
	
    clear(shaym, func=null) {
        if(typeof(shaym) != "string") return null;
        if(this.events[shaym]) {
            if(typeof(func) == "function") {
                var fndIdx = this.events[shaym].findIndex(q=>q.peula==func);
                if(fndIdx > -1) {
                    this.events[shaym].splice(fndIdx, 1);
                }
            } else
                delete this.events[shaym];
        }
    }

    /**
     * B"H: Corrected remove logic to target the array within the events map.
     * We find the index of the specific listener object by matching its 'peula' property.
     */
    remove(shaym, peula) {
        if(typeof(shaym) != "string") return false;

        if(typeof(peula) != "function") {
            if(this.events[shaym]) {
                delete this.events[shaym];
            }
            return true;
        }

        var ev = this.events[shaym]
        if(!ev || !Array.isArray(ev)) return false;

        // B"H: Correctly locating the listener in the array of objects
        var ind = ev.findIndex(q => q.peula === peula);
        if(ind > -1) {
            ev.splice(ind, 1); 
            return true;
        }
        return false;
    }

    on(shaym, peula/*function*/, oneTime=false) {
        if(typeof(shaym) != "string") return null;

        if(typeof(peula) != "function") {
            if(typeof(peula) == "string") {
                /*try to resolve string as 
                function, maybe passed from worker
                or socket etc.*/
                try {
                    peula = eval("("+peula+")");
                } catch(e) {
                    return null;
                }
            }
        }

        if(!this.events[shaym]) {
            this.events[shaym] = [];
        }
        this.events[shaym].push({peula, oneTime});
    }

    event(shaym) {
        return this.events[shaym] ? 
            this.events[shaym].length ? 
            this.events[shaym] : null : null;
    }

    ayshPeula/*fire event*/(shaym/*name*/, ...dayuh/*data*/) {
        var asyncs = [];
        var results = [];
        if(this.events[shaym]) {
			var indexesToRemove = [];
            this.events[shaym].map(async (ev, index)=>{
				var q = ev.peula;
				var isOne = ev.oneTime;
                if((q+"").indexOf("async") > -1) {
                    asyncs.push(q(...dayuh));
				}
                else {
					results.push(q(...dayuh));
				}
				if(isOne) {
					indexesToRemove.push(index);
				}
            });
			
			indexesToRemove.sort((a,b)=> b-a);
			for(var ind of indexesToRemove) {
				this.events[shaym].splice(ind, 1)
			}
        }
        if(asyncs.length)
            return Promise.all(asyncs);
        else if (results.length) {
            return results[0];
        }
    }
}
