
export interface IbIdProps extends Partial<HTMLElement>{
    tag?: string | undefined;
    map? : undefined | ((x: any, idx?: number) => any);
    list: any[],
    initCount?: number | undefined;
    initialized?: boolean | undefined;
    grp1: (x: any) => string;
    grp1LU: {[key: string] : Set<HTMLElement>}
}

declare global {
    interface HTMLElementTagNameMap {
        "ib-id": IbIdProps,
    }
}