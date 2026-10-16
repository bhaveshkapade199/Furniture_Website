import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  whatsappLink = 'https://wa.me/919876543210?text=Hello%20Bhavesh%20Furniture%2C%20I%20am%20interested%20in%20your%20furniture.';
}
