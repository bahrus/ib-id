import { XE } from 'xtal-element/src/XE.js';
/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore extends HTMLElement {
    connectedCallback() {
        if (!this.id)
            throw 'id required';
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
    initReadonlyList({ list, templateGroups, mainTemplate }) {
        let elementToAppendTo = mainTemplate;
        const defaultTemplate = templateGroups.default;
        for (const item of list) {
            const clonedTemplate = document.importNode(defaultTemplate.content, true);
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
            searchForTarget: {
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
        style: {
            display: 'none'
        },
    },
    superclass: IBidCore,
});
