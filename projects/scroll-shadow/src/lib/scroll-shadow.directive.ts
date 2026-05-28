import {
    AfterContentInit,
    DestroyRef,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    NgZone,
    OnDestroy,
    PLATFORM_ID,
    Renderer2,
} from "@angular/core";
import {isPlatformBrowser} from "@angular/common";

@Directive({
    //eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[scrollShadow]',
})
export class ScrollShadowDirective implements AfterContentInit, OnDestroy {
    private readonly el: ElementRef<HTMLElement> = inject(ElementRef);
    private readonly renderer = inject(Renderer2);
    private readonly zone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    public readonly canScrollRightClass = input<string>('can-scroll-right');
    public readonly canScrollLeftClass = input<string>('can-scroll-left');
    public readonly auditTimeMs = input<number>(125);
    public readonly wrapperClass = input<string>('scroll-shadow-wrapper');

    private wrapperElement: HTMLElement | null = null;
    private appliedWrapperClass: string | null = null;
    private appliedLeftClass: string | null = null;
    private appliedRightClass: string | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private mutationObserver: MutationObserver | null = null;
    private scrollListener: (() => void) | null = null;
    private auditTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        effect(() => {
            const next = this.wrapperClass();
            if (!this.wrapperElement || this.appliedWrapperClass === next) {
                return;
            }
            if (this.appliedWrapperClass) {
                this.renderer.removeClass(this.wrapperElement, this.appliedWrapperClass);
            }
            this.renderer.addClass(this.wrapperElement, next);
            this.appliedWrapperClass = next;
        });

        effect(() => {
            this.canScrollLeftClass();
            this.canScrollRightClass();
            if (this.wrapperElement) {
                this.clearStateClasses();
                this.setClasses();
            }
        });

        this.destroyRef.onDestroy(() => this.teardown());
    }

    public ngAfterContentInit(): void {
        if (!this.isBrowser) {
            return;
        }

        this.createWrapper();
        this.attachListeners();
        this.setClasses();
    }

    public ngOnDestroy(): void {
        this.teardown();
    }

    private teardown(): void {
        if (this.scrollListener) {
            this.el.nativeElement.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        if (this.auditTimer !== null) {
            clearTimeout(this.auditTimer);
            this.auditTimer = null;
        }
    }

    private attachListeners(): void {
        this.zone.runOutsideAngular(() => {
            this.scrollListener = () => this.scheduleUpdate();
            this.el.nativeElement.addEventListener('scroll', this.scrollListener, {passive: true});

            this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());
            this.resizeObserver.observe(this.el.nativeElement);

            this.mutationObserver = new MutationObserver(() => this.scheduleUpdate());
            this.mutationObserver.observe(this.el.nativeElement, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        });
    }

    private scheduleUpdate(): void {
        if (this.auditTimer !== null) {
            return;
        }
        this.auditTimer = setTimeout(() => {
            this.auditTimer = null;
            this.setClasses();
        }, this.auditTimeMs());
    }

    private createWrapper(): void {
        const nativeElement = this.el.nativeElement;
        const parent = nativeElement.parentNode;
        if (!parent) {
            return;
        }

        const wrapper = this.renderer.createElement('div') as HTMLElement;
        const wrapperClass = this.wrapperClass();
        this.renderer.addClass(wrapper, wrapperClass);
        this.renderer.insertBefore(parent, wrapper, nativeElement);
        this.renderer.removeChild(parent, nativeElement);
        this.renderer.appendChild(wrapper, nativeElement);

        this.wrapperElement = wrapper;
        this.appliedWrapperClass = wrapperClass;
    }

    private clearStateClasses(): void {
        if (!this.wrapperElement) {
            return;
        }
        if (this.appliedLeftClass) {
            this.renderer.removeClass(this.wrapperElement, this.appliedLeftClass);
            this.appliedLeftClass = null;
        }
        if (this.appliedRightClass) {
            this.renderer.removeClass(this.wrapperElement, this.appliedRightClass);
            this.appliedRightClass = null;
        }
    }

    private setClasses(): void {
        if (!this.wrapperElement) {
            return;
        }

        const el = this.el.nativeElement;
        const canScrollLeft = el.scrollLeft > 0;
        const canScrollRight = Math.ceil(el.scrollLeft) + el.clientWidth < el.scrollWidth;

        const leftClass = this.canScrollLeftClass();
        if (canScrollLeft) {
            if (this.appliedLeftClass !== leftClass) {
                if (this.appliedLeftClass) {
                    this.renderer.removeClass(this.wrapperElement, this.appliedLeftClass);
                }
                this.renderer.addClass(this.wrapperElement, leftClass);
                this.appliedLeftClass = leftClass;
            }
        } else if (this.appliedLeftClass) {
            this.renderer.removeClass(this.wrapperElement, this.appliedLeftClass);
            this.appliedLeftClass = null;
        }

        const rightClass = this.canScrollRightClass();
        if (canScrollRight) {
            if (this.appliedRightClass !== rightClass) {
                if (this.appliedRightClass) {
                    this.renderer.removeClass(this.wrapperElement, this.appliedRightClass);
                }
                this.renderer.addClass(this.wrapperElement, rightClass);
                this.appliedRightClass = rightClass;
            }
        } else if (this.appliedRightClass) {
            this.renderer.removeClass(this.wrapperElement, this.appliedRightClass);
            this.appliedRightClass = null;
        }
    }
}
