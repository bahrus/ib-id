import { XE } from 'xtal-element/src/XE.js';
import { transform, processTargets } from 'trans-render/lib/transform.js';
import { PE } from 'trans-render/lib/PE.js';
import { SplitText } from 'trans-render/lib/SplitText.js';
/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement {
    connectedCallback() {
        if (!this.id)
            throw 'id required';
    }
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
                    }
                ],
            },
        };
    }
    searchForTarget({ id }) {
        const target = this.getRootNode().querySelector(`[data-from="${id}"`);
        if (!target)
            throw 'no repeating template found';
        return { target };
    }
    createTemplates({ target, updatable }) {
        let template;
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
    updateList({ list, templateGroups, mainTemplate, ctx }) {
        let elementToAppendTo = mainTemplate;
        const defaultTemplate = templateGroups.default;
        let count = 0;
        const root = this.getRootNode();
        for (const item of list) {
            const idxTempl = root.querySelector(`template[data-ref="${this.id}"][data-idx="${count}"]`);
            if (idxTempl !== null) {
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
            }
            count++;
        }
        ;
        return {};
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
        },
        propInfo: {
            target: noParse,
            templateGroups: noParse
        },
        actions: {
            initContext: {
                ifAllOf: ['isC', 'transform']
            },
            searchForTarget: {
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
        style: {
            display: 'none'
        },
    },
    superclass: IBidCore,
});
