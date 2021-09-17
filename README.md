<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ibid 

This package contains a suite of web components, depending on the placement of the dash -- i-bid, ib-id[TODO], ibi-d[TODO].

Each of them provide a simple, 1-dimensional list generating web component*.  They generate lists of (Custom) DOM elements from JSON, but can complement server-side rendering.

## Use cases

Often, an API will provide a JSON list (array of items) that is purely devoted to describing the business entities it represents (tailored somewhat, perhaps, for the particular view to be presented).  (Let's park the important question of SSR for the time being).

Most repeater web components (there aren't that many, thanks to ES Modules greatly preceding HTML Modules), including grid web components, provide helpful mapping between what the API provides, vs what the UI requires, via some form of moustache-style syntax, for the light children.

However, ibid's focus is on a different use case than other repeating web components:

1.  It has full, first-class support for enumerated tag names[WIP].
2.  It can complement server-side (initial) rendering.
3.  It does **not** provide any support for template binding of the light children within each element.  It only provides support for a linear list of (a potpourri of) tags.  This means to use ibid effectively, you will want a rapid way of encapsulating the markup you want within each tag (and a nice IDE and/or IDE plugin which can easily navigate to the code of a custom element -- [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) does this quite effectively for js-based web components, for example).
4.  It renders its content (near-) adjacent to itself, so that it can insert content inside built-in list elements, or table elements, without violating proper HTML decorum.

Why provide support for different tags?  Consider a few scenarios:

1.  Lists of repeating elements that alternate between a few tags - like the [Description List Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
2.  "Higher order" lists of entities, where the entities take a variety of forms --  [Cells of a Jupyter Notebook](https://code.visualstudio.com/docs/datascience/jupyter-notebooks#_variable-explorer-and-data-viewer), for example

What this means is that the mapping that other libraries focus on, within the light children, is moot for this component.  The focus ibid has is on mapping the JSON data to properties of the (custom) DOM element(s).  However, some care is taken so that ibid can be extended with support for dynamic light children as well.

## Syntax Example I

```html
<ul>
    <li>Head Item</li>
    <li data-from=li-gen>...</li>
    <li>Footer Item</li>
</ul>
<i-bid 
    id=li-gen 
    list='["hello", "world"]',
    transform='{"li": ["."]}'
></i-bid>
```

Generates:

```html
<ul>
    <li>Head Item</li>
    <li>hello</li>
    <li>world</li>
    <li>Footer</li>
</ul>
<i-bid 
    id=li-gen 
    list='["hello", "world"]',
    transform='{"li": ["."]}'
></i-bid>
```

## Syntax Example II -- Updatable

```html
<ul>
    <li>Head Item</li>
    <li data-from=li-gen>...</li>
    <li>Footer Item</li>
</ul>
<i-bid 
    id=li-gen 
    list='["hello", "world"]'
    transform='{"li": ["."]}'
    updatable>
</i-bid>
```

Generates:

```html
<ul>
    <li>Head Item</li>
    <template data-ref=li-gen data-idx=0></template>
    <li>hello</li>
    <template data-ref=li-gen data-idx=1></template>
    <li>world</li>
    <li>Footer</li>
</ul>
<i-bid id=li-gen list='["hello", "world"]' updatable></i-bid>
```

So the only difference is the presence of the updatable attribute.  The presence of that attribute helps to provide master / detail binding, and also is required for nested ibid's.

## Syntax Example III -- multiple elements per iteration.

```html
<dl>
    <dt>Definition</dt>
    <dd>Meaning of the word</dd>
    <template data-from=dl-gen>
        <dt></dt>
        <dd></dd>
    </template>
</dl>
<i-bid id=dl-gen 
    list='[{"term": "nah", "def": "not so"}, {"term":"goo", "def": "a viscid or sticky substance"}]' 
    updatable
    transform='
    {
        "dtElements": ["term"],
        "ddElements": ["def"]
    }
    '
>
</i-bid>
```

generates

```html
<dl>
    <dt>Definition</dt>
    <dd>Meaning of the word</dd>
    <template data-ref=dl-gen data-idx=0></template>
    <dt>nah</dt><dd>not so</dd>
    <template data-ref=dl-gen data-idx=1></template>
    <dt>goo</dt><dd>a viscid or sticky substance</dd>
</dl>
<i-bid id=dl-gen list='[{"term": "nah", "def": "not so"}, {"term":"goo", "def": "a viscid or sticky substance"}]' updatable></i-bid>
```

## Syntax Example IV -- Nested ibid's.

```html
<i-bid is-nested>
</i-bid>
```

This causes i-bid to get the list of items by performing an "upsearch" for a containing ib-id element's item it is bound to.

## Syntax Example V [TODO]

```html
<my-notebook>
    <template data-from=notebook-gen>
        <template itemprop=searchbox>
            <label></label>
            <input type=search>
        </template>
        <template itemprop=grid>
            <my-grid></my-grid>
        </template>
    </template>
</my-notebook>
<i-bid id=notebook-gen list='
    [
        {"type": "searchbox", "hint": "Enter SSN", "label": },
        {"type": "grid" "data": {}}
    ]
'
templ-match-on=type
transform='
"searchbox":{

},
"grid":{

}
'
updatable>
</i-bid >
```

generates

```html
<my-notebook>
    <template data-ref=notebook-gen data-idx=0 data-templ-idx=0></template>
    <input placeholder="Enter Name">
    <template data-ref=notebook-gen data-idx=1 data-templ-idx=1></template>
    <my-grid></my-grid>
</my-notebook>
<i-bid>
<!--In memory -->
<template if-all-of=[]>
</i-bid>
```
