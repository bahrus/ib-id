import { XE } from 'xtal-element/src/XE.js';
import { transform } from 'trans-render/lib/transform.js';
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
            throw 'NI';
        }
        else {
            template = document.createElement('template');
            template.dataset.from = this.id;
            if (updatable) {
                const refTemplate = document.createElement('template');
                refTemplate.dataset.ref = this.id;
                template.content.appendChild(refTemplate);
            }
            target.insertAdjacentElement('afterend', template);
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
            for (const child of clonedTemplate.children) {
                elementToAppendTo.insertAdjacentElement('afterend', child);
                elementToAppendTo = child;
            }
        }
    }
    initUpdatableList({}) {
        throw 'NI';
    }
    updateList({}) {
        throw 'NI';
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
                ifAllOf: ['templateGroups', 'list', 'updatable']
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
