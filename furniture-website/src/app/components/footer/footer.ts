import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  langService = inject(TranslationService);
  currentYear = new Date().getFullYear();

  whatsappLink = 'https://wa.me/919876543210?text=Hello%20Rk%20Furniture%2C%20I%20am%20interested%20in%20your%20furniture.';

  setLang(lang: Language) {
    this.langService.setLanguage(lang);
  }
}
