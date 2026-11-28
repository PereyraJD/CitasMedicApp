import { afterNextRender, Component, ElementRef, HostListener, inject, Injector, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastModule],
  template: `
    <div class="shell" [class.collapsed]="collapsed()" [class.menu-open]="menuOpen()">
      @if (menuOpen()) {
        <button class="mobile-backdrop" type="button" aria-label="Cerrar menú" (click)="closeMenu()"></button>
      }
      <aside id="app-sidebar" class="sidebar" aria-label="Menú principal">
        <a #menuStart class="brand" routerLink="/dashboard" aria-label="CitasMedicApp, inicio" (click)="closeMenu()">
          <span class="brand-icon" aria-hidden="true"><i class="pi pi-plus"></i></span>
          <span class="nav-copy">CitasMedicApp<small>Gestión médica</small></span>
        </a>
        <nav aria-label="Secciones">
          @for (item of links; track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page"
               [attr.aria-label]="item.label" [title]="item.label" (click)="closeMenu()">
              <i [class]="'pi ' + item.icon" aria-hidden="true"></i>
              <span class="nav-copy">{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>
      <div class="workspace" [attr.inert]="menuOpen() ? '' : null">
        <header class="topbar">
          <button #menuToggle class="menu-toggle" type="button" aria-label="Alternar menú" aria-controls="app-sidebar"
                  [attr.aria-expanded]="mobile() ? menuOpen() : !collapsed()" (click)="toggle()">
            <i class="pi pi-bars" aria-hidden="true"></i>
          </button>
          <span>Centro de gestión médica</span>
        </header>
        <main id="contenido"><router-outlet /></main>
      </div>
    </div>
    <p-toast position="top-right" />
  `
})
export class MainLayout {
  private readonly injector = inject(Injector);
  private readonly menuStart = viewChild.required<ElementRef<HTMLAnchorElement>>('menuStart');
  private readonly menuToggle = viewChild.required<ElementRef<HTMLButtonElement>>('menuToggle');
  readonly collapsed = signal(false);
  readonly menuOpen = signal(false);
  readonly mobile = signal(matchMedia('(max-width: 700px)').matches);
  readonly links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'pi-home' },
    { path: '/citas', label: 'Citas', icon: 'pi-list' },
    { path: '/agenda', label: 'Agenda', icon: 'pi-calendar' },
    { path: '/pacientes', label: 'Pacientes', icon: 'pi-users' },
    { path: '/medicos', label: 'Médicos', icon: 'pi-heart' }
  ];

  @HostListener('window:resize')
  updateViewport(): void {
    this.mobile.set(matchMedia('(max-width: 700px)').matches);
    if (!this.mobile()) this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    afterNextRender(() => this.menuToggle().nativeElement.focus(), { injector: this.injector });
  }

  toggle(): void {
    if (!this.mobile()) {
      this.collapsed.update(collapsed => !collapsed);
      return;
    }
    this.menuOpen.set(true);
    afterNextRender(() => this.menuStart().nativeElement.focus(), { injector: this.injector });
  }
}
