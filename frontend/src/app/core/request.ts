import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { errorText } from './api';

export interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

export function request<K, T>(key: Signal<K>, load: (key: K) => Observable<T>) {
  const pending: RequestState<T> = { data: null, loading: true, error: '' };
  return toSignal(toObservable(key).pipe(
    switchMap(value => load(value).pipe(
      map(data => ({ data, loading: false, error: '' })),
      catchError(error => of({ data: null, loading: false, error: errorText(error) })),
      startWith(pending)
    ))
  ), { initialValue: pending });
}
