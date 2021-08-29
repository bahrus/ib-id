import {CE} from 'trans-render/lib/CE.js';
import {IBidProps, IBidActions} from './types';
import {GroupedSiblings} from 'xtal-element/lib/GroupedSiblings.js';

/**
 * @element i-bid
 * @tagName i-bid
 */
export class IBidCore <TItem = any> extends HTMLElement{

    disconnectedCallback(){
        //TODO
    }
}

export interface IBidCore extends IBidProps{}

const ce = new CE<IBidProps, IBidActions>({
    config:{
        tagName: 'i-bid',
        style:{
            display: 'none'
        }
    },
    superclass: IBidCore,
    mixins: [GroupedSiblings]
});