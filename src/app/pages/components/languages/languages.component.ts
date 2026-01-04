import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Language } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnInit {
  form!: FormGroup;
  languagesArray!: FormArray;

  niveles = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'nativo', label: 'Nativo' }
  ];

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const languages = this.cvDataService.getCvData().languages;

    this.form = this.fb.group({
      languages: this.fb.array([])
    });

    this.languagesArray = this.form.get('languages') as FormArray;

    if (languages.length === 0) {
      this.addLanguage();
    } else {
      languages.forEach(lang => this.addLanguage(lang));
    }

    this.form.valueChanges.subscribe(() => {
      this.saveLanguages();
    });
  }

  createLanguageForm(lang?: Language): FormGroup {
    return this.fb.group({
      id: [lang?.id || this.generateId()],
      idioma: [lang?.idioma || '', Validators.required],
      nivel: [lang?.nivel || 'intermedio', Validators.required]
    });
  }

  addLanguage(lang?: Language): void {
    this.languagesArray.push(this.createLanguageForm(lang));
  }

  removeLanguage(index: number): void {
    this.languagesArray.removeAt(index);
    if (this.languagesArray.length === 0) {
      this.addLanguage();
    }
    this.saveLanguages();
  }

  private saveLanguages(): void {
    const languages = (this.languagesArray.value as Language[])
      .filter(lang => (lang.idioma || '').trim().length > 0);
    this.cvDataService.setLanguages(languages);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

