
export interface IbIdProps extends Partial<HTMLElement>{
    tag?: string | undefined;
    map? : undefined | ((x: any, idx?: number) => any);
    list?: any[],
    ownedSiblingCount?: number | undefined;
    initialized?: boolean | undefined;
    ownedSiblings?: WeakSet<Element>;
    grp1?: (x: any) => string;
    grp1LU: {[key: string] : Element[]};
    lastGroupedSibling: Element | undefined;
    startingSibling: Element | undefined;
    applyToNext: string | undefined;
    renderTo: string | undefined;
}

declare global {
    interface HTMLElementTagNameMap {
        "ib-id": IbIdProps,
    }
}