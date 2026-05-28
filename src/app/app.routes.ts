import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Home | PBC'
  },
  {
    path: 'songbook',
    loadComponent: () => import('./features/songbook/songbook.component').then((m) => m.SongbookComponent),
    title: 'Songbook | PBC'
  },
  {
    path: 'songbook/:id',
    loadComponent: () => import('./features/songbook/song-detail/song-detail.component').then((m) => m.SongDetailComponent),
    title: 'Song Detail | PBC'
  },
  {
    path: 'songs',
    redirectTo: 'songbook',
    pathMatch: 'full'
  },
  {
    path: 'staff',
    redirectTo: 'about/staff',
    pathMatch: 'full'
  },
  {
    path: 'about/staff',
    loadComponent: () => import('./features/staff/staff.component').then((m) => m.StaffComponent),
    title: 'Staff | PBC'
  },
  {
    path: 'about/staff/:id',
    loadComponent: () => import('./features/staff/staff-detail/staff-detail.component').then((m) => m.StaffDetailComponent),
    title: 'Staff Profile | PBC'
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
    title: 'About | PBC'
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact | PBC'
  },
  {
    path: 'sermons',
    loadComponent: () => import('./features/sermons/sermons.component').then((m) => m.SermonsComponent),
    title: 'Sermons | PBC'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
