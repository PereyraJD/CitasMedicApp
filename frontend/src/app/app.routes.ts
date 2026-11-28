import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', title: 'Dashboard | CitasMedicApp', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
  { path: 'agenda', title: 'Agenda | CitasMedicApp', loadComponent: () => import('./features/agenda/agenda').then(m => m.Agenda) },
  { path: 'pacientes', title: 'Pacientes | CitasMedicApp', loadComponent: () => import('./features/pacientes/pacientes').then(m => m.Pacientes) },
  { path: 'medicos', title: 'Médicos | CitasMedicApp', loadComponent: () => import('./features/medicos/medicos').then(m => m.Medicos) },
  { path: 'citas', title: 'Citas | CitasMedicApp', loadComponent: () => import('./features/citas/citas').then(m => m.Citas) },
  { path: '**', redirectTo: 'dashboard' }
];
