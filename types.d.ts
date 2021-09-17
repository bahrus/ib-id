import { RenderContext } from './node_modules/trans-render/lib/types.js';

export interface IBidProps{
    target: Element;
    isC: boolean;
    templateGroups: {[key: string]: HTMLTemplateElement};
    mainTemplate: HTMLTemplateElement;
    list: any[];
    transform: any;
    listFragment: DocumentFragment;
    listInitialized: boolean;
    updatable: boolean;
    ctx: RenderContext;
    fromPrevious: string;
    searchFor: string;
    id: string;
    isNested: boolean;
}

export interface IBidActions{
    initContext(self: this): {
        ctx: RenderContext
    }
    searchById(self: this): {target: Element}
    doRelativeSearch(self: this): {target:Element} | undefined;
    createTemplates(self: this):{
        mainTemplate: HTMLTemplateElement,
        templateGroups: {[key: string]: HTMLTemplateElement}
    }
    initReadonlyList(self: this):void;
    initUpdatableList(self: this):{
        //listFragment: DocumentFragment,
        listInitialized: boolean,
    }
    updateList(self: this):{

    }

    getNestedList(self: this):{
        list: any[];
    } | undefined;
    
}



