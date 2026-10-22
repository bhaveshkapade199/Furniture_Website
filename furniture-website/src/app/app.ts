import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { LanguageFloating } from './components/language-floating/language-floating';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, LanguageFloating],
  template: `
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
    <app-language-floating></app-language-floating>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 140px);
    }
  `]
})
export class App {
  title = 'Rk Furniture';
}
