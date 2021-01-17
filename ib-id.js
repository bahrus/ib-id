import { xc } from 'xtal-element/lib/XtalCore.js';
const propDefGetter = [
    ({ list, map }) => ({
        type: Object,
        dry: true,
        stopReactionsIfFalsy: true
    }),
    ({ tag }) => ({
        type: String,
        dry: true,
    })
];
const propDefs = xc.getPropDefs(propDefGetter);
function newC(tag, wm, map, list, idx, self, prevSib) {
    const newChild = document.createElement(tag);
    wm.add(newChild);
    Object.assign(newChild, map(list[idx]));
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
    while (ns !== null) {
        if (wm.has(ns)) {
            if (idx < len) {
                Object.assign(ns, map(list[idx]));
                idx++;
            }
            else {
                self.appendChild(ns);
            }
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
                    Object.assign(lastElement, map(list[idx]));
                    idx++;
                    (prevSib || self).insertAdjacentElement('afterend', lastElement);
                    prevSib = lastElement;
                }
            }
        }
        if (idx >= len)
            return;
        ns = ns.nextElementSibling;
    }
};
const propActions = [
    linkNextSiblings
];
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
}
IbId.is = 'ib-id';
xc.letThereBeProps(IbId, propDefs, 'onPropChange');
xc.define(IbId);
