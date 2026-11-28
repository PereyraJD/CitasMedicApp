import { Component } from '@angular/core';
import { Directory } from '../../shared/directory';

@Component({ imports: [Directory], template: '<app-directory [patient]="false" />' })
export class Medicos {}
