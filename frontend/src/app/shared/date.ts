// The API stores appointments as local wall time (timestamp without time zone).
export function localDay(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

export function localMinute(date = new Date()): string {
  return localDay(date) + 'T' + String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0');
}

export const DURACION_CITA = 30;
