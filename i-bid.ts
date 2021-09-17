import {XE, PropInfo} from 'xtal-element/src/XE.js';
import {transform, processTargets} from 'trans-render/lib/transform.js';
import {IBidProps, IBidActions} from './types';
import { PE } from 'trans-render/lib/PE.js';
import { SplitText } from 'trans-render/lib/SplitText.js';
import { RenderContext } from 'trans-render/lib/types';
import {upSearch} from 'trans-render/lib/upSearch.js';

/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement implements IBidActions{

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
                    },
                    {
                        rhsType: String,
                        ctor: SplitText,
                    }
                ],
            } as RenderContext,
        }
    }
    searchById({id}: this){
        const target = (this.getRootNode() as DocumentFragment).querySelector(`[data-from="${id}"`);
        if(!target) throw 'no repeating template found';
        return {target};
    }
    doRelativeSearch({fromPrevious, searchFor}: this){
        let target = this as Element | null;
        if(fromPrevious){
            while(target && !target.matches(fromPrevious)){
                target = target.previousElementSibling;
            }
        }
        if(!target) return;
        if(searchFor){
            target = target.querySelector(searchFor);
        }
        if(!target) return;
        return {target};
    }
    createTemplates({target, updatable}: this){
        let template: HTMLTemplateElement;
        if(!this.id){{
            this.id = 'a_' + Math.random().toString().replace('.', '_');  //use crypto.randomUUID() when supported;
        }}
        if(target instanceof HTMLTemplateElement){
            template = target as HTMLTemplateElement;
            if(updatable){
                const refTemplate = document.createElement('template');
                refTemplate.dataset.ref = this.id;
                template.content.prepend(refTemplate);
            }
        }else{
            template = document.createElement('template');
            template.dataset.from = this.id;
            if(updatable){
                const refTemplate = document.createElement('template');
                refTemplate.dataset.ref = this.id;
                template.content.prepend(refTemplate);
                //template.content.appendChild(refTemplate);
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
    #clonedTemplates = new WeakMap<HTMLTemplateElement, DocumentFragment>();
    updateList({list, templateGroups, mainTemplate, ctx}: this){
        let elementToAppendTo = mainTemplate as Element;
        const defaultTemplate = templateGroups.default;
        let count = 0;
        const root = this.getRootNode() as DocumentFragment;
        for(const item of list){
            const idxTempl = root.querySelector(`template[data-ref="${this.id}"][data-idx="${count}"]`) as HTMLTemplateElement | null;
            if(idxTempl !== null){
                const targets: Element[] = [];
                const cnt = parseInt(idxTempl.dataset.cnt!) - 1;
                let ithSib = 0;
                let sib = idxTempl.nextElementSibling as Element | null;
                while(ithSib < cnt && sib !== null){
                    targets.push(sib);
                    sib = sib.nextElementSibling;
                    ithSib++;
                }
                ctx.host = item;
                processTargets(ctx, targets);
            }else{
                const clonedTemplate = document.importNode(defaultTemplate.content, true);
                ctx.host = item;
                const idxTemplate = clonedTemplate.firstElementChild as HTMLTemplateElement;
                idxTemplate.dataset.idx = count.toString();
                
                transform(clonedTemplate, ctx);
                const children = Array.from(clonedTemplate.children);
                idxTemplate.dataset.cnt = children.length.toString();
                for(const child of children){
                    elementToAppendTo.insertAdjacentElement('afterend', child)!;
                    elementToAppendTo = child;
                }
            }
            count++;
        };
        return {};
    }

    getNestedList({target}: this){
        const templ = upSearch( target, 'template[data-ref][data-idx') as HTMLElement;
        if(templ === null){
            setTimeout(() => this.getNestedList(this), 50);
            return;
        }
        const ref = templ.dataset.ref;
        const idx = Number(templ.dataset.idx);
        const containerIbid = (this.getRootNode()! as DocumentFragment).querySelector('#' + ref);
        const list = (<any>containerIbid).list[idx] as any[];
        return {list};
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
            fromPrevious: '',
            searchFor: '',
            isNested: false,
        },
        propInfo:{
            target: noParse,
            templateGroups: noParse
        },
        actions:{
            initContext:{
                ifAllOf: ['isC', 'transform']
            },
            searchById:{
                ifAllOf: ['isC', 'id'],
                ifNoneOf: ['fromPrevious', 'searchFor']
            },
            doRelativeSearch:{
                ifAtLeastOneOf: ['fromPrevious', 'searchFor']
            },
            createTemplates: {
                ifAllOf: ['target'],
            },
            initReadonlyList: {
                ifAllOf: ['templateGroups', 'list', 'ctx'],
                ifNoneOf: ['updatable'],
                setFree: ['target'],
            },
            initUpdatableList: {
                ifAllOf: ['templateGroups', 'list', 'updatable', 'ctx'],
                setFree: ['target'],
            },
            updateList: {
                ifAllOf: ['listInitialized', 'list', 'updatable']
            },
            getNestedList:{
                ifAllOf: ['isC', 'isNested', 'target'],
                
            }
        },
        style:{
            display: 'none'
        },

    },
    superclass: IBidCore,
});