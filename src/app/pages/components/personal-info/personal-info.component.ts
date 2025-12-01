import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';


@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const personalInfo = this.cvDataService.getPersonalInfo();
    this.form = this.fb.group({
      nombres: [personalInfo.nombres || ''],
      apellidos: [personalInfo.apellidos || ''],
      cedula: [personalInfo.cedula || ''],
      fechaNacimiento: [personalInfo.fechaNacimiento || ''],
      puesto: [personalInfo.puesto || ''],
      email: [personalInfo.email || ''],
      celular: [personalInfo.celular || ''],
      ubicacion: [personalInfo.ubicacion || ''],
      resumenProfesional: [personalInfo.resumenProfesional || '']
    });

    this.form.valueChanges.subscribe(values => {
      this.cvDataService.updatePersonalInfo(values);
    });
  }
}

