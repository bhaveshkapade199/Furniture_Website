import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FurnitureService } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  langService = inject(TranslationService);
  private furnitureService = inject(FurnitureService);

  formData = { name: '', email: '', phone: '', message: '', rating: 5 };
  submitted = false;
  submitting = false;
  selectedRating = 5;
  stars = [1, 2, 3, 4, 5];

  setRating(r: number) {
    this.selectedRating = r;
    this.formData.rating = r;
  }

  submitFeedback() {
    if (!this.formData.name || !this.formData.message) return;
    this.submitting = true;
    this.furnitureService.addFeedback({
      name: this.formData.name,
      email: this.formData.email || this.formData.phone || 'not-provided@client.com',
      message: `${this.formData.phone ? '[Phone: ' + this.formData.phone + '] ' : ''}${this.formData.message}`,
      rating: this.selectedRating
    }).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.submitted = true; this.submitting = false; }
    });
  }

  resetForm() {
    this.formData = { name: '', email: '', phone: '', message: '', rating: 5 };
    this.selectedRating = 5;
    this.submitted = false;
  }
}
