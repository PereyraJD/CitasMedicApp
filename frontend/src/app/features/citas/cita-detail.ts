import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Api, Cita } from '../../core/api';
import { request } from '../../core/request';
import { DURACION_CITA } from '../../shared/date';
import { Feedback } from '../../shared/feedback';
import { SaveAction } from '../../shared/save-action';

@Component({
  selector: 'app-cita-detail',
  imports: [ButtonModule, DatePipe, DialogModule, Feedback],
  template: `
    <p-dialog [header]="confirming() ? '¿Cancelar esta cita?' : 'Detalle de cita'" [visible]="true"
              (visibleChange)="!$event && closed.emit()" [modal]="true" [draggable]="false"
              [closable]="!saveAction.pending()" [closeOnEscape]="!saveAction.pending()" transitionOptions="0ms" closeAriaLabel="Cerrar diálogo" styleClass="app-dialog">
      <app-feedback [loading]="detail().loading" [error]="detail().error" (retry)="retry()">
        @if (detail().data; as cita) {
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="detail-name">{{ cita.paciente }}</h3>
            <span class="badge" [attr.data-state]="cita.estado">{{ cita.estado }}</span>
          </div>
          <dl class="detail-grid">
            <div><dt>Médico</dt><dd>{{ cita.medico }}</dd></div>
            <div><dt>Especialidad</dt><dd>{{ cita.especialidad }}</dd></div>
            <div><dt>Fecha y hora</dt><dd>{{ cita.fechaHora | date:'dd/MM/yyyy · HH:mm' }}</dd></div>
            <div><dt>Duración</dt><dd>{{ duration }} minutos</dd></div>
            <div class="full"><dt>Motivo</dt><dd>{{ cita.motivo }}</dd></div>
          </dl>
          @if (saveAction.error()) { <p class="error" role="alert">{{ saveAction.error() }}</p> }
          <div class="actions">
            @if (confirming()) {
              <button pButton type="button" severity="secondary" [outlined]="true" [disabled]="saveAction.pending()"
                      (click)="goBack()">Volver</button>
              <p-button severity="danger" label="Confirmar cancelación" [loading]="saveAction.pending()" (onClick)="cancel(cita)" />
            } @else {
              <button pButton type="button" severity="secondary" [outlined]="true" (click)="closed.emit()">Cerrar</button>
              @if (cita.estado === 'Programada') {
                <button pButton type="button" severity="danger" [outlined]="true" (click)="confirmOverride.set(true)">Cancelar cita</button>
              }
            }
          </div>
        }
      </app-feedback>
    </p-dialog>
  `
})
export class CitaDetail {
  private readonly api = inject(Api);
  private readonly messages = inject(MessageService);
  private readonly revision = signal(0);
  readonly id = input.required<number>();
  readonly confirmOnOpen = input(false);
  readonly closed = output();
  readonly changed = output<Cita>();
  readonly duration = DURACION_CITA;
  readonly saveAction = new SaveAction();
  readonly confirmOverride = signal<boolean | null>(null);
  readonly detail = request(
    computed(() => ({ id: this.id(), revision: this.revision() })),
    ({ id }) => this.api.cita(id)
  );
  readonly confirming = computed(() => (this.confirmOverride() ?? this.confirmOnOpen()) &&
    this.detail().data?.estado === 'Programada');

  retry(): void {
    this.revision.update(value => value + 1);
  }

  goBack(): void {
    this.saveAction.error.set('');
    this.confirmOverride.set(false);
  }

  cancel(cita: Cita): void {
    this.saveAction.run(() => this.api.cancelarCita(cita.id), updated => {
      this.messages.add({ severity: 'success', summary: 'Cita cancelada', life: 3500 });
      this.changed.emit(updated);
      this.closed.emit();
    });
  }
}
