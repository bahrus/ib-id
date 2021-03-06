<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ibid

This package contains a suite of web components, depending on the placement of the dash -- i-bid, ib-id[TODO], ibi-d[TODO].

Each of them provide a simple, 1-dimensional list generating web component*.  They generate lists from JSON, but can complement server-side rendering.

They each have a property called "list" where an array of properties can be passed in. ibid merges those properties into each instance.

ibid is one of many web component libraries that provide repeat functionality.

As of this moment, what makes ibid different from the rest (without having conducted an exhaustive search):

1.  It has full support for dynamic tag names.
2.  It can complement server-side (initial) rendering.
3.  It does **not** provide any support for template binding of the light children within each element.  It only provides support for a linear list of (a potpourri of) tags.  This means to use ibid effectively, you will want a rapid way of encapsulating the markup you want within each tag (and a nice IDE and/or IDE plugin which can easily navigate to the code of a custom element -- [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin) does this quite effectively for js-based web components, for example).
4.  It renders its content (near-) adjacent to itself, so that it can insert content inside built-in list elements (and potentially table elements).

Note that there **is** a web component, [lib-id](https://github.com/bahrus/lib-id) that extends ibid, with support for template binding of light children.

The three ibid components also provide support for something called "element pooling."  Alternative names could be element reuse, element recycling.  Other repeating libraries may support the basic concept.  The reason for this package supporting three different components has to do with element pooling strategy.

The idea behind element pooling is this:  Without pooling, suppose the list of objects to bind to changes.  The list could grow, or shrink, and the values that need to display can also change.  What should we do with the elements generated from the previous list?  One approach could be to just delete the old elements, and re-generate the list.  That could be done (another web component could take that approach), but that's not what ibid does.

ibid assumes there's a significant cost to generating a native or naturalized (custom) DOM element -- cloning a template, attaching shadow DOM, appending the nodes, and that updating an existing element without doing all that can be cheaper than starting from scratch.

In addition, holding on to a DOM element, rather than recreating it from a minimal state of properties, may be quite useful, if the developer lacks the time to ensure that all user interactions with the component (focus, scrolling, expanded sections) make callbacks into the model the list binds from, in a performant way.

The tricky thing is how to align a new list with elements which have already been created.  That aspect is the crucial difference between each component [TODO] provided within the ibid package.

## i-bid's Pooling Strategy

i-bid's element pooling is based on the tag name -- if the tag name is the same as before, the new props of a list are simply passed in.  If the tag name changes, an effort is made to find an "owned" element matching that tag name to reuse.  If no spares are found, only then is a new element instance created.


## Sample syntax I:

```html
<ul>
    <li>header</li>
    <i-bid list='["hello 1", "hello 2"]'></i-bid>
    <li>footer</li>
</ul>
```

Results in:

```html
<ul>
    <li>header</li>
    <i-bid list='["hello 1", "hello 2"]' style="display:none"></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

**NB I:** As some browsers will most gently inform you, the resulting syntax (as well as the originating syntax) is not, strictly speaking, valid HTML.  More kosher ways of implementing this start with Sample syntax IV.

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

## Sample syntax III:

If no header / footer:

```html
<ul>
    <i-bid list='["hello 1", "hello 2"]'>
        <li>put</li>
    </i-bid>
</ul>
```

Results in:

```html
<ul>
    <i-bid list='["hello 1", "hello 2"]' style="display:none"></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
</ul>
<script type=module>
    import 'i-bid/i-bid.js';
</script>
```

Why include that sample li inside i-bid?

1)  If it were a custom element, the IDE would likely let you jump to the definition behind the custom element.
2)  A little more readable, perhaps?
3)  "put" or any other text inside the element to repeat is optional.  Some IDE's might give a better preview look if including some sample text.
4)  The li inside the ibid tag will be used for the first element, so very little waste is incurred in supporting the niceties above.

## Decorator Functionality

ib-id takes a bit of a cue from [xtal-deco](https://github.com/bahrus/xtal-deco).  By default it creates an adjacent virtual space of sibling elements beneath it.  However, the concept can be extended to work within an existing sibling element:

### Sample Syntax IV:

```html
<i-bid list='["hello 1", "hello 2"]' render-after=[hello]><li></li></i-bid>
<div>
    <ul>
        <li hello>header</li>
        
        <li>footer</li>
    </ul>
</div>
```

The attribute/property render-after/renderAfter as well as render-at-start-of/renderAtStartOf tips off i-bid that it should peer into the next element, do a querySelector('[hello]') in this case, and begin its rendering after that element.

### Sample Syntax V:

Just as with xtal-deco, there is a (remote?) possibility that there could be multiple i-bid elements that need to render content inside a (nearly, now) adjacent element.  To specify the closest downstream sibling to peer into, use the match-closest/matchClosest attribute/property:

```html
<i-bid list='["hello 1", "hello 2"]' match-closest=div render-after=[hello]><li></li></i-bid>
<span>I am here</span>
<div>
    <ul>
        <li hello>header</li>
        <li>footer</li>
    </ul>
</div>
```

produces

```html
<i-bid list='["hello 1", "hello 2"]' match-closest=div render-after=[hello] style="display:none"></i-bid>
<span>I am here</span>
<div>
    <ul>
        <li hello>header</li>
        <li>hello 1</li>
        <li>hello 2</li>
        <li>footer</li>
    </ul>
</div>
```

### Sample Syntax VI:

```html
    <i-bid list='["hello 1", "hello 2"]' match-closest=div render-at-start-of=ul>
        <li></li>
    </i-bid>
    <span>I am here</span>
    <div>
        <ul>
            <li>footer</li>
        </ul>
    </div>
```

produces

```html
    <i-bid list='["hello 1", "hello 2"]' match-closest=div render-at-start-of=ul style="display:none"></i-bid>
    <span>I am here</span>
    <div>
        <ul>
            <li>hello 1</li>
            <li>hello 2</li>
            <li>footer</li>
        </ul>
    </div>
```

## Overridable methods

<!--1.  assignItemIntoNode -- Does an Object.assign of the list item into the DOM node (with exceptions for dataset, style, localName). -->
configureNewChild -- Perform custom actions when new node created

updateLightChildren

## Special Props:  dataset, style, attributes, tagName, localName

If a list item that gets Object.assigned into the DOM node contains read-only properties, these are treated specially.

If the values passed in appear "legitimate", e.g. a NamedNodeMap for "attributes", then these are assigned carefully to the target element.

Otherwise, the properties are renamed with a leading underscore before getting Object.assigned into the DOM node. 

## Ownership

ibid follows a prime directive -- do not interfere in any way with DOM elements created by other custom elements or script.  In particular, in the example above, the header and footer list items are left alone.  ibid will only modify, or delete, or append to, the two list items it created, as the list property changes.

## tag name

ibid's choice of which tag name to generate follows the following order of precedence:

1.  If the list item has property:  'localName': 'my-tag-name', that's what is used.
2.  If the ibid tag has property/attribute: 'tag' set explicitly, that is used.
3.  If neither 1 nor 2 above pan out, it uses the tag of the firstChildElement.  If there is no firstChildElement, then the previousElementSibling, and if no such element exists, the parent element. If using firstChildElement, that element will be "reused".

## Complementing SSR [TODO: testing] with [deferred hydration](https://www.google.com/search?q=defer-hydration&sxsrf=ALeKk01kYqveQ7d75zjooIa9i2BFZ91C3Q%3A1625344788573&ei=FMvgYKquIuS1qtsP5siFmAU&oq=defer-hydration&gs_lcp=Cgdnd3Mtd2l6EAM6BwgAEEcQsANKBAhBGABQsLwBWLC8AWDrwAFoAXACeACAAVeIAYkBkgEBMpgBAKABAaoBB2d3cy13aXrIAQjAAQE&sclient=gws-wiz&ved=0ahUKEwiqiIqW4cfxAhXkmmoFHWZkAVMQ4dUDCA8&uact=5)

Suppose we show some compassion towards the user, and provide as much initial content as possible via HTML.  But we are, nevertheless, building a dynamic site, and suppose it makes more sense to generate new HTML on the client via a JSON to HTML process, which ib-id is based on.  The server delivers the following initial markup:

```html
<ul>
    <li>header</li>
    <i-bid defer-hydration></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```

**NB II:** The [defer-hydration](https://github.com/webcomponents/community-protocols/issues/7#issuecomment-825151215) is, I think, now a community standard for web components.  As with the rest of this section, the proper function of this attribute is all quite theoretical and untested at this point.

How do we convey which nodes are okay to trample over, as client-side JSON data changes?

We can specify which initial nodes are "owned" by ib-id via the initCount property:

```html
<ul>
    <li>header</li>
    <i-bid owned-sibling-count=2></i-bid>
    <li>hello 1</li>
    <li>hello 2</li>
    <li>footer</li>
</ul>
```


## * Lazy Loading [Big Time TOODOO I]

[laissez-dom](https://github.com/bahrus/laissez-dom) supports lazy-loading blocks of html.  In terms of performance, it seems to exceed what can be obtained by using content-visibility, at least when generating repeating content in the client.  And it works cross-browser. (There are some disadvantages, though, in terms of lack of search, for starters).  The problem is if we want to combine that component with this one, we are in a bit of a quandary.  Take, for example, creating a massive list of li's.

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

## What if I want to repeat some web components that require non-shadow light children?

Okay, yeah, maybe this isn't the right component for you to use.

There is, however, an inefficient loophole:  innerHTML is a property which could be passed in as one of the items of your list.  ibid doesn't prevent that, and trusts that the developer will take the necessary steps to guarantee that the value is XSS-safe.

Another web component,  ["lib-id"](https://github.com/bahrus/lib-id) does provide support for binding the light children. It extends this one (WIP).

## ib-id's pooling strategy [TODO]

1.  Developer specifies id and version getters.  Version can be anything, including a date/time stamp.
    1.  Elements are reused only if tag name and id match (weaken somewhat if we can pair two unmatched items?).
    2.  Old elements with no corresponding id from new list are reused if the new list has an item with an id not matching the old list.
    3.  A new item object is only passed to the element being repeated if the version doesn't match previous version.
    4.  Order not guaranteed to match order of new list.
    5.  Separate "list-sorter" component used to sort list.
2.  Developer can optionally specify "breaking", which means old element matching the tag name and id should be deleted, create a new instance.







