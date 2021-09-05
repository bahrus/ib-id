import {XE, PropInfo} from 'xtal-element/src/XE.js';
import {transform} from 'trans-render/lib/transform.js';
import {IBidProps, IBidActions} from './types';
import { PE } from 'trans-render/lib/PE.js';
import { SplitText } from 'trans-render/lib/SplitText.js';
import { RenderContext } from './node_modules/trans-render/lib/types';
/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement implements IBidActions{
    connectedCallback(){
        if(!this.id) throw 'id required';
    }
    initContext({transform}: this){
        return {
            ctx:{
                match: transform,
                postMatch: [
                    {
                        rhsType: Array,
                        rhsHeadType: Object,
                        ctor: PE
                    },
                    {
                        rhsType: Array,
                        rhsHeadType: String,
                        ctor: SplitText
                    }
                ],
            } as RenderContext,
        }
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
            target.removeAttribute('data-from');
            template.content.appendChild(target);
        }
        
        return {
            mainTemplate: template,
            templateGroups:{
                'default': template
            }
        };
    }
    initReadonlyList({list, templateGroups, mainTemplate, ctx}: this){
        let elementToAppendTo = mainTemplate as Element;
        const defaultTemplate = templateGroups.default;
        for(const item of list){
            const clonedTemplate = document.importNode(defaultTemplate.content, true);
            ctx.host = item;
            transform(clonedTemplate, ctx);
            const children = Array.from(clonedTemplate.children);
            for(const child of children){
                elementToAppendTo.insertAdjacentElement('afterend', child);
                elementToAppendTo = child;
            }
        }
    }
    initUpdatableList({}: this){
        return {
            listInitialized: true,
        } 
    }
    updateList({list, templateGroups, mainTemplate, ctx}: this){
        let elementToAppendTo = mainTemplate as Element;
        const defaultTemplate = templateGroups.default;
        let count = 0;
        for(const item of list){
            const clonedTemplate = document.importNode(defaultTemplate.content, true);
            ctx.host = item;
            const idxTemplate = clonedTemplate.firstElementChild as HTMLTemplateElement;
            idxTemplate.dataset.idx = count.toString();
            count++;
            transform(clonedTemplate, ctx);
            const children = Array.from(clonedTemplate.children);
            for(const child of children){
                elementToAppendTo.insertAdjacentElement('afterend', child)!;
                elementToAppendTo = child;
            }
        };
        return {};
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
            initContext:{
                ifAllOf: ['isC', 'transform']
            },
            searchForTarget:{
                ifAllOf: ['isC']
            },
            createTemplates: {
                ifAllOf: ['target'],
                setFree: ['target']
            },
            initReadonlyList: {
                ifAllOf: ['templateGroups', 'list', 'ctx'],
                ifNoneOf: ['updatable']
            },
            initUpdatableList: {
                ifAllOf: ['templateGroups', 'list', 'updatable', 'ctx']
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