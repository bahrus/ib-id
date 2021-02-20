import { xc, PropAction, ReactiveSurface, PropDef, PropDefMap } from 'xtal-element/lib/XtalCore.js';
import { IbIdProps } from './types.js';
import {applyP} from 'trans-render/lib/applyP.js';

/**
 * @element i-bid
 */
export class IBid extends HTMLElement implements ReactiveSurface, IbIdProps {
    static is = 'i-bid';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    wm = new WeakSet<Element>();
    tag: string;
    initialized: boolean | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
     */
    map: (x: any, idx?: number) => any;
    nodesCompatibleIf: (x: HTMLElement, y: HTMLElement) => boolean;
    list: any[];
    initCount: number | undefined;
    ownedSiblings: WeakSet<Element> | undefined;
    grp1LU: {[key: string] : Element[]} = {};
    
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate<Partial<IbIdProps>>(this, slicedPropDefs, {
            map: identity,
            tag: (this.previousElementSibling || this.parentElement).localName,
            grp1: (x: Element) => x.localName,
        });
    }
    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }
}
const identity = x => x;

const linkInitialized = ({initCount, self}: IBid) => {
    if(initCount !== undefined){
        markOwnership(self, initCount);
    }else{
        self.initialized = true;
    }
}

const onNewList = ({initialized, list, self}: IBid) => {
    let ns = self as Element;
    for(const item of list){
        ns = conditionalCreate(self, item, ns);
    }
}

const propActions = [
    linkInitialized,
    onNewList
] as PropAction[];


const objProp = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    parse: true,
    async: true
} as PropDef;
const propDefMap : PropDefMap<IBid> = {
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
    },
    initialized: {
        type: Boolean,
        stopReactionsIfFalsy: true,
    }
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps<IBid>(IBid, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IBid);

function markOwnership(self: IBid, initCount: number){
    const {wm} = self;
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
        setTimeout(() => markOwnership(self, initCount), 50);
        return;
    }
}

function poolExtras(self: IbIdProps, prevSib: Element){
    const {grp1, grp1LU, ownedSiblings} = self;
    let ns = prevSib.nextElementSibling;
    while(ns !== null && ownedSiblings.has(ns)){
        self.append(ns);
        const val = grp1(ns);
        if(grp1LU[val] === undefined){
            grp1LU[val] = [];
        }
        grp1LU[val].push(ns);
        ns = ns.nextElementSibling;
    }
}



function conditionalCreate(self: IbIdProps, item: any, prevSib: Element): Element{
    const {grp1, grp1LU, ownedSiblings} = self;
    const val = grp1(item);
    let newEl: Element;
    //test next few siblings for a match
    let ns = prevSib;
    for(let i = 0; i < 4; i++){
        ns = ns.nextElementSibling as HTMLElement;
        if(ns === null || !ownedSiblings.has(ns)) break;
        if(grp1(ns) === val){
            newEl = ns;
            break;
        }
    }
    const elementPool = grp1LU[val];
    if(elementPool !== undefined && elementPool.length > 0){
        newEl = elementPool.pop();
    }
    if(newEl === undefined){
        newEl = document.createElement(item.localName || self.tag);
        ownedSiblings.add(newEl);
    }
    
    applyP(newEl, item);
    prevSib.insertAdjacentElement('afterend', newEl);
    return newEl;
}

