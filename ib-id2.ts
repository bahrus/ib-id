import { xc, PropAction, ReactiveSurface, PropDef, PropDefMap } from 'xtal-element/lib/XtalCore.js';
import { IbIdProps } from './types.d.js';

/**
 * @element ib-id
 */
export class IbId extends HTMLElement implements ReactiveSurface, IbIdProps {
    static is = 'ib-id';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);

    tag: string;
    /**
     * map allows mapping a general list to props to be set on the UI component.
     */
    map: (x: any, idx?: number) => any;
    nodesCompatibleIf: (x: HTMLElement, y: HTMLElement) => boolean;
    list: any[];
    initCount: number | undefined;
    
    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate<Partial<IbId>>(this, slicedPropDefs, {
            map: identity,
            tag: (this.previousElementSibling || this.parentElement).localName,
            nodesCompatibleIf: tagsSame,
        });
    }
    onPropChange(name: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }
}
const identity = x => x;
const tagsSame = (x: HTMLElement, y: HTMLElement) => x.localName === y.localName;



const propActions = [

] as PropAction[];


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
xc.letThereBeProps<IbId>(IbId, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IbId);

function markOwnership(self: IbIdProps, initCount: number, wm: WeakSet<HTMLElement>){
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
        setTimeout(() => markOwnership(self, initCount, wm), 50);
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

function conditionalCreate(self: IbIdProps, item: any, prevSib: Element){
    const {grp1, grp1LU, ownedSiblings} = self;
    const val = grp1(item);
    //let matchingElements = grp1LU[val];
    let el: HTMLElement;
    if(item === undefined){

        
    }else{
        //test next few siblings for a match
        let ns = prevSib;
        for(let i = 0; i < 4; i++){
            ns = ns.nextElementSibling as HTMLElement;
            if(ns === null || !ownedSiblings.has(ns)) break;
            if(grp1(ns) === val){
                prevSib.insertAdjacentElement('afterend', ns);
                return;
            }
        }
        //
        matchingElements = grp1LU[val];
        const firstMatch = matchingElements[0];
    }
    matchingElements.add(el);
}

