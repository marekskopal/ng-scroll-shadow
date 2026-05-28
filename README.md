# ng-scroll-shadow

[![npm version](https://img.shields.io/npm/v/@marekskopal/ng-scroll-shadow.svg)](https://www.npmjs.com/package/@marekskopal/ng-scroll-shadow)
[![CI](https://github.com/marekskopal/ng-scroll-shadow/actions/workflows/ci.yml/badge.svg)](https://github.com/marekskopal/ng-scroll-shadow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENCE)

Angular directive that fades shadows in and out at the left and right edges of
a horizontally scrollable container, giving users a clear visual cue that
more content is available off-screen.

Unlike a pure-CSS `background-attachment` trick, this directive wraps the
scroll container and absolutely positions the shadows, so they keep working
when the container's children are block-level elements.

## Compatibility

| Library | Angular |
| ------- | ------- |
| 4.x     | 21.x    |
| 3.x     | 20.x    |
| 2.x     | 19.x    |
| 1.x     | 18.x    |

## Install

```bash
npm install @marekskopal/ng-scroll-shadow
# or
pnpm add @marekskopal/ng-scroll-shadow
```

## Usage

Pull the styles in once at the top of your global `styles.scss`:

```scss
@use '@marekskopal/ng-scroll-shadow';
```

Then add `scrollShadow` to any horizontally scrollable element:

```typescript
import {Component} from '@angular/core';
import {ScrollShadowDirective} from '@marekskopal/ng-scroll-shadow';

@Component({
    selector: 'app-example',
    imports: [ScrollShadowDirective],
    template: `
        <div class="scroll-container" scrollShadow>
            <!-- wide content here -->
        </div>
    `,
    styles: `
        .scroll-container {
            overflow-x: auto;
        }
    `,
})
export class ExampleComponent {}
```

The directive wraps the host element in a `<div class="scroll-shadow-wrapper">`
and toggles `can-scroll-left` / `can-scroll-right` on that wrapper as the
scroll position changes. Shadow updates also fire on container resize and on
content mutations, so dynamic content is handled automatically.

## Inputs

All inputs are optional.

| Input                 | Type     | Default                   | Description |
| --------------------- | -------- | ------------------------- | ----------- |
| `wrapperClass`        | `string` | `'scroll-shadow-wrapper'` | Class applied to the injected wrapper. |
| `canScrollLeftClass`  | `string` | `'can-scroll-left'`       | Class added to the wrapper while the container can scroll further left. |
| `canScrollRightClass` | `string` | `'can-scroll-right'`      | Class added to the wrapper while the container can scroll further right. |
| `auditTimeMs`         | `number` | `125`                     | Debounce window (ms) for coalescing scroll / resize / mutation events before recomputing shadow state. |

## Theming

Override the gradient colors with CSS custom properties:

```scss
:root {
    --scroll-shadow-color-from: rgba(0, 0, 0, 0);
    --scroll-shadow-color-to: #1a1a1a;
}
```

The previously shipped misspelled names `--scroll-shaddow-color-from` and
`--scroll-shaddow-color-to` are kept as fallbacks, so existing overrides
continue to work.

## Server-side rendering

The directive is SSR-safe: when the runtime platform is not a browser it
skips DOM access, observer setup, and wrapper injection, so Angular Universal
output renders without errors.

## License

MIT — see [LICENCE](LICENCE).
