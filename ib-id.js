import { xc } from 'xtal-element/lib/XtalCore.js';
import { applyP } from 'trans-render/lib/applyP.js';
const propDefGetter = [
    ({ list, map }) => ({
        type: Object,
        dry: true,
        stopReactionsIfFalsy: true,
        parse: true,
    }),
    ({ tag }) => ({
        type: String,
        dry: true,
    })
];
const propDefs = xc.getPropDefs(propDefGetter);
function newC(tag, wm, map, list, idx, self, prevSib) {
    const newChild = document.createElement(tag);
    self.configureNewChild(newChild);
    wm.add(newChild);
    self.mergeItemIntoNode(newChild, map(list[idx], idx));
    idx++;
    if (prevSib === undefined) {
        self.insertAdjacentElement('afterend', newChild);
    }
    else {
        prevSib.insertAdjacentElement('afterend', newChild);
    }
    return newChild;
}
const linkNextSiblings = ({ list, tag, wm, map, self }) => {
    if (list === undefined || tag === undefined || map === undefined)
        return;
    let ns = self.nextElementSibling;
    let idx = 0, len = list.length;
    let prevSib = undefined;
    while (idx < len) {
        if (ns !== null && wm.has(ns)) {
            self.mergeItemIntoNode(ns, map(list[idx], idx));
            idx++;
            prevSib = ns;
        }
        else {
            let hasNoMoreChildren = false;
            while (idx < len) {
                const lastElement = hasNoMoreChildren ? null : self.lastElementChild;
                if (lastElement === null) {
                    hasNoMoreChildren = true;
                    prevSib = newC(tag, wm, map, list, idx, self, prevSib);
                    idx++;
                }
                else {
                    self.mergeItemIntoNode(lastElement, map(list[idx], idx));
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
    }
    connectedCallback() {
        this.style.display = 'none';
        xc.hydrate(this, propDefs, {
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
    mergeItemIntoNode(newChild, listItem) {
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
xc.letThereBeProps(IbId, propDefs, 'onPropChange');
xc.define(IbId);
