import {IBid} from './i-bid.js';

export interface IBidProps{
    self: IBid;
    tag: string | undefined;
    /**
     * map allows mapping a general list to props to be set on the UI component.
    */
    map : undefined | ((x: any, idx?: number) => any);
    list: any[],
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
    // /**
    //  * @prop {boolean} stamp - Add id of this element (and auto-create unique id if none provided) to every element of list.  Also add index of every element.
    //  * @attr {boolean} stamp - Add id of this element (and auto-create unique id if none provided) to every element of list.
    //  */
    // stamp: boolean | undefined;

    // /**
    //  * @prop {string} stampId - Key to use when stamping id to every element of list.  Only applicable if property stamp is true.
    //  * @attr {string} stamp-id - Key to use when stamping id to every element of list.  Only applicable if property stamp is true.
    //  */
    // stampId: string | undefined;

    // /**
    //  * @prop {string} stampIndex - Key to use when stamping index to every element of list.  Only applicable if property stamp is true.
    //  * @attr {string} stamp-index - Key to use when stamping index to every element of list.  Only applicable if property stamp is true.
    //  */
    // stampIndex: string | undefined;

    useWeakMap: boolean | undefined;

}

declare global {
    interface HTMLElementTagNameMap {
        "ib-id": IBidProps,
    }
}