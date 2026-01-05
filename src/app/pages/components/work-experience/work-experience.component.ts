import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { WorkExperience } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-work-experience',
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.css']
})
export class WorkExperienceComponent implements OnInit {
  form!: FormGroup;
  experiences: WorkExperience[] = [];
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.experiences = [...this.cvDataService.getCvData().workExperience];

    this.form = this.fb.group({
      empresa: ['', Validators.required],
      puesto: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      actualmenteTrabajando: [false],
      descripcion: ['']
    });

    // Toggle fecha fin
    this.form.get('actualmenteTrabajando')?.valueChanges.subscribe((checked: boolean) => {
      const fechaFin = this.form.get('fechaFin');
      if (!fechaFin) return;
      if (checked) {
        fechaFin.disable({ emitEvent: false });
        fechaFin.setValue('', { emitEvent: false });
      } else {
        fechaFin.enable({ emitEvent: false });
      }
    });
  }

  addExperience(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const exp: WorkExperience = {
      id: this.editingIndex != null ? this.experiences[this.editingIndex].id : this.generateId(),
      empresa: (value.empresa || '').trim(),
      puesto: (value.puesto || '').trim(),
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin || '',
      actualmenteTrabajando: !!value.actualmenteTrabajando,
      descripcion: (value.descripcion || '').trim()
    };

    if (this.editingIndex != null) {
      this.experiences[this.editingIndex] = exp;
      this.editingIndex = null;
    } else {
      this.experiences.push(exp);
    }

    this.cvDataService.setWorkExperience(this.experiences);
    this.form.reset({
      empresa: '',
      puesto: '',
      fechaInicio: '',
      fechaFin: '',
      actualmenteTrabajando: false,
      descripcion: ''
    });
  }

  editExperience(index: number): void {
    const exp = this.experiences[index];
    this.editingIndex = index;
    this.form.reset({
      empresa: exp.empresa || '',
      puesto: exp.puesto || '',
      fechaInicio: exp.fechaInicio || '',
      fechaFin: exp.fechaFin || '',
      actualmenteTrabajando: !!exp.actualmenteTrabajando,
      descripcion: exp.descripcion || ''
    });
  }

  deleteExperience(index: number): void {
    const exp = this.experiences[index];
    this.experiences.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        empresa: '',
        puesto: '',
        fechaInicio: '',
        fechaFin: '',
        actualmenteTrabajando: false,
        descripcion: ''
      });
    }
    if (exp?.id) {
      this.cvDataService.removeWorkExperience(exp.id);
    } else {
      this.cvDataService.setWorkExperience(this.experiences);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

