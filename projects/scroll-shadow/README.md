# NgScrollShadow

Angular `[scrollShadow]` directive for adding a shadow to begin and end of a vertical scrollable container.

Unlike the pure CSS solution, this solution uses a wrapper and absolutely positioned shadows that work even if the container contains block elements.

## Install

```bash
npm install @marekskopal/ng-scroll-shadow
```

## Usage

Import the styles to your `styles.scss`:

```scss
@import '@marekskopal/ng-scroll-shadow';
```

Import the `ScrollShadowDirective` directive in your module or component:

```typescript
import {ScrollShadowDirective} from "@marekskopal/ng-scroll-shadow";
```


Add the `scrollShadow` directive to the scrollable container:

```html
<!-- example -->
<div style="width: 400px">
    <div style="height: 200px; overflow-y: auto;" scrollShadow>
        <div style="height: 200px; width: 800px; background: red">
            <!-- content -->
        </div>
    </div>
</div>
```
