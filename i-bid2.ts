import {CE} from 'trans-render/lib/CE.js';
import {IBidProps, IBidActions, UIElement, relation} from './types';
//import {GroupedSiblings} from 'xtal-element/lib/GroupedSiblings.js';

/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore <TItem = any, TUIElement extends UIElement = Element> extends HTMLElement{

    ownedSiblings: WeakSet<Element> = new WeakSet<Element>();
    elementPools: {[key: string] : Element[]} = {};
    /**
     * Apply any custom actions on newly created element.
     * @param newChild 
     */
    configureNewChild(newChild: Element){}

    updateLightChildren(element: Element, item: any, idx: number){}
    disconnectedCallback(){
        //TODO
    }

    doNewList({}: this){
        
    }

    mapItemToNewOrPooledElement(item: TUIElement, idx: number, relativeTo: Element, relation: relation): Element{
        const group = this.getGroup(item);
        let newEl: Element | undefined;
        //test next few siblings for a match
        let ns = relativeTo;
        for(let i = 0; i < 4; i++){
            ns = ns.nextElementSibling as HTMLElement;
            if(ns === null || !this.ownedSiblings.has(ns)) break;
            if(this.getGroup!(ns as TUIElement) === group){
                //in the same pool
                newEl = ns;
                break;
            }
        }
        if(newEl === undefined){
            //search stow away pool
            let elementPool = this.elementPools[group];
            if(elementPool === undefined){
                elementPool = Array.from(this.children).filter(x => this.getGroup(x) === group);
                this.elementPools[group] = elementPool;
            }
            if(elementPool.length > 0){
                newEl = elementPool.pop();
            }else{
                newEl = document.createElement(group);
            }
        }
        

    }


    getGroup(item: TUIElement | Element): string{
        // if(Array.isArray(item)){
        //     return item[0].localName;
        // }
        return (<any>item).localName;        
    }
}

export interface IBidCore extends IBidProps{}

const ce = new CE<IBidProps, IBidActions>({
    config:{
        tagName: 'i-bid',
        style:{
            display: 'none'
        }
    },
    superclass: IBidCore,
});