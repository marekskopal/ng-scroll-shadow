import {
    AfterContentInit,
    Directive,
    ElementRef,
    inject, input,
    OnDestroy,
    OnInit, Renderer2
} from "@angular/core";
import {auditTime, fromEvent, Subject, takeUntil} from "rxjs";

@Directive({
    standalone: true,
    //eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[scrollShadow]',
})
export class ScrollShadowDirective implements OnInit, AfterContentInit, OnDestroy {
    private readonly el = inject(ElementRef);
    private readonly renderer = inject(Renderer2);

    public readonly canScrollRightClass = input<string>('can-scroll-right');
    public readonly canScrollLeftClass = input<string>('can-scroll-left');
    public readonly auditTimeMs = input<number>(125);
    public readonly wrapperClass = input<string>('scroll-shadow-wrapper');

    private readonly destroy$ = new Subject<void>();

    private wrapperElement: HTMLElement = this.renderer.createElement('div');

    public ngOnInit(): void {
        fromEvent(this.el.nativeElement, 'scroll').pipe(
            auditTime(this.auditTimeMs()),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            this.setClasses();
        });

        fromEvent(window, 'resize').pipe(
            auditTime(this.auditTimeMs()),
            takeUntil(this.destroy$),
        ).subscribe(() => {
            this.setClasses();
        });
    }

    public ngAfterContentInit(): void {
        this.createWrapper();

        this.setClasses();
    }

    public ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private createWrapper(): void {
        const nativeElement = this.el.nativeElement;
        const parent = this.el.nativeElement.parentNode;

        this.renderer.addClass(this.wrapperElement, this.wrapperClass());
        this.renderer.insertBefore(parent, this.wrapperElement, nativeElement);
        this.renderer.removeChild(parent, nativeElement);
        this.renderer.appendChild(this.wrapperElement, nativeElement);
    }

    private setClasses(): void {
        const nativeElement = this.el.nativeElement;

        const canScrollLeft = nativeElement.scrollLeft > 0;
        const canScrollRight = nativeElement.scrollLeft + nativeElement.clientWidth < nativeElement.scrollWidth;

        this.renderer.removeClass(this.wrapperElement, this.canScrollRightClass());
        this.renderer.removeClass(this.wrapperElement, this.canScrollLeftClass());

        if (canScrollRight) {
            this.renderer.addClass(this.wrapperElement, this.canScrollRightClass());
        }

        if (canScrollLeft) {
            this.renderer.addClass(this.wrapperElement, this.canScrollLeftClass());
        }
    }
}
