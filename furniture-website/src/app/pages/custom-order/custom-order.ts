import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FurnitureService } from '../../services/furniture';
import { TranslationService } from '../../services/translation';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-custom-order',
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './custom-order.html',
  styleUrl: './custom-order.css'
})
export class CustomOrder {
  langService = inject(TranslationService);
  private furnitureService = inject(FurnitureService);

  submitted = false;
  submitting = false;
  errorMsg = '';

  furnitureTypes = [
    'Sofa Set', 'Bedroom Set', 'Wardrobe', 'TV Unit', 'Modular Kitchen',
    'Temple / Mandir', 'Dining Table & Chairs', 'Study Table / Office Desk',
    'Bookshelf / Shelving Unit', 'Dressing Table', 'Other'
  ];

  woodTypes = [
    'Teak Wood (Sagwan)', 'Sheesham (Indian Rosewood)', 'Marine Grade Plywood + Veneer',
    'Pine Wood', 'MDF / Engineered Wood', 'Acacia Wood', 'Not Sure / Suggest Me'
  ];

  budgetRanges = [
    'Under ₹20,000', '₹20,000 – ₹50,000', '₹50,000 – ₹1,00,000',
    '₹1,00,000 – ₹2,00,000', '₹2,00,000 – ₹5,00,000', 'Above ₹5,00,000'
  ];

  form = {
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    furnitureType: '',
    woodType: '',
    dimensions: '',
    colorFinish: '',
    description: '',
    budgetRange: '',
    urgency: 'flexible' as 'flexible' | 'within_month' | 'urgent',
    homeVisitNeeded: true,
    referenceImageUrl: ''
  };

  get isValid(): boolean {
    return !!(this.form.name && this.form.phone &&
              this.form.furnitureType && this.form.description);
  }

  submit() {
    if (!this.isValid) return;
    this.submitting = true;
    this.errorMsg = '';
    this.furnitureService.submitCustomOrder({
      ...this.form,
      email: this.form.email || 'customer@furniture.in'
    }).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = 'Something went wrong. Please try again or call us directly.';
        console.error(err);
      }
    });
  }

  resetForm() {
    this.submitted = false;
    this.errorMsg = '';
    this.form = {
      name: '', email: '', phone: '', address: '', city: '',
      furnitureType: '', woodType: '', dimensions: '', colorFinish: '',
      description: '', budgetRange: '', urgency: 'flexible',
      homeVisitNeeded: true, referenceImageUrl: ''
    };
  }
}
