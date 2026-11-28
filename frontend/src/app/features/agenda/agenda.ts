import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Api, ESTADOS } from '../../core/api';
import { request } from '../../core/request';
import { DURACION_CITA, localDay, localMinute } from '../../shared/date';
import { Feedback } from '../../shared/feedback';
import { CitaDetail } from '../citas/cita-detail';
import { CitaDefaults, CitaForm } from '../citas/cita-form';

const views = [
  { key: 'timeGridDay', label: 'Día' },
  { key: 'timeGridWeek', label: 'Semana' },
  { key: 'dayGridMonth', label: 'Mes' }
] as const;

@Component({
  imports: [ButtonModule, CitaDetail, CitaForm, Feedback, FormsModule, FullCalendarModule, InputTextModule, SelectModule],
  templateUrl: './agenda.html'
})
export class Agenda {
  private readonly api = inject(Api);
  private readonly calendar = viewChild.required(FullCalendarComponent);
  readonly increment = (value: number) => value + 1;
  readonly views = views;
  readonly states = ESTADOS;
  readonly revision = signal(0);
  readonly doctorsRevision = signal(0);
  readonly doctor = signal<number | null>(null);
  readonly selected = signal<number | null>(null);
  readonly defaults = signal<CitaDefaults | null>(null);
  readonly anchor = signal(localDay());
  readonly view = signal<string>(matchMedia('(max-width: 700px)').matches ? 'timeGridDay' : 'timeGridWeek');
  readonly title = signal('');
  readonly doctors = request(this.doctorsRevision, () => this.api.medicos());
  readonly doctorOptions = computed(() => (this.doctors().data ?? []).map(m => ({
    id: m.id, label: m.nombre + ' ' + m.apellido
  })));
  readonly list = request(
    computed(() => ({ doctor: this.doctor(), revision: this.revision() })),
    ({ doctor }) => this.api.citas(doctor ?? undefined)
  );
  readonly events = computed<EventInput[]>(() => (this.list().data ?? []).map(cita => ({
    id: String(cita.id),
    title: cita.paciente,
    start: cita.fechaHora,
    classNames: ['calendar-event-' + cita.estado.toLowerCase()],
    extendedProps: { doctor: cita.medico, estado: cita.estado }
  })));

  readonly options: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: esLocale,
    firstDay: 1,
    initialView: this.view(),
    headerToolbar: false,
    height: 580,
    views: { dayGridMonth: { height: 'auto' } },
    allDaySlot: false,
    dayMaxEvents: 3,
    nowIndicator: true,
    scrollTime: '07:30:00',
    slotDuration: '00:30:00',
    defaultTimedEventDuration: '00:' + DURACION_CITA + ':00',
    slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    editable: false,
    datesSet: ({ view }) => {
      this.title.set(view.title);
      this.view.set(view.type);
      this.anchor.set(localDay(view.calendar.getDate()));
    },
    eventDidMount: ({ el, event, timeText }) => {
      const label = [timeText, event.title, event.extendedProps['doctor'], event.extendedProps['estado']].filter(Boolean).join(' · ');
      el.title = label;
      el.setAttribute('aria-label', label);
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.onkeydown = keyboard => {
        if (keyboard.key === 'Enter' || keyboard.key === ' ') {
          keyboard.preventDefault();
          this.selected.set(Number(event.id));
        }
      };
    },
    eventClick: ({ event }) => this.selected.set(Number(event.id)),
    dateClick: ({ date, allDay }) => {
      if (allDay ? localDay(date) >= localDay() : date.getTime() > Date.now()) {
        this.open(localDay(date), allDay ? undefined : localMinute(date).slice(11));
      }
    }
  };

  move(action: 'prev' | 'today' | 'next'): void {
    this.calendar().getApi()[action]();
  }

  goTo(value: string): void {
    if (value) this.calendar().getApi().gotoDate(value);
  }

  changeView(view: string): void {
    this.calendar().getApi().changeView(view);
  }

  open(fecha = this.anchor(), hora?: string): void {
    this.defaults.set({ fecha, hora, medicoId: this.doctor() ?? undefined });
  }
}
