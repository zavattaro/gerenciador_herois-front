import { Routes } from '@angular/router';
import { HeroPage } from './pages/hero/hero';

export const routes: Routes = [
    {path: '', redirectTo: 'hero', pathMatch: 'full'},
    {path: 'hero', component: HeroPage},
    {path: '**', redirectTo: 'hero'},
];
