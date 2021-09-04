import {IBid} from './i-bid.js';

export interface IBidProps<TItem = any, TUIElement extends UIElement = Element>{
    self: IBid;
    tag: string | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
    */
    map : undefined | ((x: TItem, idx: number) => TUIElement);
    list: TItem[],
    ownedSiblingCount: number | undefined;
    initialized: boolean | undefined;
    ownedSiblings?: WeakSet<Element>;
    grp1?: (x: any) => string;
    grp1LU: {[key: string] : Element[]};
    lastGroupedSibling: Element | undefined;
    previousUngroupedSibling: Element | undefined;
    parentToRenderTo: Element | undefined;
    matchClosest: string | undefined;
    renderAfter: string | undefined;
    renderAtStartOf: string | undefined;

    bindToTagVirtually: boolean | undefined;
    /**
     * @private
     */
    weakMap: WeakMap<Element, any> | undefined;

}

export interface IBidActions{
    markOwnership: (self: this) => {}
}

export interface UIElement extends Partial<Element>{
    localName: string
}

export type relation = 'parent' | 'previousSibling';

