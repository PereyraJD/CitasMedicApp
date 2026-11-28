import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface CrearPaciente {
  nombre: string;
  apellido: string;
  telefono: string;
  cedula: string;
  email: string | null;
  fechaNacimiento: string;
}

export interface Paciente extends CrearPaciente {
  id: number;
  descripcion: string;
}

export interface CrearMedico {
  nombre: string;
  apellido: string;
  telefono: string;
  especialidad: string;
}

export interface Medico extends CrearMedico {
  id: number;
  descripcion: string;
}

export const ESTADOS = ['Programada', 'Cancelada', 'Completada'] as const;
export type Estado = typeof ESTADOS[number];

export interface CrearCita {
  pacienteId: number;
  medicoId: number;
  fechaHora: string;
  motivo: string;
}

export interface Cita extends CrearCita {
  id: number;
  paciente: string;
  medico: string;
  especialidad: string;
  estado: Estado;
}

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  pacientes() {
    return this.http.get<Paciente[]>('/api/pacientes');
  }

  paciente(id: number) {
    return this.http.get<Paciente>('/api/pacientes/' + id);
  }

  crearPaciente(dto: CrearPaciente) {
    return this.http.post<Paciente>('/api/pacientes', dto);
  }

  medicos() {
    return this.http.get<Medico[]>('/api/medicos');
  }

  medico(id: number) {
    return this.http.get<Medico>('/api/medicos/' + id);
  }

  crearMedico(dto: CrearMedico) {
    return this.http.post<Medico>('/api/medicos', dto);
  }

  citas(medicoId?: number, fecha?: string) {
    let params = new HttpParams();
    if (medicoId) params = params.set('medicoId', medicoId);
    if (fecha) params = params.set('fecha', fecha);
    return this.http.get<Cita[]>('/api/citas', { params });
  }

  cita(id: number) {
    return this.http.get<Cita>('/api/citas/' + id);
  }

  crearCita(dto: CrearCita) {
    return this.http.post<Cita>('/api/citas', dto);
  }

  cancelarCita(id: number) {
    return this.http.patch<Cita>('/api/citas/' + id + '/cancelar', null);
  }
}

export function errorText(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';
  const body = error.error;
  if (typeof body?.mensaje === 'string') return body.mensaje;
  if (body?.errors && typeof body.errors === 'object') {
    const messages = Object.values(body.errors).flat().filter(value => typeof value === 'string');
    if (messages.length) return messages.join(' ');
  }
  if (error.status === 404) return 'El registro solicitado ya no está disponible.';
  if (error.status === 0 || error.status >= 500) return 'No se pudo obtener una respuesta de la API.';
  return 'La solicitud falló (' + error.status + ').';
}
