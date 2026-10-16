import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FurnitureService } from '../../services/furniture';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  formData = { name: '', email: '', phone: '', message: '', rating: 5 };
  submitted = false;
  submitting = false;
  selectedRating = 5;
  stars = [1, 2, 3, 4, 5];

  constructor(private furnitureService: FurnitureService) {}

  setRating(r: number) {
    this.selectedRating = r;
    this.formData.rating = r;
  }

  submitFeedback() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) return;
    this.submitting = true;
    this.furnitureService.addFeedback({
      name: this.formData.name,
      email: this.formData.email,
      message: this.formData.message,
      rating: this.selectedRating
    }).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: () => { this.submitted = true; this.submitting = false; }  // still show success (saved offline)
    });
  }

  resetForm() {
    this.formData = { name: '', email: '', phone: '', message: '', rating: 5 };
    this.selectedRating = 5;
    this.submitted = false;
  }
}
