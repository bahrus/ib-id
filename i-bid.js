import { xc } from 'xtal-element/lib/XtalCore.js';
import { applyP } from 'trans-render/lib/applyP.js';
import { applyPEA } from 'trans-render/lib/applyPEA.js';
import { applyMixins } from 'xtal-element/lib/applyMixins.js';
import { GroupedSiblings } from 'xtal-element/lib/GroupedSiblings.js';
/**
 * @element i-bid
 */
export class IBid extends HTMLElement {
    static is = 'i-bid';
    constructor() {
        super();
        const aThis = this;
        if (aThis.attachInternals !== undefined) {
            (aThis)._internals = aThis.attachInternals();
        }
    }
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    tag;
    ownedSiblings = new WeakSet();
    _lastList;
    _lastMap;
    grp1LU = {};
    grp1;
    connectedCallback() {
        this.style.display = 'none';
        xc.mergeProps(this, slicedPropDefs, {
            ownedSiblingCount: 0,
            map: identity,
            tag: (this.firstElementChild || this.previousElementSibling || this.parentElement).localName,
            grp1: stdGrp1,
            // stampId: '%id%',
            // stampIndex: '%index%'
        });
    }
    disconnectedCallback() {
        if (!this._doNotCleanUp)
            this.groupedRange?.deleteContents();
    }
    onPropChange(name, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
    weakMap;
    /**
     * Apply any custom actions on newly created element.
     * @param newChild
     */
    configureNewChild(newChild) { }
    updateLightChildren(element, item, idx) { }
}
const identity = (x) => x;
const stdGrp1 = (x) => {
    if (Array.isArray(x)) {
        return x[0].localName;
    }
    return x.localName;
};
export const linkInitialized = ({ ownedSiblingCount, self }) => {
    if (ownedSiblingCount !== undefined && ownedSiblingCount !== 0) {
        markOwnership(self, ownedSiblingCount);
    }
    else {
        self.initialized = true;
    }
};
export const onNewList = ({ initialized, grp1, list, map, self, previousUngroupedSibling, parentToRenderTo }) => {
    if (list === self._lastList && map === self._lastMap)
        return;
    // if(self.stamp){
    //     if(self.id === ''){
    //         self.id = (new Date()).valueOf().toString();
    //     }
    //     const id = self.id;
    //     const stampId = self.stampId!;
    //     const stampIdx = self.stampIndex!;
    //     let count = 0;
    //     for(const item of list){
    //         item[stampId] = id;
    //         item[stampIdx] = count;
    //         count++;
    //     }
    // }
    const isRenderedNonContinguously = self.renderAfter !== undefined || self.renderAtStartOf !== undefined;
    if (isRenderedNonContinguously && previousUngroupedSibling === undefined && parentToRenderTo === undefined) {
        self.setElementToBeRenderedTo(0);
        return;
    }
    self._lastMap = map;
    self._lastList = list;
    let relation = 'previousSibling';
    let ns = previousUngroupedSibling || self;
    if (parentToRenderTo !== undefined) {
        ns = parentToRenderTo;
        relation = 'parent';
    }
    const weakMap = self.useWeakMap ? new WeakMap() : undefined;
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
        ns = applyItem(self, wrappedItem, idx, ns, relation, weakMap);
        relation = 'previousSibling';
        self.lastGroupedSibling = ns;
    }
    if (self.useWeakMap) {
        self[slicedPropDefs.propLookup.weakMap.alias] = weakMap;
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
function applyItem(self, item, idx, relativeTo, relation, weakMap) {
    const { grp1, grp1LU, ownedSiblings } = self;
    const val = grp1(item);
    let newEl;
    //test next few siblings for a match
    let ns = relativeTo;
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
    if (weakMap !== undefined) {
        weakMap.set(newEl, item);
    }
    else {
        if (Array.isArray(item)) {
            applyPEA(self, newEl, item);
        }
        else {
            applyP(newEl, [item]);
        }
    }
    if (!ownedSiblings.has(newEl))
        ownedSiblings.add(newEl);
    self.updateLightChildren(newEl, item, idx);
    switch (relation) {
        case 'previousSibling':
            relativeTo.insertAdjacentElement('afterend', newEl);
            break;
        case 'parent':
            relativeTo.prepend(newEl);
            break;
    }
    return newEl;
}
export const objProp3 = {
    type: Object,
    dry: true,
    async: true,
};
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
export const strProp1 = {
    type: String,
    dry: true,
};
export const boolProp1 = {
    type: Boolean,
    dry: true,
    async: true,
};
export const boolProp2 = {
    ...boolProp1,
    stopReactionsIfFalsy: true,
};
const propDefMap = {
    list: objProp2,
    map: objProp2,
    grp1: objProp1,
    previousUngroupedSibling: objProp3,
    parentToRenderTo: objProp3,
    matchClosest: strProp1,
    renderAfter: strProp1,
    renderAtStartOf: strProp1,
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
    },
    useWeakMap: boolProp1,
    weakMap: {
        ...objProp3,
        notify: true,
        obfuscate: true,
    },
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(IBid, slicedPropDefs, 'onPropChange');
applyMixins(IBid, [GroupedSiblings]);
xc.define(IBid);
