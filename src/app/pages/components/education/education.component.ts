import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Education } from 'src/app/core/models/cv-data.model';
// import { CvDataService } from '../../../../core/services/cv-data.service';
// import { Education } from '../../../../core/models/cv-data.model';
import { CvDataService } from 'src/app/core/services/cv-data.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  form!: FormGroup;
  educationItems!: FormArray;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const educations = this.cvDataService.getCvData().education;

    this.form = this.fb.group({
      educations: this.fb.array([])
    });

    this.educationItems = this.form.get('educations') as FormArray;

    if (educations.length === 0) {
      this.addEducation();
    } else {
      educations.forEach(edu => {
        this.addEducation(edu);
      });
    }

    this.form.valueChanges.subscribe(() => {
      this.saveEducations();
    });
  }

  createEducationForm(education?: Education): FormGroup {
    return this.fb.group({
      id: [education?.id || this.generateId()],
      institucion: [education?.institucion || '', Validators.required],
      titulo: [education?.titulo || '', Validators.required],
      enCurso: [education?.enCurso || false],
      ubicacion: [education?.ubicacion || ''],
      promedio: [education?.promedio || ''],
      descripcion: [education?.descripcion || '']
    });
  }

  addEducation(education?: Education): void {
    this.educationItems.push(this.createEducationForm(education));
  }

  removeEducation(index: number): void {
    const education = this.educationItems.at(index).value;
    if (education.id) {
      this.cvDataService.removeEducation(education.id);
    }
    this.educationItems.removeAt(index);
    if (this.educationItems.length === 0) {
      this.addEducation();
    }
  }

  private saveEducations(): void {
    const educations = this.educationItems.value as Education[];
    this.cvDataService.setEducation(educations);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

