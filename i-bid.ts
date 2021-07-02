import { xc, PropAction, ReactiveSurface, PropDef, PropDefMap, IReactor } from 'xtal-element/lib/XtalCore.js';
import { IbIdProps } from './types.js';
import { applyP } from 'trans-render/lib/applyP.js';
import { applyPEA } from 'trans-render/lib/applyPEA.js';
import { PSettings, PEASettings } from 'trans-render/lib/types.js';
import {applyMixins} from 'xtal-element/lib/applyMixins.js';
import {GroupedSiblings} from 'xtal-element/lib/GroupedSiblings.js';
/**
 * @element i-bid
 */
export class IBid extends HTMLElement implements ReactiveSurface, IbIdProps {
    static is = 'i-bid';
    constructor(){
        super();
        const aThis = this as any;
        if(aThis.attachInternals !== undefined){
            (aThis)._internals = aThis.attachInternals();
        }
    }
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);
    tag: string | undefined;
    initialized: boolean | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
     */
    map: ((x: any, idx?: number) => any) | undefined;
    list: any[] | undefined;
    ownedSiblingCount: number | undefined;
    ownedSiblings: WeakSet<Element> = new WeakSet<Element>();
    //lastOwnedSibling: Element | undefined;
    _lastList: any[] | undefined;
    _lastMap: any;
    grp1LU: {[key: string] : Element[]} = {};
    grp1: undefined | ((x: any) => string);
    connectedCallback(){
        this.style.display = 'none';
        xc.mergeProps<Partial<IbIdProps>>(this, slicedPropDefs, {
            ownedSiblingCount: 0,
            map: identity,
            tag: (this.firstElementChild || this.previousElementSibling || this.parentElement!).localName,
            grp1: stdGrp1,
        });
    }
    disconnectedCallback(){
        if(!this._doNotCleanUp) this.groupedRange?.deleteContents();
    }


    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }



    /**
     * Apply any custom actions on newly created element.
     * @param newChild 
     */
    configureNewChild(newChild: Element){}

    updateLightChildren(element: Element, item: any, idx: number){}
}
const identity = (x: any) => x;
const stdGrp1 = (x: any) => {
    if(Array.isArray(x)){
        return x[0].localName;
    }
    return x.localName;
}
    

const linkInitialized = ({ownedSiblingCount, self}: IBid) => {
    if(ownedSiblingCount !== 0){
        markOwnership(self, ownedSiblingCount!);
    }else{
        self.initialized = true;
    }
}

export const onNewList = ({initialized, grp1, list, map, self, startingSibling}: IBid) => {
    if(list === self._lastList && map === self._lastMap) return;
    if(startingSibling === undefined) {
        self.setStartingSibling(0);
        return;
    }
    self._lastMap = map;
    self._lastList = list;
    let ns = self.startingSibling as Element;
    for(const [idx, item] of list!.entries()){
        const mappedItem = map!(item, idx);
        let wrappedItem = typeof(mappedItem) === 'string' ? {textContent: item} :
            Array.isArray(mappedItem) ? [...mappedItem] : {...mappedItem};
        if(Array.isArray(wrappedItem)){
            if(wrappedItem[0] === undefined){
                wrappedItem[0] = {localName: self.tag};
            }else{
                wrappedItem[0] = {localName: self.tag, ...wrappedItem[0]};
            }
        }else{
            wrappedItem = {localName: self.tag, ...wrappedItem};
        }
        ns = applyItem(self, wrappedItem, idx, ns);
        self.lastGroupedSibling = ns;
    }
    poolExtras(self, ns);
}

const propActions = [
    onNewList,
    linkInitialized,
] as PropAction[];



export function markOwnership(self: IBid, ownedSiblingCount: number){
    const {ownedSiblings} = self;
    let i = 0, ns = self as Element | null;
    const nextSiblings: Element[] = [];
    while(i < ownedSiblingCount && ns !== null){
        i++;
        ns = (<any>ns).nextUnownedSibling || ns.nextElementSibling;
        if(ns) nextSiblings.push(ns);
    }
    if(i === ownedSiblingCount && ns !== null){
        self.initialized = true;
        for(const ns2 of nextSiblings){
            ownedSiblings.add(ns2 as HTMLElement);
        }
    }else{
        setTimeout(() => markOwnership(self, ownedSiblingCount), 50);
        return;
    }
}

function poolExtras(self: IbIdProps, prevSib: Element){
    const {grp1, grp1LU, ownedSiblings} = self;
    let ns = prevSib.nextElementSibling;
    const toPool: Element[] = [];
    while(ns !== null && ownedSiblings!.has(ns)){
        toPool.push(ns);
        const val = grp1!(ns);
        if(grp1LU[val] === undefined){
            grp1LU[val] = [];
        }
        grp1LU[val].push(ns);
        ns = ns.nextElementSibling;
    }
    for(const el of toPool){
        self.append!(el);
    }
}

function applyItem(self: IBid, item: any, idx: number, prevSib: Element): Element{
    const {grp1, grp1LU, ownedSiblings} = self;
    const val = grp1!(item);
    let newEl: Element | undefined;
    //test next few siblings for a match
    let ns = prevSib;
    for(let i = 0; i < 4; i++){
        ns = ns.nextElementSibling as HTMLElement;
        if(ns === null || !ownedSiblings!.has(ns)) break;
        if(grp1!(ns) === val){
            newEl = ns;
            break;
        }
    }
    const elementPool = grp1LU[val];
    if(elementPool === undefined){
        grp1LU[val] = Array.from(self.children).filter(x => x.localName === val);
    }else if(elementPool.length > 0){
        newEl = elementPool.pop();
    }
    if(newEl === undefined){
        newEl = document.createElement(self.grp1!(item));
        self.configureNewChild(newEl!);
        
    }
    if(Array.isArray(item)){
        applyPEA(self, newEl! as HTMLElement, item as PEASettings);
    }else{
        applyP(newEl!, [item] as PSettings);
    }
    if(!ownedSiblings!.has(newEl)) ownedSiblings!.add(newEl!);
    self.updateLightChildren(newEl!, item, idx);
    prevSib.insertAdjacentElement('afterend', newEl!);
    return newEl!;
}

export const objProp3: PropDef = {
    type: Object,
    dry: true,
    async: true,
};
export const objProp1: PropDef = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    async: true,
}
export const objProp2: PropDef = {
    ...objProp1,
    parse: true,
} as PropDef;

export const strProp1: PropDef = {
    type: String,
    dry: true,

};

const propDefMap : PropDefMap<IBid> = {
    list: objProp2,
    map: objProp2,
    grp1: objProp1,
    startingSibling: objProp3,
    matchClosest: strProp1,
    renderAfter: strProp1,
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
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps<IBid>(IBid, slicedPropDefs, 'onPropChange');
applyMixins(IBid, [GroupedSiblings]);
xc.define(IBid);

export interface IBid extends GroupedSiblings{}

