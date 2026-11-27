import { expect, Locator, Page, test } from '@playwright/test';

function day(date: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Santo_Domingo' }).format(date);
}

function response(page: Page, method: string, path: RegExp, status: number) {
  return page.waitForResponse(result => result.request().method() === method &&
    path.test(new URL(result.url()).pathname) && result.status() === status
  );
}

async function choose(page: Page, field: string, value: string | RegExp, scope: Page | Locator = page) {
  const control = scope.getByRole('combobox', { name: field, exact: true });
  await control.click();
  await page.getByRole('option', { name: value }).click();
  await expect(control).toContainText(value);
}

test('registra y consulta los directorios, agenda, filtra y cancela contra la API', async ({ page, request }) => {
  const suffix = String(Date.now()).slice(-7);
  const cedula = '001-' + suffix + '-3';
  const persona = 'Prueba ' + suffix;
  const futuro = day(new Date(Date.now() + 2 * 86400000));
  const apiErrors: string[] = [];
  page.on('pageerror', error => apiErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) apiErrors.push(message.text());
  });

  await page.goto('/pacientes');
  await expect(page.getByRole('heading', { name: 'Pacientes', exact: true })).toBeVisible();
  const paciente = page.getByRole('dialog', { name: 'Nuevo paciente' });
  async function fillPaciente() {
    await page.getByRole('button', { name: 'Nuevo paciente' }).click();
    await expect(paciente.getByLabel('Nombre', { exact: true })).toBeFocused();
    await paciente.getByLabel('Nombre', { exact: true }).fill('Ana');
    await paciente.getByLabel('Apellido').fill(persona);
    await paciente.getByLabel('Teléfono').fill('809-555-0100');
    await paciente.getByLabel('Cédula').fill(cedula);
    await paciente.getByLabel('Correo electrónico (opcional)').fill('ana@example.test');
    await paciente.getByLabel('Fecha de nacimiento').fill('1998-04-28');
  }

  await fillPaciente();
  const postPaciente = response(page, 'POST', /^\/api\/pacientes$/, 201);
  await paciente.getByRole('button', { name: 'Registrar' }).click();
  const { id: pacienteId } = await (await postPaciente).json();
  await expect(paciente).toBeHidden();
  await page.getByRole('searchbox', { name: 'Buscar' }).fill(cedula.replaceAll('-', ''));
  const getPaciente = response(page, 'GET', new RegExp('/api/pacientes/' + pacienteId + '$'), 200);
  await page.getByRole('button', { name: 'Ver detalle de Ana ' + persona }).click();
  await getPaciente;
  await expect(page.getByRole('dialog', { name: 'Detalle de paciente' }).getByText('28/04/1998')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Detalle de paciente' })).toBeHidden();
  await fillPaciente();
  const duplicate = response(page, 'POST', /^\/api\/pacientes$/, 409);
  await paciente.getByRole('button', { name: 'Registrar' }).click();
  await duplicate;
  await expect(paciente.getByRole('alert')).toHaveText('Ya existe un paciente registrado con esa cédula.');
  await page.keyboard.press('Escape');


  await page.getByRole('link', { name: 'Médicos', exact: true }).click();
  await page.getByRole('button', { name: 'Nuevo médico' }).click();
  const medico = page.getByRole('dialog', { name: 'Nuevo médico' });
  await expect(medico.getByLabel('Nombre', { exact: true })).toBeFocused();
  await medico.getByLabel('Nombre', { exact: true }).fill('Luis');
  await medico.getByLabel('Apellido').fill(persona);
  await medico.getByLabel('Teléfono').fill('809-555-0101');
  await medico.getByLabel('Especialidad').fill('Cardiología');
  const postMedico = response(page, 'POST', /^\/api\/medicos$/, 201);
  await medico.getByRole('button', { name: 'Registrar' }).click();
  const { id: medicoId } = await (await postMedico).json();
  await expect(medico).toBeHidden();
  await choose(page, 'Especialidad', 'Cardiología');
  await page.getByRole('searchbox', { name: 'Buscar' }).fill('Luis ' + persona);
  const getMedico = response(page, 'GET', new RegExp('/api/medicos/' + medicoId + '$'), 200);
  await page.getByRole('button', { name: 'Ver detalle de Luis ' + persona }).click();
  await getMedico;
  await expect(page.getByRole('dialog', { name: 'Detalle de médico' }).getByText('Cardiología')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('link', { name: 'Citas', exact: true }).click();
  const motivo = 'Consulta ' + suffix;
  async function fillCita(hora: string, reason: string, patientName = 'Ana ' + persona, doctorName = 'Luis ' + persona) {
    await page.getByRole('button', { name: 'Nueva cita' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nueva cita' });
    await choose(page, 'Paciente', new RegExp(patientName), dialog);
    await choose(page, 'Médico', new RegExp(doctorName), dialog);
    await dialog.getByLabel('Fecha', { exact: true }).fill(futuro);
    await dialog.getByLabel('Hora', { exact: true }).fill(hora);
    await dialog.getByLabel('Motivo').fill(reason);
    return dialog;
  }

  const cita = await fillCita('10:00', motivo);
  await cita.getByLabel('Fecha', { exact: true }).fill(day(new Date(Date.now() - 86400000)));
  await cita.getByRole('button', { name: 'Agendar cita' }).click();
  await expect(cita.getByRole('alert')).toHaveText('Selecciona una fecha y hora futuras.');
  await cita.getByLabel('Fecha', { exact: true }).fill(futuro);
  const postCita = response(page, 'POST', /^\/api\/citas$/, 201);
  await cita.getByRole('button', { name: 'Agendar cita' }).click();
  const { id: citaId, fechaHora } = await (await postCita).json();
  expect(fechaHora).toBe(futuro + 'T10:00:00');
  await expect(cita).toBeHidden();

  const otherDoctor = await request.post('/api/medicos', { data: {
    nombre: 'Elena', apellido: persona, telefono: '809-555-0102', especialidad: 'Medicina general'
  } });
  expect(otherDoctor.status()).toBe(201);
  const overlapDoctor = await fillCita('10:15', 'Conflicto de médico');
  await overlapDoctor.getByRole('button', { name: 'Agendar cita' }).click();
  await expect(overlapDoctor.getByRole('alert')).toHaveText('El médico ya tiene una cita en ese horario.');
  await overlapDoctor.getByRole('button', { name: 'Cerrar', exact: true }).click();
  const overlapPatient = await fillCita('10:15', 'Conflicto de paciente', 'Ana ' + persona, 'Elena ' + persona);
  await overlapPatient.getByRole('button', { name: 'Agendar cita' }).click();
  await expect(overlapPatient.getByRole('alert')).toHaveText('El paciente ya tiene una cita en ese horario.');
  await page.keyboard.press('Escape');

  await choose(page, 'Médico', 'Luis ' + persona);
  const filtered = page.waitForResponse(result => {
    const url = new URL(result.url());
    return url.pathname === '/api/citas' && url.searchParams.get('medicoId') === String(medicoId) &&
      url.searchParams.get('fecha') === futuro && result.ok();
  });
  await page.getByLabel('Fecha', { exact: true }).fill(futuro);
  await filtered;
  const row = page.getByRole('row').filter({ hasText: motivo });
  await expect(row.getByText('Programada')).toBeVisible();

  await page.getByRole('link', { name: 'Agenda', exact: true }).click();
  await choose(page, 'Médico', 'Luis ' + persona);
  await page.getByLabel('Ir a fecha').fill(futuro);
  await page.getByRole('button', { name: 'Mes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Día', exact: true }).click();
  const getCita = response(page, 'GET', new RegExp('/api/citas/' + citaId + '$'), 200);
  await page.getByRole('button', { name: new RegExp('10:00.*Ana ' + persona) }).click();
  await getCita;
  const detail = page.getByRole('dialog', { name: 'Detalle de cita' });
  await expect(detail.getByText(motivo)).toBeVisible();
  await detail.getByRole('button', { name: 'Cancelar cita' }).click();
  const patch = response(page, 'PATCH', new RegExp('/api/citas/' + citaId + '/cancelar$'), 200);
  await page.getByRole('button', { name: 'Confirmar cancelación' }).click();
  expect((await (await patch).json()).estado).toBe('Cancelada');
  await expect(page.getByRole('button', { name: new RegExp('10:00.*Ana ' + persona + '.*Cancelada') })).toBeVisible();

  await page.getByRole('link', { name: 'Citas', exact: true }).click();
  await choose(page, 'Estado', 'Cancelada');
  await page.getByLabel('Fecha', { exact: true }).fill(futuro);
  await expect(page.getByRole('row').filter({ hasText: motivo }).getByText('Cancelada')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: motivo }).getByRole('button', { name: 'Cancelar' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Citas por estado' })).toBeVisible();
  await expect(page.getByText('Total de citas')).toBeVisible();
  expect(apiErrors).toEqual([]);
});

test('navega por todas las pantallas en móvil sin desbordar la página', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const [link, heading] of [
    ['Agenda', 'Agenda médica'], ['Pacientes', 'Pacientes'], ['Médicos', 'Médicos'], ['Citas', 'Citas'], ['Dashboard', 'Dashboard']
  ]) {
    await page.getByRole('button', { name: 'Alternar menú' }).click();
    await page.getByRole('link', { name: link, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Alternar menú' })).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});
