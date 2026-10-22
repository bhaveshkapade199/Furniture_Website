import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, Language, LanguageOption } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-floating',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './language-floating.html',
  styleUrl: './language-floating.css'
})
export class LanguageFloating {
  langService = inject(TranslationService);
  private elRef = inject(ElementRef);

  isOpen = false;

  get currentLang(): Language {
    return this.langService.currentLang();
  }

  get currentLabel(): string {
    switch (this.currentLang) {
      case 'hi': return 'हिन्दी';
      case 'mr': return 'मराठी';
      default:   return 'English';
    }
  }

  get currentShortCode(): string {
    switch (this.currentLang) {
      case 'hi': return 'हिन्दी';
      case 'mr': return 'मराठी';
      default:   return 'EN';
    }
  }

  toggleOpen(event?: Event) {
    if (event) event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }

  selectLang(lang: Language, event?: Event) {
    if (event) event.stopPropagation();
    this.langService.setLanguage(lang);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }
}
