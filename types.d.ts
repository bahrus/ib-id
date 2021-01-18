export interface IbIdProps extends Partial<HTMLElement>{
    tag?: string | undefined;
    map? : undefined | ((x: any, idx?: number) => any);
    list: any[]
}

declare global {
    interface HTMLElementTagNameMap {
        "ib-id": IbIdProps,
    }
}