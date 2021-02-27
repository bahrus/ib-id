<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ibid

This package contains a suite of web components, depending on the placement of the dash -- i-bid, ib-id[TODO], ibi-d[TODO].

Each of them provide a simple, 1-dimensional list generating web component*.  They generate lists from JSON.

They each have a property called "list" where an array of properties can be passed in. ibid merges those properties into each instance.

ibid is one of many web component libries that provide repeat functionality.

As of this moment, what makes ibid different from the rest (without having conducted an exhaustive search):

1.  It has full support for dynamic tag names.
2.  It can complement server-side (initial) rendering.
3.  It does **not** provide any support for template binding within each element.  It only provides support for a linear list of (a potpourri of) tags.  This means to use ibid effectively, you will want a rapid way of encapsulating the markup you want within each tag (and a nice IDE and/or IDE plugin which can easily navigate to the code of a custom element -- [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) does this quite effectively for js-based web components, for example).

The three ibid components also provide support for something called "element pooling."  Alternative names could be element reuse, element recycling.  Other repeating libraries may support the basic concept.  The reason for this package supporting three different components has to do with element pooling strategy.

The idea behind element pooling is this:  Without pooling, suppose the list of objects to bind to changes.  The list could grow, or shrink, and the values that need to display can also change.  What should we do with the elements generated from the previous list?  One approach could be to just delete the old elements, and re-generate the list.  That could be done (another web component could take that approach), but that's not what ibid does.

ibid assumes there's a significant cost to generating a native or naturalized (custom) DOM element -- cloning a template, attaching shadowing DOM, appending the nodes, and that updating an existing element without doing all that can be cheaper than starting from scratch.

In addition, holding on to a DOM element, rather than recreating it from a minimul state of properties, may be quite usesful, if the user interactions with the component (focus, scrolling, expanded sections) doesn't take the trouble to make callbacks into the model the list binds from.

The tricky thing is how to align a new list with elements which have already been created.  That aspect is crucial difference between each component provided within the ibid package.

## i-bid's Pooling Strategy

i-bid's element pooling is based on the tag name -- if the tag name is the same as before, the new props of a list are simply passed in.  If the tag name changes, an effort is made to find an "owned" element matching that tagname to reuse.  If no spares are found, only then is a new element instance created.


## Sample syntax I:

```html
<ul>
    <li>header</li>
    <i-bid list='["hello 1", "hello 2"]' id=ibid></i-bid>
    <li>footer</li>
</ul>
<script type=module>
    import 'i-bid/i-bid.js';
</script>
```

Results in:

```html
<ul>
    <li>header</li>
    <i-bid id=ibid style="display:none"></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Sample syntax II:

```html
<ul>
    <li>header</li>
    <i-bid id=ibid></i-bid>
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
    <i-bid id=ibid style="display:none"></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Overridable methods

<!--1.  assignItemIntoNode -- Does an Object.assign of the list item into the DOM node (with exceptions for dataset, style, localName). -->
configureNewChild -- Perform custom actions when new node created

## Special Props:  dataset, style

If a list item that gets Object.assigned into the DOM node contains dataset and/or style sub objects, these also get specially applied to the node.

## Ownership

ibid follows a prime directive -- do not interfere in any way with DOM elements created by other custom elements or script.  In particular, in the example above, the header and footer list items are left alone.  ibid will only modify, or delete, or append to, the two list items it created, as the list property changes.

## tag name

ibid's choice of which tag name to generate follows the following order of precedence:

1.  If the list item has property:  'localName': 'my-tag-name', that's what is used.
2.  If the ib-d tag has property: 'tag' set explicitly, that is used.
3.  If neither 1 nor 2 above pan out, it uses the tag of the firstChildElement.  If there is no firstChildElement, then the previousElementSibling, and if no such element exists, the parent element.

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
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

## Explore using [range](https://github.com/WICG/webcomponents/issues/901#issuecomment-742195795) [TODO]


## * Lazy Loading [Big Time TOODOO]

laissez-dom supports lazy loading blocks of html.  In terms of performance, it seems to exceed what can be obtained by using content-visibility, at least when generating content in the client.  (There are some disadvantages, though, in terms of lack of search, for starters).  The problem is if we want to combine that component with this one, we are in a bit of a quandary.  Take, for example, creating a massive list of li's.

For laissez-dom to be effective, 

1.  An estimated height on the laissez-dom component is required (as with content-visibility), 
2.  Unless the laissez-dom component contains a large (dimension-wise) component that takes up much of the screen, multiple iterations need to go into each component instance.

So, for example, the markup needs to look as follows:

```html
<ul>
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
        <li>hello 199</li>
    </template>
</laissez-dom>
</ul>
```

So how can we equip ib-id to generate this content?  A cop-out(?) might be to just say:  Extend laissez-dom, with a component named something like "paged-list", and then pass to ib-id a grouped list of property settings.

However, I think it's a cop-out because:

1.  It imposes a class hierarchy on components for a rather banal technical reason.
2.  It imposes too much work on the developer.  As it is, unless the developer is working with a native DOM element, the developer is already expected to develop a component (or more) that ib-id will repeat, which contains markup within each loop iteration.  Now we are imposing an additional component to be built.

[Tentative solution](https://github.com/bahrus/lazy-loop) (WIP)







