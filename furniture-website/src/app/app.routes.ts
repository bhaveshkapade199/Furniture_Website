import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Gallery } from './pages/gallery/gallery';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Admin } from './pages/admin/admin';
import { Team } from './pages/team/team';
import { CustomOrder } from './pages/custom-order/custom-order';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'gallery', component: Gallery },
  { path: 'team', component: Team },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'custom-order', component: CustomOrder },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '' }
];

