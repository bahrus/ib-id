<a href="https://nodei.co/npm/ib-id/"><img src="https://nodei.co/npm/ib-id.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/ib-id">

# ib-id

ib-id is a simple, 1-dimensional list web component.

## Sample syntax I [TODO]:

```html
<ul>
    <li>header</li>
    <ib-id id=ibid></ib-id>
    <li>footer</li>
</ul>
<script>
    ibid.list = ['hello 1', 'hello 2']
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

## Special Props:  dataset, style [TODO]

## Ownership

ib-id follows a prime directive -- do not interfere in any way with DOM elements created by other (custom elements).  In particular, in the example above, the header and footer list items are left alone.  ib-id will only modify, or delete, or append to, the two list items it created, as the list object change.

## tag name

ib-id's choice of which tag name to generate follows the following order of precedence:

1)  If the list item has property:  'localName': 'my-tag-name', that's what is used. [TODO]
2)  If the ib-id tag has property: 'tag' set explicitly, that is used.
3)  It uses the tag of the previousElementSibling, and if no such element exists, the parent element.

##



