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
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const personalInfo = this.cvDataService.getPersonalInfo();
    this.form = this.fb.group({
      nombres: [personalInfo.nombres || ''],
      apellidos: [personalInfo.apellidos || ''],
      nacionalidad: [personalInfo.nacionalidad || ''],
      fechaNacimiento: [personalInfo.fechaNacimiento || ''],
      puesto: [personalInfo.puesto || ''],
      email: [personalInfo.email || ''],
      celular: [personalInfo.celular || ''],
      ubicacion: [personalInfo.ubicacion || ''],
      resumenProfesional: [personalInfo.resumenProfesional || ''],
      foto: [personalInfo.foto || '']
    });

    if (personalInfo.foto) {
      this.photoPreview = personalInfo.foto;
    }

    this.form.valueChanges.subscribe(values => {
      this.cvDataService.updatePersonalInfo(values);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona una imagen válida (JPG o PNG).');
        return;
      }

      // Máximo 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.photoPreview = e.target.result as string;
          this.form.patchValue({ foto: this.photoPreview });
          this.cvDataService.updatePersonalInfo({ foto: this.photoPreview });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.form.patchValue({ foto: '' });
    this.cvDataService.updatePersonalInfo({ foto: '' });
  }
}

