import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Language } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnInit {
  form!: FormGroup;
  languages: Language[] = [];
  editingIndex: number | null = null;

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
    this.languages = [...this.cvDataService.getCvData().languages];

    this.form = this.fb.group({
      idioma: ['', Validators.required],
      nivel: ['intermedio', Validators.required]
    });
  }

  addLanguage(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const lang: Language = {
      id: this.editingIndex != null ? this.languages[this.editingIndex].id : this.generateId(),
      idioma: (value.idioma || '').trim(),
      nivel: value.nivel
    };

    if (this.editingIndex != null) {
      this.languages[this.editingIndex] = lang;
      this.editingIndex = null;
    } else {
      this.languages.push(lang);
    }

    this.cvDataService.setLanguages([...this.languages]);

    this.form.reset({
      idioma: '',
      nivel: 'intermedio'
    });
  }

  editLanguage(index: number): void {
    const l = this.languages[index];
    this.editingIndex = index;
    this.form.reset({
      idioma: l.idioma || '',
      nivel: l.nivel || 'intermedio'
    });
  }

  deleteLanguage(index: number): void {
    this.languages.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        idioma: '',
        nivel: 'intermedio'
      });
    }
    this.cvDataService.setLanguages([...this.languages]);
  }

  dropLanguage(event: CdkDragDrop<Language[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.languages, event.previousIndex, event.currentIndex);
    this.cvDataService.setLanguages([...this.languages]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

