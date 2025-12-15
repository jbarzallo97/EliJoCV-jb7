import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { WorkExperience } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-work-experience',
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.css']
})
export class WorkExperienceComponent implements OnInit {
  form!: FormGroup;
  experienceItems!: FormArray;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const experiences = this.cvDataService.getCvData().workExperience;

    this.form = this.fb.group({
      experiences: this.fb.array([])
    });

    this.experienceItems = this.form.get('experiences') as FormArray;

    if (experiences.length === 0) {
      this.addExperience();
    } else {
      experiences.forEach(exp => this.addExperience(exp));
    }

    this.form.valueChanges.subscribe(() => {
      this.saveExperiences();
    });
  }

  get experiencesArray(): FormArray {
    return this.experienceItems;
  }

  createExperienceForm(exp?: WorkExperience): FormGroup {
    return this.fb.group({
      id: [exp?.id || this.generateId()],
      empresa: [exp?.empresa || '', Validators.required],
      puesto: [exp?.puesto || '', Validators.required],
      fechaInicio: [exp?.fechaInicio || '', Validators.required],
      fechaFin: [exp?.fechaFin || ''],
      actualmenteTrabajando: [exp?.actualmenteTrabajando || false],
      descripcion: [exp?.descripcion || '']
    });
  }

  addExperience(exp?: WorkExperience): void {
    this.experienceItems.push(this.createExperienceForm(exp));
  }

  removeExperience(index: number): void {
    const exp = this.experienceItems.at(index).value;
    if (exp.id) {
      this.cvDataService.removeWorkExperience(exp.id);
    }
    this.experienceItems.removeAt(index);
    if (this.experienceItems.length === 0) {
      this.addExperience();
    }
  }

  private saveExperiences(): void {
    const experiences = this.experienceItems.value as WorkExperience[];
    this.cvDataService.setWorkExperience(experiences);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

