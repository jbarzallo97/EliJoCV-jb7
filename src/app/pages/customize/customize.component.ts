import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { CvLabels } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.css']
})
export class CustomizeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const labels = this.cvDataService.getCvData().labels;
    this.form = this.fb.group({
      // Section titles
      sectionProfile: [labels.sectionProfile, [Validators.required, Validators.maxLength(40)]],
      sectionWorkExperience: [labels.sectionWorkExperience, [Validators.required, Validators.maxLength(40)]],
      sectionEducation: [labels.sectionEducation, [Validators.required, Validators.maxLength(40)]],
      sectionReferences: [labels.sectionReferences, [Validators.required, Validators.maxLength(40)]],

      // Sidebar titles
      sectionLanguages: [labels.sectionLanguages, [Validators.required, Validators.maxLength(40)]],
      sectionSkills: [labels.sectionSkills, [Validators.required, Validators.maxLength(40)]],
      sectionCourses: [labels.sectionCourses, [Validators.required, Validators.maxLength(40)]],
      sectionProjects: [labels.sectionProjects, [Validators.required, Validators.maxLength(40)]],

      // Contact labels
      labelEmail: [labels.labelEmail, [Validators.required, Validators.maxLength(30)]],
      labelPhone: [labels.labelPhone, [Validators.required, Validators.maxLength(30)]],
      labelAddress: [labels.labelAddress, [Validators.required, Validators.maxLength(30)]],
      labelNationality: [labels.labelNationality, [Validators.required, Validators.maxLength(30)]],
      labelBirthDate: [labels.labelBirthDate, [Validators.required, Validators.maxLength(30)]],
      labelAge: [labels.labelAge, [Validators.required, Validators.maxLength(30)]]
    });

    // Si en otro lugar cambian labels (por storage/merge), reflejar en el form sin auto-guardar
    this.sub = this.cvDataService.cvData$.subscribe(d => {
      if (!this.form) return;
      this.form.patchValue(d.labels, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const labels = this.form.getRawValue() as CvLabels;
    this.cvDataService.setLabels(labels);
  }

  resetToDefault(): void {
    this.cvDataService.resetLabels();
  }
}


