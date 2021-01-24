import { xc } from 'xtal-element/lib/XtalCore.js';
import { applyP } from 'trans-render/lib/applyP.js';
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
function newC(tag, wm, map, list, idx, self, prevSib) {
    const listItem = list[idx];
    const domProps = map(listItem, idx);
    const newChild = document.createElement(domProps.localName || tag);
    self.configureNewChild(newChild);
    wm.add(newChild);
    self.assignItemIntoNode(newChild, domProps);
    if (prevSib === undefined) {
        self.insertAdjacentElement('afterend', newChild);
    }
    else {
        prevSib.insertAdjacentElement('afterend', newChild);
    }
    return newChild;
}
const linkNextSiblings = ({ list, tag, wm, map, self, initCount }) => {
    if (!self.initialized && initCount !== undefined) {
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
            setTimeout(() => linkNextSiblings(self), 50);
            return;
        }
    }
    if (list === undefined || tag === undefined || map === undefined)
        return;
    let ns = self.nextElementSibling;
    let idx = 0;
    const domProps = map(list[idx], idx), len = list.length, dynTag = domProps.localName || tag;
    let prevSib = undefined;
    while (idx < len) {
        if (ns !== null && wm.has(ns)) {
            if (ns.localName !== dynTag) {
                self.appendChild(ns);
            }
            else {
                self.assignItemIntoNode(ns, map(list[idx], idx));
                idx++;
                prevSib = ns;
            }
        }
        else {
            let hasNoMoreChildren = false;
            while (idx < len) {
                let lastElement = hasNoMoreChildren ? null : self.lastElementChild;
                if (lastElement !== null && lastElement.localName !== dynTag) {
                    lastElement = self.querySelector(dynTag);
                }
                if (lastElement === null) {
                    hasNoMoreChildren = true;
                    prevSib = newC(tag, wm, map, list, idx, self, prevSib);
                    idx++;
                }
                else {
                    self.assignItemIntoNode(lastElement, map(list[idx], idx));
                    idx++;
                    (prevSib || self).insertAdjacentElement('afterend', lastElement);
                    prevSib = lastElement;
                }
            }
        }
        if (idx >= len)
            return;
        if (ns !== null)
            ns = ns.nextElementSibling;
    }
    if (prevSib !== undefined) {
        ns = prevSib.nextElementSibling;
        while (ns !== null) {
            if (wm.has(ns)) {
                self.appendChild(ns);
            }
            ns = ns.nextElementSibling;
        }
    }
};
const propActions = [
    linkNextSiblings
];
/**
 * @element ib-id
 */
export class IbId extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Reactor(this);
        this.wm = new WeakSet();
        this.initialized = false;
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs, {
            map: x => x,
            tag: (this.previousElementSibling || this.parentElement).localName,
        });
    }
    onPropChange(name, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
    /**
     * Apply any custom actions on newly created element.
     * @param newChild
     */
    configureNewChild(newChild) { }
    assignItemIntoNode(newChild, listItem) {
        switch (typeof listItem) {
            case 'string':
                newChild.textContent = listItem;
                break;
            case 'object':
                applyP(newChild, [listItem]);
                break;
        }
    }
}
IbId.is = 'ib-id';
xc.letThereBeProps(IbId, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IbId);
