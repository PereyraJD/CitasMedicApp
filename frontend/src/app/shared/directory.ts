import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Observable, of } from 'rxjs';
import { Api, Medico, Paciente } from '../core/api';
import { request } from '../core/request';
import { localDay } from './date';
import { Feedback } from './feedback';
import { SaveAction } from './save-action';

type Person = Paciente | Medico;
const requiredText = [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)];

function searchable(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

@Component({
  selector: 'app-directory',
  imports: [ButtonModule, DatePipe, DialogModule, Feedback, FormsModule, InputTextModule, ReactiveFormsModule, SelectModule, TableModule],
  templateUrl: './directory.html'
})
export class Directory {
  private readonly api = inject(Api);
  private readonly messages = inject(MessageService);

  readonly patient = input.required<boolean>();
  readonly increment = (value: number) => value + 1;
  readonly revision = signal(0);
  readonly query = signal('');
  readonly specialty = signal<string | null>(null);
  readonly first = signal(0);
  readonly show = signal(false);
  readonly selected = signal<number | null>(null);
  readonly detailRevision = signal(0);
  readonly saveAction = new SaveAction();

  readonly list = request(
    computed(() => ({ patient: this.patient(), revision: this.revision() })),
    ({ patient }): Observable<Person[]> => patient ? this.api.pacientes() : this.api.medicos()
  );
  readonly detail = request(
    computed(() => ({ id: this.selected(), retry: this.detailRevision() })),
    ({ id }): Observable<Person | null> => id === null ? of(null)
      : this.patient() ? this.api.paciente(id) : this.api.medico(id)
  );
  readonly rows = computed(() => this.list().data ?? []);
  readonly specialties = computed(() => [...new Set(this.rows().flatMap(person =>
    'especialidad' in person ? [person.especialidad] : []
  ))].sort((first, second) => first.localeCompare(second, 'es')));
  readonly filtered = computed(() => {
    const query = searchable(this.query().trim());
    const specialty = this.specialty();
    return this.rows().filter(person =>
      (!specialty || ('especialidad' in person && person.especialidad === specialty)) &&
      (searchable(person.nombre + ' ' + person.apellido + ' ' + this.secondary(person)).includes(query) ||
        ('cedula' in person && /^\d+$/.test(query) && person.cedula.replaceAll('-', '').includes(query)))
    );
  });

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', requiredText],
    apellido: ['', requiredText],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]],
    cedula: [''],
    email: [''],
    fechaNacimiento: [''],
    especialidad: ['']
  });

  secondary(person: Person): string {
    return 'cedula' in person ? person.cedula : person.especialidad;
  }

  today(): string {
    return localDay();
  }

  open(): void {
    const controls = this.form.controls;
    controls.cedula.setValidators(this.patient() ? [Validators.required, Validators.pattern(/^\d{3}-\d{7}-\d$/)] : []);
    controls.email.setValidators(this.patient() ? [Validators.email, Validators.maxLength(100)] : []);
    controls.fechaNacimiento.setValidators(this.patient() ? [
      Validators.required,
      control => control.value > localDay() ? { futureDate: true } : null
    ] : []);
    controls.especialidad.setValidators(this.patient() ? [] : requiredText);
    this.form.reset();
    this.saveAction.error.set('');
    this.show.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveAction.error.set('Completa los campos obligatorios y verifica los formatos.');
      return;
    }
    const value = this.form.getRawValue();
    const base = { nombre: value.nombre.trim(), apellido: value.apellido.trim(), telefono: value.telefono };
    this.saveAction.run(
      (): Observable<Person> => this.patient()
        ? this.api.crearPaciente({
            ...base, cedula: value.cedula, email: value.email.trim() || null, fechaNacimiento: value.fechaNacimiento
          })
        : this.api.crearMedico({ ...base, especialidad: value.especialidad.trim() }),
      () => {
        this.show.set(false);
        this.first.set(0);
        this.query.set('');
        this.specialty.set(null);
        this.revision.update(value => value + 1);
        this.messages.add({ severity: 'success', summary: this.patient() ? 'Paciente registrado' : 'Médico registrado', life: 3500 });
      }
    );
  }
}
