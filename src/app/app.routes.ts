import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
  },

  // ✅ Admin dashboard (celui que tu veux garder)
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/admin-dashboard/admin-dashboard').then(
        m => m.AdminDashboardComponent
      ),
  },

  // ✅ Students management
  {
    path: 'admin/students',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/students/students.component').then(
        m => m.StudentsComponent
      ),
  },

  // ✅ Courses management
  {
    path: 'admin/courses',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/courses/courses.component').then(
        m => m.CoursesComponent
      ),
  },

  // ✅ Reports
  {
    path: 'admin/reports',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/reports/reports.component').then(
        m => m.ReportsComponent
      ),
  },

  // (optionnel) rediriger /dashboard vers /admin/dashboard si tu veux
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // fallback
  { path: '**', redirectTo: 'login' },
];