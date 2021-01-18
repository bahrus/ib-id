import {xc} from 'xtal-element/lib/XtalCore.js';
import {destructPropInfo, ReactiveSurface, PropAction, PropDef} from 'xtal-element/types.d.js';
import {IbIdProps} from './types.d.js';

const propDefGetter =  [
    ({list, map}: IbId) => ({
        type: Object,
        dry: true,
        stopReactionsIfFalsy: true,
        parse: true,
    }),
    ({tag}: IbId) => ({
        type: String,
        dry: true,
    })
] as destructPropInfo[];
const propDefs = xc.getPropDefs(propDefGetter);
function newC(tag: string, wm: WeakSet<HTMLElement>, map: (x: any, idx?: number) => any, list: any[], idx: number, self: IbId, prevSib: Element){
    const newChild = document.createElement(tag);
    self.configureNewChild(newChild);
    wm.add(newChild);
    self.applyItem(newChild, map(list[idx], idx));
    idx++;
    if(prevSib === undefined){
        self.insertAdjacentElement('afterend', newChild);
    }else{
        prevSib.insertAdjacentElement('afterend', newChild);
    }
    return newChild;
}
const linkNextSiblings = ({list, tag, wm, map, self}: IbId) => {
    if(list === undefined || tag === undefined || map === undefined) return; 
    let ns = self.nextElementSibling;
    let idx = 0, len = list.length;
    let prevSib: Element = undefined;
    while(idx < len){
        if(ns!== null && wm.has(ns as HTMLElement)){
            self.applyItem(ns as HTMLElement, map(list[idx], idx));
            idx++;
            prevSib = ns;
        }else{
            let hasNoMoreChildren = false;
            while(idx < len){
                const lastElement = hasNoMoreChildren ? null : self.lastElementChild;
                if(lastElement === null){
                    hasNoMoreChildren = true;
                    prevSib = newC(tag, wm, map, list, idx, self, prevSib);
                    idx++;
                }else{
                    self.applyItem(lastElement as HTMLElement, map(list[idx], idx));
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
    self=this; propActions = propActions; reactor = new xc.Reactor(this);
    wm = new WeakSet<HTMLElement>();
    tag: string;
    map: (x: any, idx?: number) => any;
    list: any[];
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate<Partial<IbId>>(this, propDefs, {
            map: x => x,
            tag: (this.previousElementSibling || this.parentElement).localName,
        })
    }
    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }
    configureNewChild(newChild: HTMLElement){}
    applyItem(newChild: HTMLElement, listItem: any){
        switch(typeof listItem){
            case 'string':
                newChild.textContent = listItem;
                break;
            case 'object':
                Object.assign(newChild, listItem);
                break;
        }
    }
    
}
xc.letThereBeProps(IbId, propDefs, 'onPropChange');
xc.define(IbId);