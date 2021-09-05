import {IBid} from './i-bid.js';

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
}

export interface IBidActions{
    searchForTarget(self: this): {target: Element}
    createTemplates(self: this):{
        mainTemplate: HTMLTemplateElement,
        templateGroups: {[key: string]: HTMLTemplateElement}
    }
    initReadonlyList(self: this):void;
    initUpdatableList(self: this):{
        listFragment: DocumentFragment,
        listInitialized: true,
    }
    updateList(self: this):{

    }
    
}



