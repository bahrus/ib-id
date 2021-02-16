import {xc} from 'xtal-element/lib/XtalCore.js';
import {applyP} from 'trans-render/lib/applyP.js';
import {ReactiveSurface, PropAction, PropDef, PropDefMap} from 'xtal-element/types.d.js';
import {IbIdProps} from './types.d.js';

const objProp = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    parse: true,
    async: true
} as PropDef;
const propDefMap : PropDefMap<IbId> = {
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
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);

function newC(tag: string, wm: WeakSet<HTMLElement>, map: (x: any, idx?: number) => any, list: any[], idx: number, self: IbId, prevSib: Element){
    const listItem = list[idx];
    const domProps = map(listItem, idx);
    const newChild = document.createElement(domProps.localName || tag);
    self.configureNewChild(newChild);
    wm.add(newChild);
    self.assignItemIntoNode(newChild, domProps);
    if(prevSib === undefined){
        self.insertAdjacentElement('afterend', newChild);
    }else{
        prevSib.insertAdjacentElement('afterend', newChild);
    }
    return newChild;
}
const linkNextSiblings = ({list, tag, wm, map, self, initCount}: IbId) => {
    if(!self.initialized && initCount !== undefined){
        let i = 0, ns = self as Element;
        const nextSiblings: Element[] = [];
        while(i < initCount && ns !== null){
            i++;
            ns = ns.nextElementSibling;
            nextSiblings.push(ns);
        }
        if(i === initCount && ns !== null){
            self.initialized = true;
            for(const ns2 of nextSiblings){
                wm.add(ns2 as HTMLElement);
            }
        }else{
            setTimeout(() => linkNextSiblings(self), 50);
            return;
        }
    }
    if(list === undefined || tag === undefined || map === undefined) return; 
    let ns = self.nextElementSibling;
    let idx = 0; 
    const domProps = map(list[idx], idx), len = list.length, dynTag = domProps.localName || tag;
    let prevSib: Element = undefined;
    while(idx < len){
        if(ns!== null && wm.has(ns as HTMLElement)){
            if(ns.localName !== dynTag){
                self.appendChild(ns);
            }else{
                self.assignItemIntoNode(ns as HTMLElement, map(list[idx], idx));
                idx++;
                prevSib = ns;
            }
        }else{
            let hasNoMoreChildren = false;
            while(idx < len){
                let lastElement = hasNoMoreChildren ? null : self.lastElementChild;
                if(lastElement !== null && lastElement.localName !== dynTag){
                    lastElement = self.querySelector(dynTag);
                }
                if(lastElement === null){
                    hasNoMoreChildren = true;
                    prevSib = newC(tag, wm, map, list, idx, self, prevSib);
                    idx++;
                }else{
                    self.assignItemIntoNode(lastElement as HTMLElement, map(list[idx], idx));
                    idx++;
                    (prevSib || self).insertAdjacentElement('afterend', lastElement);
                    prevSib = lastElement;
                }
            }
        }
        if(idx >= len) return;
        if(ns!== null) ns = ns.nextElementSibling;
    }
    if(prevSib !== undefined){
        ns = prevSib.nextElementSibling;
        while(ns !== null){
            if(wm.has(ns as HTMLElement)){
                self.appendChild(ns);
            }
            ns = ns.nextElementSibling;
        }
    }
}
const propActions = [
    linkNextSiblings
] as PropAction[];
/**
 * @element ib-id
 */
export class IbId extends HTMLElement implements ReactiveSurface, IbIdProps {
    static is = 'ib-id';
    self=this; propActions = propActions; reactor = new xc.Rx(this);
    wm = new WeakSet<HTMLElement>();
    tag: string;
    map: (x: any, idx?: number) => any;
    list: any[];
    initCount: number | undefined;
    initialized = false;
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate<Partial<IbId>>(this, slicedPropDefs, {
            map: x => x,
            tag: (this.previousElementSibling || this.parentElement).localName,
        })
    }
    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }
    /**
     * Apply any custom actions on newly created element.
     * @param newChild 
     */
    configureNewChild(newChild: HTMLElement){}


    assignItemIntoNode(newChild: HTMLElement, listItem: any){
        switch(typeof listItem){
            case 'string':
                newChild.textContent = listItem;
                break;
            case 'object':
                applyP(newChild, [listItem]);
                break;
        }
    }
    
}
xc.letThereBeProps<IbId>(IbId, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IbId);