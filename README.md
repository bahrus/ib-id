# ib-id

ib-id is a simple, 1-dimensional list web component.

Sample syntax:

```html
<ul>
    <li>header</li>
    <ib-id id=ibid></ib-id>
    <li>footer</li>
</ul>
<script type=module>
    import '../ib-id.js';
</script>
<script>
    ibid.list = [
        {textContent: 'hello 1'},
        {textContent: 'hello 2'}
    ]
</script>
```