import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { forkJoin } from 'rxjs';
import { Api, Cita } from '../../core/api';
import { request } from '../../core/request';
import { DURACION_CITA, localDay, localMinute } from '../../shared/date';
import { Feedback } from '../../shared/feedback';
import { SaveAction } from '../../shared/save-action';

export interface CitaDefaults {
  fecha?: string;
  hora?: string;
  medicoId?: number;
}

@Component({
  selector: 'app-cita-form',
  imports: [ButtonModule, DialogModule, Feedback, InputTextModule, ReactiveFormsModule, RouterLink, SelectModule, TextareaModule],
  template: `
    <p-dialog header="Nueva cita" [visible]="true" (visibleChange)="!$event && closed.emit()"
              [modal]="true" [draggable]="false" [closable]="!saveAction.pending()"
              [closeOnEscape]="!saveAction.pending()" transitionOptions="0ms" closeAriaLabel="Cerrar diálogo" styleClass="app-dialog">
      <app-feedback [loading]="options().loading" [error]="options().error" (retry)="retry()">
        @if (patients().length && doctors().length) {
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-grid">
              <div class="filter-field">
                <label for="cita-paciente" id="cita-paciente-label">Paciente</label>
                <p-select inputId="cita-paciente" ariaLabelledBy="cita-paciente-label" formControlName="pacienteId" [options]="patients()"
                          optionLabel="label" optionValue="id" placeholder="Selecciona un paciente" appendTo="body" [filter]="true" filterPlaceholder="Buscar paciente" />
              </div>
              <div class="filter-field">
                <label for="cita-medico" id="cita-medico-label">Médico</label>
                <p-select inputId="cita-medico" ariaLabelledBy="cita-medico-label" formControlName="medicoId" [options]="doctors()"
                          optionLabel="label" optionValue="id" placeholder="Selecciona un médico" appendTo="body" [filter]="true" filterPlaceholder="Buscar médico" />
              </div>
              <label>Fecha <input pInputText type="date" formControlName="fecha" [min]="today" required></label>
              <label>Hora <input pInputText type="time" formControlName="hora" required></label>
              <label class="full">Motivo <textarea pTextarea formControlName="motivo" maxlength="200" rows="3" required></textarea></label>
            </div>
            <p class="muted">Duración de la consulta: {{ duration }} minutos.</p>
            @if (saveAction.error()) { <p class="error" role="alert">{{ saveAction.error() }}</p> }
            <div class="actions">
              <button pButton type="button" severity="secondary" [outlined]="true" [disabled]="saveAction.pending()" (click)="closed.emit()">Cerrar</button>
              <p-button type="submit" label="Agendar cita" [loading]="saveAction.pending()" />
            </div>
          </form>
        } @else {
          <p>Para agendar una cita se requiere un paciente y un médico registrados.</p>
          <div class="flex flex-wrap gap-3 mt-4">
            @if (!patients().length) { <a pButton routerLink="/pacientes">Ir a Pacientes</a> }
            @if (!doctors().length) { <a pButton routerLink="/medicos">Ir a Médicos</a> }
          </div>
        }
      </app-feedback>
    </p-dialog>
  `
})
export class CitaForm {
  private readonly api = inject(Api);
  private readonly messages = inject(MessageService);
  private readonly revision = signal(0);
  readonly defaults = input.required<CitaDefaults>();
  readonly closed = output();
  readonly changed = output<Cita>();
  readonly today = localDay();
  readonly duration = DURACION_CITA;
  readonly saveAction = new SaveAction();
  readonly options = request(this.revision, () => forkJoin({
    patients: this.api.pacientes(), doctors: this.api.medicos()
  }));
  readonly patients = computed(() => (this.options().data?.patients ?? []).map(p => ({
    id: p.id, label: p.nombre + ' ' + p.apellido + ' · ' + p.cedula
  })));
  readonly doctors = computed(() => (this.options().data?.doctors ?? []).map(m => ({
    id: m.id, label: m.nombre + ' ' + m.apellido + ' · ' + m.especialidad
  })));
  readonly form = inject(FormBuilder).group({
    pacienteId: [null as number | null, [Validators.required, Validators.min(1)]],
    medicoId: [null as number | null, [Validators.required, Validators.min(1)]],
    fecha: [this.today, Validators.required],
    hora: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]]
  });

  ngOnInit(): void {
    const { fecha, hora, medicoId } = this.defaults();
    this.form.patchValue({
      fecha: fecha && fecha >= this.today ? fecha : this.today,
      hora: fecha && fecha >= this.today ? (hora ?? '') : '',
      medicoId: medicoId ?? null
    });
  }

  retry(): void {
    this.revision.update(value => value + 1);
  }

  save(): void {
    const { pacienteId, medicoId, fecha, hora, motivo } = this.form.getRawValue();
    if (this.form.invalid || !pacienteId || !medicoId || !fecha || !hora || !motivo?.trim()) {
      this.form.markAllAsTouched();
      this.saveAction.error.set('Completa todos los campos para agendar la cita.');
      return;
    }
    const minute = fecha + 'T' + hora;
    if (minute <= localMinute()) {
      this.saveAction.error.set('Selecciona una fecha y hora futuras.');
      return;
    }
    this.saveAction.run(() => this.api.crearCita({
      pacienteId, medicoId, fechaHora: minute + ':00', motivo: motivo.trim()
    }), cita => {
      this.messages.add({ severity: 'success', summary: 'Cita agendada', life: 3500 });
      this.changed.emit(cita);
      this.closed.emit();
    });
  }
}
