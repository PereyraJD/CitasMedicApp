import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { forkJoin } from 'rxjs';
import { Api, ESTADOS } from '../../core/api';
import { request } from '../../core/request';
import { localDay, localMinute } from '../../shared/date';
import { Feedback } from '../../shared/feedback';

@Component({
  imports: [ChartModule, DatePipe, Feedback, RouterLink],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private readonly api = inject(Api);
  private readonly revision = signal(0);

  readonly todayDate = new Date();
  readonly overview = request(this.revision, () => forkJoin({
    citas: this.api.citas(), pacientes: this.api.pacientes(), medicos: this.api.medicos()
  }));
  readonly citas = computed(() => this.overview().data?.citas ?? []);
  readonly today = computed(() => this.citas().filter(c => c.fechaHora.startsWith(localDay(this.todayDate))));
  readonly upcoming = computed(() => {
    const now = localMinute(this.todayDate) + ':00';
    return this.citas().filter(c => c.estado === 'Programada' && c.fechaHora > now);
  });
  readonly metrics = computed(() => [
    { label: 'Citas de hoy', value: this.today().length, icon: 'pi-calendar', color: 'blue' },
    { label: 'Próximas citas', value: this.upcoming().length, icon: 'pi-clock', color: 'purple' },
    { label: 'Pacientes', value: this.overview().data?.pacientes.length ?? 0, icon: 'pi-users', color: 'teal' },
    { label: 'Médicos', value: this.overview().data?.medicos.length ?? 0, icon: 'pi-heart', color: 'green' }
  ]);
  readonly statuses = computed(() => ESTADOS.map((label, index) => ({
    label, count: this.citas().filter(c => c.estado === label).length,
    color: ['#2563eb', '#f87171', '#16a377'][index]
  })));
  readonly chart = computed<ChartData<'doughnut'>>(() => ({
    labels: this.statuses().map(state => state.label),
    datasets: [{
      data: this.citas().length ? this.statuses().map(state => state.count) : [1],
      backgroundColor: this.citas().length ? this.statuses().map(state => state.color) : ['#eaf0f7'],
      borderWidth: 0,
      hoverOffset: 3
    }]
  }));
  readonly chartOptions: ChartOptions<'doughnut'> = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  };

  retry(): void {
    this.revision.update(value => value + 1);
  }
}
