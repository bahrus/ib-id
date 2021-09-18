import { XE } from 'xtal-element/src/XE.js';
import { transform, processTargets } from 'trans-render/lib/transform.js';
import { PE } from 'trans-render/lib/PE.js';
import { SplitText } from 'trans-render/lib/SplitText.js';
/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement {
    #firstIdx;
    #lastIdx;
    initContext({ transform }) {
        return {
            ctx: {
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
            },
        };
    }
    searchById({ id }) {
        const target = this.getRootNode().querySelector(`[data-from="${id}"`);
        if (!target)
            throw 'no repeating template found';
        return { target };
    }
    doRelativeSearch({ fromPrevious, searchFor }) {
        let target = this;
        if (fromPrevious) {
            while (target && !target.matches(fromPrevious)) {
                target = target.previousElementSibling;
            }
        }
        if (!target)
            return;
        if (searchFor) {
            target = target.querySelector(searchFor);
        }
        if (!target)
            return;
        return { target };
    }
    createTemplates({ target, updatable }) {
        let template;
        if (!this.id) {
            {
                this.id = 'a_' + Math.random().toString().replace('.', '_'); //use crypto.randomUUID() when supported;
            }
        }
        if (target instanceof HTMLTemplateElement) {
            template = target;
            if (updatable) {
                const refTemplate = document.createElement('template');
                refTemplate.dataset.ref = this.id;
                template.content.prepend(refTemplate);
            }
        }
        else {
            template = document.createElement('template');
            template.dataset.from = this.id;
            if (updatable) {
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
            templateGroups: {
                'default': template
            }
        };
    }
    initReadonlyList({ list, templateGroups, mainTemplate, ctx }) {
        let elementToAppendTo = mainTemplate;
        const defaultTemplate = templateGroups.default;
        for (const item of list) {
            const clonedTemplate = document.importNode(defaultTemplate.content, true);
            ctx.host = item;
            transform(clonedTemplate, ctx);
            const children = Array.from(clonedTemplate.children);
            for (const child of children) {
                elementToAppendTo.insertAdjacentElement('afterend', child);
                elementToAppendTo = child;
            }
        }
    }
    initUpdatableList({}) {
        return {
            listInitialized: true,
        };
    }
    #clonedTemplates = new WeakMap();
    findNextTempl(lastTempl, count, root) {
        if (lastTempl === undefined) {
            return root.querySelector(`template[data-ref="${this.id}"][data-idx="${count}"]`);
        }
        const itemCountToSkip = Number(lastTempl.dataset.cnt);
        let nextSib = lastTempl;
        for (let i = 0; i < itemCountToSkip; i++) {
            if (nextSib === null)
                throw 'NI';
            nextSib = nextSib.nextElementSibling;
        }
        return nextSib;
    }
    hideExcessElements(prevLastTempl, lastIdx) {
        let idxTempl = prevLastTempl;
        while (idxTempl !== null && idxTempl !== lastIdx) {
            const itemCountToHide = Number(idxTempl.dataset.cnt);
            let ns = idxTempl.nextElementSibling;
            for (let i = 1; i < itemCountToHide; i++) {
                if (ns === null)
                    throw 'NIW'; //no idea why
                ns.classList.add('ibid-hidden');
                //ns.style.display = 'none';
                ns = ns.nextElementSibling;
            }
            if (ns === null)
                throw 'NIW'; //no idea why
            idxTempl = ns.nextElementSibling;
        }
    }
    updateList({ list, templateGroups, mainTemplate, ctx }) {
        let elementToAppendTo = mainTemplate;
        const defaultTemplate = templateGroups.default;
        let count = 0;
        const root = this.getRootNode();
        let prevTempl;
        let foundPreviousLastTempl = false;
        const prevLastTempl = this.#lastIdx;
        for (const item of list) {
            let idxTempl = null;
            if (this.#firstIdx !== undefined) {
                idxTempl = this.findNextTempl(prevTempl, count, root);
                if (idxTempl === prevTempl) {
                    foundPreviousLastTempl = true;
                }
            }
            if (idxTempl !== null) {
                this.#lastIdx = idxTempl;
                prevTempl = idxTempl;
                const targets = [];
                const cnt = parseInt(idxTempl.dataset.cnt) - 1;
                let ithSib = 0;
                let sib = idxTempl.nextElementSibling;
                while (ithSib < cnt && sib !== null) {
                    targets.push(sib);
                    sib = sib.nextElementSibling;
                    ithSib++;
                }
                ctx.host = item;
                processTargets(ctx, targets);
            }
            else {
                const clonedTemplate = document.importNode(defaultTemplate.content, true);
                ctx.host = item;
                const idxTemplate = clonedTemplate.firstElementChild;
                idxTemplate.dataset.idx = count.toString();
                transform(clonedTemplate, ctx);
                const children = Array.from(clonedTemplate.children);
                idxTemplate.dataset.cnt = children.length.toString();
                for (const child of children) {
                    elementToAppendTo.insertAdjacentElement('afterend', child);
                    elementToAppendTo = child;
                }
                if (count === 0) {
                    this.#firstIdx = idxTemplate;
                }
                this.#lastIdx = idxTemplate;
            }
            count++;
        }
        ;
        if (!foundPreviousLastTempl && prevLastTempl !== undefined && this.#lastIdx !== undefined)
            this.hideExcessElements(this.#lastIdx, prevLastTempl);
        return {};
    }
    getNestedList({ listSrc, listProp }) {
        const ref = listSrc.ref;
        const idx = Number(listSrc.idx);
        const containerIbid = this.getRootNode().querySelector('#' + ref);
        const list = containerIbid.list[idx][listProp];
        return { list };
    }
    async findTemplIdx({}) {
        const { upSearch } = await import('trans-render/lib/upSearch.js');
        const cssSel = 'template[data-ref][data-idx]';
        const templ = upSearch(this, cssSel);
        if (templ === null)
            throw `Could not locate ${cssSel}.  Make sure updatable is set`;
        return {
            listSrc: templ.dataset
        };
    }
}
const noParse = {
    parse: false,
};
const ce = new XE({
    config: {
        tagName: 'i-bid',
        propDefaults: {
            isC: true,
            listInitialized: false,
            updatable: false,
            fromPrevious: '',
            searchFor: '',
            listProp: '',
            autoNest: false,
        },
        propInfo: {
            target: noParse,
            templateGroups: noParse
        },
        actions: {
            initContext: {
                ifAllOf: ['isC', 'transform']
            },
            searchById: {
                ifAllOf: ['isC', 'id'],
                ifNoneOf: ['fromPrevious', 'searchFor']
            },
            doRelativeSearch: {
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
            getNestedList: {
                ifAllOf: ['listSrc', 'listProp']
            },
            findTemplIdx: {
                ifAllOf: ['isC', 'autoNest'],
                async: true,
            }
        },
        style: {
            display: 'none'
        },
    },
    superclass: IBidCore,
});
