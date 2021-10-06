import {XE, PropInfo} from 'xtal-element/src/XE.js';
import {html} from 'trans-render/lib/html.js';
import {transform, processTargets} from 'trans-render/lib/transform.js';
import {IBidProps, IBidActions} from './types';
import { PE } from 'trans-render/lib/PE.js';
import { SplitText } from 'trans-render/lib/SplitText.js';
import { RenderContext } from 'trans-render/lib/types';
import { applyP } from 'trans-render/lib/applyP.js';
/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement implements IBidActions{
    #firstIdx: HTMLTemplateElement | undefined;
    #lastIdx: HTMLTemplateElement | undefined;
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
    initReadonlyTagList({tagList}: this){
        let elementToAppendTo = this as HTMLElement;
        for(const item of tagList){
            const el = document.createElement(item.localName!);
            applyP(el, [item]);
            elementToAppendTo.insertAdjacentElement('afterend', el);
            elementToAppendTo = el;
        }
    }
    initUpdatableList({}: this){
        return {
            listInitialized: true,
        } 
    }
    #clonedTemplates = new WeakMap<HTMLTemplateElement, DocumentFragment>();
    findNextTempl(lastTempl: HTMLTemplateElement | undefined, count: number, root: DocumentFragment){
        if(lastTempl === undefined){
            return root.querySelector(`template[data-ref="${this.id}"][data-idx="${count}"]`) as HTMLTemplateElement | null;
        }
        const itemCountToSkip = Number(lastTempl.dataset.cnt);
        let nextSib: Element | null = lastTempl;
        for(let i = 0; i < itemCountToSkip; i++){
            if(nextSib === null) throw 'NI';
            nextSib = nextSib.nextElementSibling;
        }
        return nextSib as HTMLTemplateElement | null;
    }
    hideExcessElements(prevLastTempl: HTMLTemplateElement, lastIdx: HTMLTemplateElement){
        let idxTempl = this.findNextTempl(lastIdx, 0, null as any as DocumentFragment);
        while(idxTempl!==null && idxTempl.dataset.ref === this.id){
            const itemCountToHide = Number(idxTempl.dataset.cnt);
            idxTempl.dataset.isArchived = 'true';
            let ns = idxTempl.nextElementSibling;
            for(let i = 1; i < itemCountToHide; i++){
                if(ns === null) throw 'NIW';  //no idea why
                ns.classList.add('ibid-hidden');
                //ns.style.display = 'none';
                ns = ns.nextElementSibling;
            }
            idxTempl = this.findNextTempl(idxTempl, 0, null as any as DocumentFragment);
        }
    }
    updateList({list, templateGroups, mainTemplate, ctx}: this){
        let elementToAppendTo = mainTemplate as Element;
        const defaultTemplate = templateGroups.default;
        let count = 0;
        const root = this.getRootNode() as DocumentFragment;
        let prevTempl: HTMLTemplateElement | undefined;
        let foundPreviousLastTempl = false;
        const prevLastTempl = this.#lastIdx;
        for(const item of list){
            let idxTempl: HTMLTemplateElement | null = null;
            if(this.#firstIdx !== undefined){
                idxTempl = this.findNextTempl(prevTempl, count, root);
                if(idxTempl === prevTempl){
                    foundPreviousLastTempl = true;
                }
            } 
            if(idxTempl !== null){
                this.#lastIdx = idxTempl;
                prevTempl = idxTempl
                const targets: Element[] = [];
                const cnt = parseInt(idxTempl.dataset.cnt!) - 1;
                let ithSib = 0;
                idxTempl.dataset.isArchived = 'false';
                let sib = idxTempl.nextElementSibling as Element | null;
                while(ithSib < cnt && sib !== null){
                    targets.push(sib);
                    sib = sib.nextElementSibling;
                    ithSib++;
                }
                ctx.host = item;
                processTargets(ctx, targets);
                for(const t of targets){
                    t.classList.remove('ibid-hidden');
                }
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
                if(count === 0){
                    this.#firstIdx = idxTemplate;
                }
                this.#lastIdx = idxTemplate;
            }
            count++;
        };
        if(!foundPreviousLastTempl && prevLastTempl !== undefined && this.#lastIdx !== undefined){
            this.hideExcessElements(prevLastTempl, this.#lastIdx);
        }
        return {};
    }

    getNestedList({listSrc, listProp}: this){
        const ref = listSrc.ref;
        const idx = Number(listSrc.idx);
        const containerIbid = (this.getRootNode()! as DocumentFragment).querySelector('#' + ref);
        const list = (<any>containerIbid).list[idx][listProp] as any[];
        return {list};
    }

    async findTemplIdx({}: this){
        const {upSearch} = await import('trans-render/lib/upSearch.js');
        const cssSel = 'template[data-ref][data-idx]'
        const templ = upSearch(this, cssSel) as HTMLTemplateElement | null;
        if(templ === null) throw `Could not locate ${cssSel}.  Make sure updatable is set`;
        if(templ.dataset.isArchived === 'true') return {};
        return {
            listSrc: templ.dataset
        };
    }

    createHiddenClass({}: this){
        this.appendChild(hiddenStyle.content.cloneNode(true));
    }
}

const hiddenStyle = html`
<style>
    .ibid-hidden{
        display: none;
    }
</style>
`;

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
            listProp: '',
            autoNest: false,
        },
        propInfo:{
            target: noParse,
            templateGroups: noParse,
            id:{
                type: 'String'
            }
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
            initReadonlyTagList: {
                ifAllOf: ['tagList'],
                ifNoneOf: ['updatable']
            },
            initUpdatableList: {
                ifAllOf: ['templateGroups', 'list', 'updatable', 'ctx'],
                setFree: ['target'],
            },
            updateList: {
                ifAllOf: ['listInitialized', 'list', 'updatable']
            },
            getNestedList: {
                ifAllOf: ['listSrc', 'listProp']
            },
            findTemplIdx: {
                ifAllOf: ['isC', 'autoNest'],
                async: true,
            },
            createHiddenClass: {
                ifAllOf: ['isC'],
            }
        },
        style:{
            display: 'none'
        },

    },
    superclass: IBidCore,
});