# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Angular library published as `@marekskopal/ng-scroll-shadow`. Provides a `[scrollShadow]` directive that wraps a scrollable element and toggles classes on the wrapper so CSS gradient pseudo-elements fade in/out at the leading/trailing edges. The wrapper-based approach (vs. pure CSS) keeps the shadows working when the scroll container holds block-level children.

This repo is a publishable library only — there is no demo/host application. The Angular CLI workspace (`angular.json`) defines a single `library` project rooted at `projects/scroll-shadow/`.

## Commands

Package manager is **pnpm** (configured in `angular.json` → `cli.packageManager`). Use `pnpm` for install; the npm scripts below delegate to `ng`.

- `pnpm build` — production build via `ng-packagr` → outputs to `dist/scroll-shadow/`
- `pnpm watch` — development build with watch
- `pnpm test` — Karma + Jasmine (Chrome launcher)
- `pnpm lint` / `pnpm lint-fix` — ESLint via `@angular-eslint/builder`
- `pnpm build-pack` — builds then runs `pnpm pack` inside `dist/scroll-shadow/` to produce a publishable tarball (used to verify the package before publishing to npm)

There is no `ng serve` target — the workspace has no application project.

## Architecture

Source lives entirely under `projects/scroll-shadow/src/`:

- `lib/scroll-shadow.directive.ts` — the only directive. On `ngAfterContentInit` it mutates the DOM by inserting a `<div class="scroll-shadow-wrapper">` between the host element and its parent, then moving the host inside that wrapper. Scroll + window resize events (rxjs `fromEvent` + `auditTime`, default 125ms) recompute `scrollLeft` vs. `scrollWidth/clientWidth` and toggle `can-scroll-left` / `can-scroll-right` on the wrapper.
- `styles/styles.scss` — ships the wrapper + `:before`/`:after` gradient pseudo-elements driven by those classes. CSS custom properties `--scroll-shaddow-color-from` / `--scroll-shaddow-color-to` control the gradient. Exported via the package's `sass` export condition (see `projects/scroll-shadow/package.json` → `exports`). Consumers import with `@import '@marekskopal/ng-scroll-shadow';`.
- `public-api.ts` — barrel; only re-exports the directive.

The directive's inputs (`canScrollRightClass`, `canScrollLeftClass`, `auditTimeMs`, `wrapperClass`) are signal inputs (`input<T>()`), Angular 21+ style. Note the directive selector is `[scrollShadow]` and is intentionally exempted from the `lib`-prefix lint rule via an inline `eslint-disable` (`@angular-eslint/directive-selector`).

The directive currently handles **horizontal** scroll only (`scrollLeft`, `:before`/`:after` on left/right edges) — there is no vertical variant.

## Build output and packaging

`ng build` runs `ng-packagr` with `projects/scroll-shadow/ng-package.json`, which:
- writes to `../../dist/scroll-shadow` (i.e. repo-root `dist/scroll-shadow/`)
- copies `src/styles/*.*` and `assets/**/*.*` into the package so the SCSS source ships alongside the compiled JS

The published package name (`@marekskopal/ng-scroll-shadow`) and version live in `projects/scroll-shadow/package.json`, **not** the repo-root `package.json` (which is marked `private`). Bump the library version in the inner package.json when releasing.

## Lint conventions

`eslint.config.js` at repo root enforces:
- attribute directives must use `lib` prefix, camelCase
- components must use `lib` prefix, kebab-case

The `scrollShadow` directive's selector deliberately violates this (intentional public API) — preserve the inline disable comment if you regenerate the file.
