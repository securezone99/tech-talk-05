import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[appAutoresize]'
})
export class AutoresizeDirective {
  constructor(private elementRef: ElementRef) {
    this.adjust();
  }

  @HostListener('input', ['$event.target'])
  onInput(): void {
    this.adjust();
  }

  public adjust(): void {
    const textarea = this.elementRef.nativeElement;
    textarea.style.overflow = 'hidden';
    if (textarea.value === '') {
      // Set the textarea height to a default value when there's no content
      textarea.style.height = '30px';
    } else {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
}
