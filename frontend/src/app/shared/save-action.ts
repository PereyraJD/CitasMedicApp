import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { errorText } from '../core/api';

export class SaveAction {
  private readonly destroyRef = inject(DestroyRef);
  readonly pending = signal(false);
  readonly error = signal('');

  run<T>(send: () => Observable<T>, saved: (value: T) => void): void {
    if (this.pending()) return;
    this.pending.set(true);
    this.error.set('');
    send().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.pending.set(false))
    ).subscribe({ next: saved, error: error => this.error.set(errorText(error)) });
  }
}
