import { xc } from 'xtal-element/lib/XtalCore.js';
/**
 * @element ib-id
 */
export class IbId extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs, {
            map: identity,
            tag: (this.previousElementSibling || this.parentElement).localName,
            nodesCompatibleIf: tagsSame,
        });
    }
    onPropChange(name, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
}
IbId.is = 'ib-id';
const identity = x => x;
const tagsSame = (x, y) => x.localName === y.localName;
const propActions = [];
const objProp = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    parse: true,
    async: true
};
const propDefMap = {
    list: objProp,
    map: objProp,
    tag: {
        type: String,
        dry: true,
        async: true,
    },
    initCount: {
        type: Number,
        async: true
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(IbId, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IbId);
function markOwnership(self, initCount, wm) {
    let i = 0, ns = self;
    const nextSiblings = [];
    while (i < initCount && ns !== null) {
        i++;
        ns = ns.nextElementSibling;
        nextSiblings.push(ns);
    }
    if (i === initCount && ns !== null) {
        self.initialized = true;
        for (const ns2 of nextSiblings) {
            wm.add(ns2);
        }
    }
    else {
        setTimeout(() => markOwnership(self, initCount, wm), 50);
        return;
    }
}
