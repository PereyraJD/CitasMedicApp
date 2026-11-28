import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Api, ESTADOS, Estado } from '../../core/api';
import { request } from '../../core/request';
import { Feedback } from '../../shared/feedback';
import { CitaDetail } from './cita-detail';
import { CitaDefaults, CitaForm } from './cita-form';

@Component({
  imports: [ButtonModule, CitaDetail, CitaForm, DatePipe, Feedback, FormsModule, InputTextModule, SelectModule, TableModule],
  templateUrl: './citas.html'
})
export class Citas {
  private readonly api = inject(Api);
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;
  readonly increment = (value: number) => value + 1;
  readonly revision = signal(0);
  readonly doctorsRevision = signal(0);
  readonly date = signal('');
  readonly doctor = signal<number | null>(null);
  readonly state = signal<Estado | null>(null);
  readonly first = signal(0);
  readonly selected = signal<{ id: number; cancel: boolean } | null>(null);
  readonly defaults = signal<CitaDefaults | null>(null);
  readonly states = [...ESTADOS];
  readonly doctors = request(this.doctorsRevision, () => this.api.medicos());
  readonly doctorOptions = computed(() => (this.doctors().data ?? []).map(m => ({
    id: m.id, label: m.nombre + ' ' + m.apellido
  })));
  readonly list = request(
    computed(() => ({ doctor: this.doctor(), date: this.date(), revision: this.revision() })),
    ({ doctor, date }) => this.api.citas(doctor ?? undefined, date || undefined)
  );
  readonly filtered = computed(() => (this.list().data ?? []).filter(c => !this.state() || c.estado === this.state()));

  constructor() {
    const date = this.params.get('fecha') ?? '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) this.date.set(date);
    const id = Number(this.params.get('id'));
    if (Number.isSafeInteger(id) && id > 0) this.selected.set({ id, cancel: false });
  }

  open(): void {
    this.defaults.set({ fecha: this.date(), medicoId: this.doctor() ?? undefined });
  }

  reload(): void {
    this.first.set(0);
    this.revision.update(this.increment);
  }
}
