<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ibid 

This package contains a suite of web components, depending on the placement of the dash -- i-bid, ib-id[TODO], ibi-d[TODO].

Each of them provide a simple, 1-dimensional list generating web component*.  They generate lists of (Custom) DOM elements from JSON, but can complement server-side rendering.

## Use cases

Often, an API will provide a JSON list (array of items) that is purely devoted to describing the business entities it represents (tailored somewhat, perhaps, for the particular view to be presented).  (Let's park the important question of SSR for the time being).

Most repeater web components (there aren't that many, thanks to ES Modules greatly preceding HTML Modules), including grid web components, provide a helpful mapping mechanism between what the API provides, vs what the UI requires, via some form of moustache-style syntax, for the light children.

However, ibid's focus is on a different use case than other repeating web components:

1.  It has full, first-class support for enumerated tag names[WIP].
2.  It can complement server-side (initial) rendering[WIP].
3.  It does **not** provide any support for moustache-style template binding of the light children within each element.  It is rooting for the platform to support this feature natively.  It does, however, provide "binding from a distance" via transform syntax similar to non-inline css styling.  If and when the platform adds support for binding the light children via moustache-style template binding, this component will support said binding, but will continue to provide support for the currently supported transform-like binding as a complementary mechanism, giving developers a choice depending on what works best.
4.  It renders its content (near-) adjacent to itself, so that it can insert content inside built-in list elements, or table elements, without violating proper HTML decorum.

Why provide support for different tags?  Consider a few scenarios:

1.  Lists of repeating elements that alternate between a few tags - like the [Description List Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
2.  "Higher order" lists of entities, where the entities take a variety of forms --  [Cells of a Jupyter Notebook](https://code.visualstudio.com/docs/datascience/jupyter-notebooks#_variable-explorer-and-data-viewer), for example


## Syntax Example I -- Basic, template free.

```html
<ul>
    <li>Head Item</li>
    <li data-from=li-gen>...</li>
    <li>Footer Item</li>
</ul>
<i-bid 
    id=li-gen 
    list='["hello", "world"]',
    transform='{"li": "."}'
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
    transform='{"li": "."}'
></i-bid>
```

## Syntax Example II -- Updatable, template free

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

## Syntax Example III -- multiple elements per iteration.  Use of template

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

## Syntax Example IV -- Nested ibid's.  Use of relative locator

```html
<ul>
    <template>
        <li>
            <span class=description></span>
            <ul>
                <li>
                    <span class=name></span>
                </li>
            </ul>
            <i-bid updatable auto-nest -list-src list-prop=innerList from-previous=ul search-for=li transform='{".name": "name"}'></i-bid>
        </li>
    </template>
</ul>
<i-bid
    updatable 
    list='[
        {"description": "first item", "innerList": [{"name": "a"}, {"name": "b"}]},
        {"description": "second item", "innerList": [{"name": "c"}, {"name": "b"}]}
    ]
    '
    transform='{".description": "description"}' 
    from-previous=ul
    search-for=template
    
>
</i-bid>
```

In examples I and II, we demonstrated that wrapping the content that needs to repeat in a template is optional.  Example III showed use of the template wrapper.

However, if nested ibid's are required, then wrapping outer ibid's in templates becomes required.  The outer ibid's also have to have updatable set.

Note also our use of from-previous, search-for attributes.  These allow for an alternative to specifying the id's.

## Syntax Example V -- tag-list

```html
<i-bid tag-list='[
    {"localName": "tag-1", "prop1": "val1"},
    {"localName": "tag-2", "prop1": "val2"}
]'>
```

Generates

```html
<tag-1>hello 1</tag-1>
<tag-2>hello 2</tag-2>
```

## Syntax Example VI -- Enumerated template options [TODO]

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
        {"type": "grid", "data": {}}
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
