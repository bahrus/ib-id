<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ib-id

ib-id is a simple, 1-dimensional list generating web component*.  It generates lists from JSON.  However, the initial list could be server generated HTML.

## Sample syntax I:

```html
<ul>
    <li>header</li>
    <ib-id list='["hello 1", "hello 2"]' id=ibid></ib-id>
    <li>footer</li>
</ul>
<script type=module>
    import 'ib-id/ib-id.js';
</script>
```

Results in:

```html
<ul>
    <li>header</li>
    <ib-id id=ibid style="display:none"></ib-id>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Sample syntax II:

```html
<ul>
    <li>header</li>
    <ib-id id=ibid></ib-id>
    <li>footer</li>
</ul>
<script>
    ibid.list = [
        {textContent: 'hello 1'},
        {textContent: 'hello 2'}
    ]
</script>
<script type=module>
    import 'ib-id/ib-id.js';
</script>
```

Results in:

```html
<ul>
    <li>header</li>
    <ib-id id=ibid style="display:none"></ib-id>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Overridable methods

1.  assignItemIntoNode -- Does an Object.assign of the list item into the DOM node (with exceptions for dataset, style). 
2.  configureNewChild -- Perform custom actions when new node created

## Special Props:  dataset, style

If a list item that gets Object.assigned into the DOM node contains dataset and/or style sub objects, these also get specially applied to the node.

## Ownership

ib-id follows a prime directive -- do not interfere in any way with DOM elements created by other custom elements or script.  In particular, in the example above, the header and footer list items are left alone.  ib-id will only modify, or delete, or append to, the two list items it created, as the list property changes.

## tag name

ib-id's choice of which tag name to generate follows the following order of precedence:

1.  If the list item has property:  'localName': 'my-tag-name', that's what is used. [TODO:  thorough testing]
2.  If the ib-id tag has property: 'tag' set explicitly, that is used.
3.  If neither 1 nor 2 above pan out, it uses the tag of the previousElementSibling, and if no such element exists, the parent element.

## Complementing SSR [TODO: testing]

Suppose we show some compassion towards the user, and provide as much initial content as possible via HTML.  But we are, nevertheless, building a dynamic site, and suppose it makes more sense to generate new HTML on the client via a JSON to HTML process, which ib-id is based on.  The server delivers the following initial markup:

```html
<ul>
    <li>header</li>
    <ib-id></ib-id>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

How do we convey which nodes are okay to trample over, as client-side JSON data changes?

We can specify which initial nodes are "owned" by ib-id via the initCount property:

```html
<ul>
    <li>header</li>
    <ib-id init-count=2></ib-id>
    <li >hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Explore using [range](https://github.com/WICG/webcomponents/issues/901#issuecomment-742195795) [TODO]


## * Lazy Loading [Big Time TOODOO]

laissez-dom supports lazy loading blocks of html.  In terms of performance, it seems to exceed what can be obtained by using content-visibility, at least when generating content in the client.  (There are some disadvantages, though, in terms of lack of search, for starters).  The problem is if we want to combine that component with this one, we are in a bit of a quandary.  Take, for example, creating a massive list of li's.

For laissez-dom to be effective, 

1.  An estimated height on the laissez-dom component is required (as with content-visibility), 
2.  Unless the laissez-dom component contains a large (dimension-wise) component that takes up much of the screen, multiple iterations need to go into each component.

So, for example, the markup needs to look as follows:

```html
<laissez-dom>
    <template>
        <li>hello 1</li>
        <li>hello 2</li>
        ...
        <li>hello 99</li>
    </template>
</laissez-dom>
<laissez-dom>
    <template>
        <li>hello 100</li>
        <li>hello 101</li>
        ...
    </template>
</laissez-dom>
```

So how can we equip ib-id to generate this content?  A cop-out(?) might be to just say:  Extend laissez-dom, with a component named something like "paged-list", and then pass to ib-id a grouped list of property settings.

However, I think it's a cop-out because:

1.  It imposes a class hierarchy on components for a rather banal technical reason.
2.  It imposes too much work on the developer.  As it is, unless the developer is working with a native DOM element, the developer is already expected to develop a component (or more) that ib-id will repeat, which contains markup within each loop iteration.  Now we are imposing an additional component to be built.

Tentative solution:

```html
<ib-id tag="laissez-dom>template>li" group-by=100></ib-id>
```

Maybe need another component for this?





