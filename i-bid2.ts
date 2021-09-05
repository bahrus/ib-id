import {XE, PropInfo} from 'xtal-element/src/XE.js';
import {insertAdjacentTemplate} from 'trans-render/lib/insertAdjacentTemplate.js';
import {IBidProps, IBidActions} from './types';

/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement implements IBidActions{
    connectedCallback(){
        if(!this.id) throw 'id required';
    }
    searchForTarget({id}: this){
        const target = (this.getRootNode() as DocumentFragment).querySelector(`[data-from="${id}"`);
        if(!target) throw 'no repeating template found';
        return {target};
    }
    createTemplates({target, updatable}: this){
        let template: HTMLTemplateElement;
        if(target instanceof HTMLTemplateElement){
            throw 'NI'
        }else{
            template = document.createElement('template');
            template.dataset.from = this.id;
            if(updatable){
                const refTemplate = document.createElement('template');
                refTemplate.dataset.ref = this.id;
                template.content.appendChild(refTemplate);
            }
            target.insertAdjacentElement('afterend', template);
            template.content.appendChild(target);
        }
        
        return {
            mainTemplate: template,
            templateGroups:{
                'default': template
            }
        };
    }
    initReadonlyList({list, templateGroups, mainTemplate}: this){
        let elementToAppendTo = mainTemplate as Element;
        const defaultTemplate = templateGroups.default;
        for(const item of list){
            const clonedTemplate = document.importNode(defaultTemplate.content, true);
            for(const child of clonedTemplate.children){
                elementToAppendTo.insertAdjacentElement('afterend', child);
                elementToAppendTo = child;
            }
        }
    }
    initUpdatableList({}: this){
        throw 'NI';
    }
    updateList({}: this){
        throw 'NI';
    }
}

export interface IBidCore extends IBidProps{}
const noParse: PropInfo = {
    parse: false,
}
const ce = new XE<IBidProps, IBidActions>({
    config:{
        tagName: 'i-bid',
        propDefaults:{
            isC: true,
            listInitialized: false,
            updatable: false,
        },
        propInfo:{
            target: noParse,
            templateGroups: noParse
        },
        actions:{
            searchForTarget:{
                ifAllOf: ['isC']
            },
            createTemplates: {
                ifAllOf: ['target'],
                setFree: ['target']
            },
            initReadonlyList: {
                ifAllOf: ['templateGroups', 'list'],
                ifNoneOf: ['updatable']
            },
            initUpdatableList: {
                ifAllOf: ['templateGroups', 'list', 'updatable']
            },
            updateList: {
                ifAllOf: ['listInitialized', 'list', 'updatable']
            }
        },
        style:{
            display: 'none'
        },

    },
    superclass: IBidCore,
});