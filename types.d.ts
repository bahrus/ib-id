import {IBid} from './i-bid.js';
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
}

export interface IBidActions{
    initContext(self: this): {
        ctx: RenderContext
    }
    searchForTarget(self: this): {target: Element}
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
    
}



