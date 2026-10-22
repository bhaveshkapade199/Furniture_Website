import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation';

@Pipe({
  name: 't',
  standalone: true,
  pure: false // Allows dynamic re-render when signal changes
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string, fallback?: string): string {
    return this.translationService.t(key, fallback);
  }
}
