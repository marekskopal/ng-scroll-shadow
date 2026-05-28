# Changelog

All notable changes to `@marekskopal/ng-scroll-shadow` are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2026-05-28

### Added
- Canonical CSS custom properties `--scroll-shadow-color-from` /
  `--scroll-shadow-color-to`. The previously shipped misspelled names
  (`--scroll-shaddow-color-from` / `--scroll-shaddow-color-to`) continue to
  work as fallbacks, so existing consumers keep working without changes.
- SSR safety: the directive now skips DOM/observer setup when not running
  in a browser (`@angular/common`'s `isPlatformBrowser`), making it safe
  to render under Angular Universal.
- Reactivity to runtime input changes: updating `wrapperClass`,
  `canScrollLeftClass` or `canScrollRightClass` after init now strips the
  previously applied class from the wrapper instead of leaking it.
- Content-size awareness: a `ResizeObserver` on the host plus a
  `MutationObserver` (`childList`, `subtree`, `characterData`) keep the
  shadow state in sync when dynamic content changes the scrollable area,
  not just on scroll or window resize.

### Changed
- Scroll/observer callbacks now run outside the Angular zone, and the
  `scroll` listener is registered as passive, reducing change-detection
  cost on scroll.
- Lifecycle cleanup moved from a `Subject`/`takeUntil` pattern to
  `DestroyRef`-based teardown.

### Fixed
- The right-edge shadow no longer stays visible at the rightmost scroll
  position on fractional-DPR displays — `scrollLeft` is now coerced via
  `Math.ceil` before being compared to `scrollWidth - clientWidth`.

## [4.0.0] - 2025-11-20

### Changed
- **Breaking:** peer dependencies bumped to `@angular/common@^21.0.0` and
  `@angular/core@^21.0.0`.

## [3.0.0] - 2025-11-20

### Changed
- **Breaking:** peer dependencies bumped to `@angular/common@^20.0.0` and
  `@angular/core@^20.0.0`.

## [2.0.0] - 2024-11-24

### Changed
- **Breaking:** peer dependencies bumped to `@angular/common@^19.0.0` and
  `@angular/core@^19.0.0`. The directive's `standalone: true` metadata was
  dropped since standalone is the default in Angular ≥19.

## [1.0.3] - 2024-09-21

### Added
- Shadow colors are now driven by CSS custom properties
  (`--scroll-shaddow-color-from`, `--scroll-shaddow-color-to`). Previous
  versions used a hardcoded `#262626` gradient.

## [1.0.0] - 2024-09-18

Initial public release. Ships the `[scrollShadow]` directive and the
accompanying SCSS for horizontal scroll shadows on overflowing containers.
