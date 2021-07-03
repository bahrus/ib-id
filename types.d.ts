import {IBid} from './i-bid.js';

export interface IBidProps{
    self: IBid;
    tag?: string | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
    */
    map? : undefined | ((x: any, idx?: number) => any);
    list?: any[],
    ownedSiblingCount?: number | undefined;
    initialized?: boolean | undefined;
    ownedSiblings?: WeakSet<Element>;
    grp1?: (x: any) => string;
    grp1LU: {[key: string] : Element[]};
    lastGroupedSibling: Element | undefined;
    startingSibling: Element | undefined;
    matchClosest: string | undefined;
    renderAfter: string | undefined;

}

declare global {
    interface HTMLElementTagNameMap {
        "ib-id": IBidProps,
    }
}