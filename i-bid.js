import { xc } from 'xtal-element/lib/XtalCore.js';
import { applyP } from 'trans-render/lib/applyP.js';
import { applyPEA } from 'trans-render/lib/applyPEA.js';
/**
 * @element i-bid
 */
export class IBid extends HTMLElement {
    constructor() {
        super();
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        this.ownedSiblings = new WeakSet();
        this.grp1LU = {};
        this._doNotCleanUp = false;
        const aThis = this;
        if (aThis.attachInternals !== undefined) {
            (aThis)._internals = aThis.attachInternals();
        }
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs, {
            ownedSiblingCount: 0,
            map: identity,
            tag: (this.firstElementChild || this.previousElementSibling || this.parentElement).localName,
            grp1: stdGrp1,
        });
    }
    disconnectedCallback() {
        if (!this._doNotCleanUp)
            this.ownedRange?.deleteContents();
    }
    get ownedRange() {
        if (this.lastOwnedSibling !== undefined) {
            const range = document.createRange();
            range.setStartBefore(this.nextElementSibling);
            range.setEndAfter(this.lastOwnedSibling);
            return range;
        }
    }
    extractContents() {
        this._doNotCleanUp = true;
        const range = document.createRange();
        range.setStartBefore(this);
        range.setEndAfter(this.lastOwnedSibling ?? this);
        return range.extractContents();
    }
    onPropChange(name, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
    get nextUnownedSibling() {
        if (this.lastOwnedSibling !== undefined) {
            return this.lastOwnedSibling.nextElementSibling;
        }
        return this.nextElementSibling;
    }
    /**
     * Apply any custom actions on newly created element.
     * @param newChild
     */
    configureNewChild(newChild) { }
    updateLightChildren(element, item, idx) { }
}
IBid.is = 'i-bid';
const identity = (x) => x;
const stdGrp1 = (x) => {
    if (Array.isArray(x)) {
        return x[0].localName;
    }
    return x.localName;
};
const linkInitialized = ({ ownedSiblingCount, self }) => {
    if (ownedSiblingCount !== 0) {
        markOwnership(self, ownedSiblingCount);
    }
    else {
        self.initialized = true;
    }
};
export const onNewList = ({ initialized, grp1, list, map, self }) => {
    if (list === self._lastList && map === self._lastMap)
        return;
    let ns = self;
    for (const [idx, item] of list.entries()) {
        const mappedItem = map(item, idx);
        let wrappedItem = typeof (mappedItem) === 'string' ? { textContent: item } :
            Array.isArray(mappedItem) ? [...mappedItem] : { ...mappedItem };
        if (Array.isArray(wrappedItem)) {
            if (wrappedItem[0] === undefined) {
                wrappedItem[0] = { localName: self.tag };
            }
            else {
                wrappedItem[0] = { localName: self.tag, ...wrappedItem[0] };
            }
        }
        else {
            wrappedItem = { localName: self.tag, ...wrappedItem };
        }
        ns = applyItem(self, wrappedItem, idx, ns);
        self.lastOwnedSibling = ns;
    }
    poolExtras(self, ns);
};
const propActions = [
    onNewList,
    linkInitialized,
];
export function markOwnership(self, ownedSiblingCount) {
    const { ownedSiblings } = self;
    let i = 0, ns = self;
    const nextSiblings = [];
    while (i < ownedSiblingCount && ns !== null) {
        i++;
        ns = ns.nextUnownedSibling || ns.nextElementSibling;
        if (ns)
            nextSiblings.push(ns);
    }
    if (i === ownedSiblingCount && ns !== null) {
        self.initialized = true;
        for (const ns2 of nextSiblings) {
            ownedSiblings.add(ns2);
        }
    }
    else {
        setTimeout(() => markOwnership(self, ownedSiblingCount), 50);
        return;
    }
}
function poolExtras(self, prevSib) {
    const { grp1, grp1LU, ownedSiblings } = self;
    let ns = prevSib.nextElementSibling;
    const toPool = [];
    while (ns !== null && ownedSiblings.has(ns)) {
        toPool.push(ns);
        const val = grp1(ns);
        if (grp1LU[val] === undefined) {
            grp1LU[val] = [];
        }
        grp1LU[val].push(ns);
        ns = ns.nextElementSibling;
    }
    for (const el of toPool) {
        self.append(el);
    }
}
function applyItem(self, item, idx, prevSib) {
    const { grp1, grp1LU, ownedSiblings } = self;
    const val = grp1(item);
    let newEl;
    //test next few siblings for a match
    let ns = prevSib;
    for (let i = 0; i < 4; i++) {
        ns = ns.nextElementSibling;
        if (ns === null || !ownedSiblings.has(ns))
            break;
        if (grp1(ns) === val) {
            newEl = ns;
            break;
        }
    }
    const elementPool = grp1LU[val];
    if (elementPool === undefined) {
        grp1LU[val] = Array.from(self.children).filter(x => x.localName === val);
    }
    else if (elementPool.length > 0) {
        newEl = elementPool.pop();
    }
    if (newEl === undefined) {
        newEl = document.createElement(self.grp1(item));
        self.configureNewChild(newEl);
    }
    if (Array.isArray(item)) {
        applyPEA(self, newEl, item);
    }
    else {
        applyP(newEl, [item]);
    }
    if (!ownedSiblings.has(newEl))
        ownedSiblings.add(newEl);
    self.updateLightChildren(newEl, item, idx);
    prevSib.insertAdjacentElement('afterend', newEl);
    return newEl;
}
export const objProp1 = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    async: true,
};
export const objProp2 = {
    ...objProp1,
    parse: true,
};
const propDefMap = {
    list: objProp2,
    map: objProp2,
    grp1: objProp1,
    tag: {
        type: String,
        dry: true,
        async: true,
    },
    ownedSiblingCount: {
        type: Number,
        async: true
    },
    initialized: {
        type: Boolean,
        stopReactionsIfFalsy: true,
        dry: true,
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(IBid, slicedPropDefs, 'onPropChange');
xc.define(IBid);
