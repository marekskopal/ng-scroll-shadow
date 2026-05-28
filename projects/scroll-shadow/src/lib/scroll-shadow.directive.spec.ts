import {Component, signal} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {ScrollShadowDirective} from "./scroll-shadow.directive";

class ResizeObserverStub {
    public observe(): void {
        // no-op
    }

    public unobserve(): void {
        // no-op
    }

    public disconnect(): void {
        // no-op
    }
}

(globalThis as unknown as {ResizeObserver: typeof ResizeObserverStub}).ResizeObserver = ResizeObserverStub;

@Component({
    imports: [ScrollShadowDirective],
    template: `
        <div
            class="scroller"
            scrollShadow
            [canScrollLeftClass]="leftClass()"
            [canScrollRightClass]="rightClass()"
            [wrapperClass]="wrapperClass()"
        >
            content
        </div>
    `,
})
class HostComponent {
    public readonly leftClass = signal('can-scroll-left');
    public readonly rightClass = signal('can-scroll-right');
    public readonly wrapperClass = signal('scroll-shadow-wrapper');
}

function fakeDimensions(
    el: HTMLElement,
    dims: {scrollWidth: number; clientWidth: number; scrollLeft: number},
): void {
    Object.defineProperty(el, 'scrollWidth', {configurable: true, get: () => dims.scrollWidth});
    Object.defineProperty(el, 'clientWidth', {configurable: true, get: () => dims.clientWidth});
    Object.defineProperty(el, 'scrollLeft', {
        configurable: true,
        get: () => dims.scrollLeft,
        set: () => undefined,
    });
}

function flushScroll(el: HTMLElement): void {
    el.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(200);
}

describe('ScrollShadowDirective', () => {
    let fixture: ComponentFixture<HostComponent>;
    let scroller: HTMLElement;
    let wrapper: HTMLElement;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({imports: [HostComponent]});
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        scroller = fixture.nativeElement.querySelector('.scroller') as HTMLElement;
        wrapper = scroller.parentElement as HTMLElement;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('wraps the host element with the configured wrapper class', () => {
        expect(wrapper.classList.contains('scroll-shadow-wrapper')).toBe(true);
        expect(wrapper.firstElementChild).toBe(scroller);
    });

    it('marks can-scroll-right when content overflows to the right', () => {
        fakeDimensions(scroller, {scrollWidth: 800, clientWidth: 400, scrollLeft: 0});
        flushScroll(scroller);

        expect(wrapper.classList.contains('can-scroll-right')).toBe(true);
        expect(wrapper.classList.contains('can-scroll-left')).toBe(false);
    });

    it('marks both classes when scrolled to the middle', () => {
        fakeDimensions(scroller, {scrollWidth: 800, clientWidth: 400, scrollLeft: 200});
        flushScroll(scroller);

        expect(wrapper.classList.contains('can-scroll-left')).toBe(true);
        expect(wrapper.classList.contains('can-scroll-right')).toBe(true);
    });

    it('clears can-scroll-right at the rightmost edge with a fractional scrollLeft', () => {
        // 399.6 + 400 = 799.6 < 800 would (incorrectly) keep can-scroll-right on;
        // Math.ceil(399.6) + 400 = 800 → strictly NOT less than 800 → cleared.
        fakeDimensions(scroller, {scrollWidth: 800, clientWidth: 400, scrollLeft: 399.6});
        flushScroll(scroller);

        expect(wrapper.classList.contains('can-scroll-right')).toBe(false);
        expect(wrapper.classList.contains('can-scroll-left')).toBe(true);
    });

    it('strips the previous class name when canScrollRightClass changes at runtime', () => {
        fakeDimensions(scroller, {scrollWidth: 800, clientWidth: 400, scrollLeft: 0});
        flushScroll(scroller);
        expect(wrapper.classList.contains('can-scroll-right')).toBe(true);

        fixture.componentInstance.rightClass.set('right-active');
        fixture.detectChanges();

        expect(wrapper.classList.contains('can-scroll-right')).toBe(false);
        expect(wrapper.classList.contains('right-active')).toBe(true);
    });

    it('renames the wrapper class when wrapperClass changes at runtime', () => {
        expect(wrapper.classList.contains('scroll-shadow-wrapper')).toBe(true);

        fixture.componentInstance.wrapperClass.set('custom-wrapper');
        fixture.detectChanges();

        expect(wrapper.classList.contains('scroll-shadow-wrapper')).toBe(false);
        expect(wrapper.classList.contains('custom-wrapper')).toBe(true);
    });

    it('coalesces rapid scroll events into a single update within the audit window', () => {
        const initial = {scrollWidth: 800, clientWidth: 400, scrollLeft: 0};
        fakeDimensions(scroller, initial);
        flushScroll(scroller);
        expect(wrapper.classList.contains('can-scroll-right')).toBe(true);

        // Many scroll events in quick succession should not break the timer guard.
        for (let i = 0; i < 5; i++) {
            scroller.dispatchEvent(new Event('scroll'));
        }
        vi.advanceTimersByTime(200);

        expect(wrapper.classList.contains('can-scroll-right')).toBe(true);
    });
});
