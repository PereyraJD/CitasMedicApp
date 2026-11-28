import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-feedback',
  imports: [ButtonModule, SkeletonModule],
  template: `
    @if (loading()) {
      <div class="grid gap-3 py-4" role="status" aria-label="Cargando">
        <p-skeleton width="45%" height="1rem" />
        <p-skeleton height="2.75rem" />
        <p-skeleton height="2.75rem" />
      </div>
    } @else if (error()) {
      <div class="error" role="alert">
        <span>{{ error() }}</span>
        <button pButton type="button" severity="secondary" size="small" (click)="retry.emit()">
          Reintentar
        </button>
      </div>
    } @else {
      <ng-content />
    }
  `
})
export class Feedback {
  readonly loading = input(false);
  readonly error = input('');
  readonly retry = output();
}
