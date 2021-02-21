import { xc, PropAction, ReactiveSurface, PropDef, PropDefMap } from 'xtal-element/lib/XtalCore.js';
import { IbIdProps } from './types.js';
import { applyP } from 'trans-render/lib/applyP.js';
import { PSettings } from 'trans-render/lib/types.js';

/**
 * @element i-bid
 */
export class IBid extends HTMLElement implements ReactiveSurface, IbIdProps {
    static is = 'i-bid';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    tag: string | undefined;
    initialized: boolean | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
     */
    map: ((x: any, idx?: number) => any) | undefined;
    list: any[] | undefined;
    initCount: number | undefined;
    ownedSiblings: WeakSet<Element> = new WeakSet<Element>();
    grp1LU: {[key: string] : Element[]} = {};
    grp1: undefined | ((x: any) => string);
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate<Partial<IbIdProps>>(this, slicedPropDefs, {
            initCount: 0,
            map: identity,
            tag: (this.previousElementSibling || this.parentElement!).localName,
            grp1: stdGrp1,
        });
    }
    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }

    /**
     * Apply any custom actions on newly created element.
     * @param newChild 
     */
    configureNewChild(newChild: Element){}
}
const identity = (x: any) => x;
const stdGrp1 = (x: any) => x.localName;
    

const linkInitialized = ({initCount, self}: IBid) => {
    if(initCount !== 0){
        markOwnership(self, initCount!);
    }else{
        self.initialized = true;
    }
}

const onNewList = ({initialized, grp1, list, map, self}: IBid) => {
    let ns = self as Element;
    for(const [idx, item] of list!.entries()){
        const mappedItem = map!(item, idx);
        let wrappedItem = typeof(mappedItem) === 'string' ? {textContent: item} : {...mappedItem};
        if(wrappedItem.localName === undefined) wrappedItem = {localName: self.tag, ...wrappedItem};
        ns = conditionalCreate(self, wrappedItem, ns);
    }
    poolExtras(self, ns);
}

const propActions = [
    onNewList,
    linkInitialized,
] as PropAction[];


const objProp1 = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    parse: true,
    async: true
} as PropDef;
const objProp2 = {
    type: Object,
    dry: true,
    stopReactionsIfFalsy: true,
    async: true,
}
const propDefMap : PropDefMap<IBid> = {
    list: objProp1,
    map: objProp1,
    grp1: objProp2,
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
        dry: true,
        async: true,
    }
}
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps<IBid>(IBid, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IBid);

function markOwnership(self: IBid, initCount: number){
    const {ownedSiblings} = self;
    let i = 0, ns = self as Element | null;
    const nextSiblings: Element[] = [];
    while(i < initCount && ns !== null){
        i++;
        ns = ns.nextElementSibling;
        if(ns!==null) nextSiblings.push(ns);
    }
    if(i === initCount && ns !== null){
        self.initialized = true;
        for(const ns2 of nextSiblings){
            ownedSiblings.add(ns2 as HTMLElement);
        }
    }else{
        setTimeout(() => markOwnership(self, initCount), 50);
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

function conditionalCreate(self: IBid, item: any, prevSib: Element): Element{
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
    if(elementPool !== undefined && elementPool.length > 0){
        newEl = elementPool.pop();
    }
    if(newEl === undefined){
        newEl = document.createElement(item.localName);
        self.configureNewChild(newEl!);
        ownedSiblings!.add(newEl!);
    }
    
    applyP(newEl!, [item] as PSettings);
    
    
    prevSib.insertAdjacentElement('afterend', newEl!);
    return newEl!;
}

