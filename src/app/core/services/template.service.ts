import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Template } from '../models/cv-data.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly STORAGE_KEY = 'selected_template';
  private readonly PRIMARY_COLOR_KEY = 'cv_primary_color';
  private readonly DEFAULT_PRIMARY_COLOR = '#1976d2';

  private templates: Template[] = [
    {
      id: 'template-1',
      nombre: 'Plantilla 1 (Actual)',
      descripcion: 'Plantilla por defecto (layout actual)',
      preview: 'assets/image/plantillas/plantilla1-1.jpg',
      estilos: {
        colorPrincipal: '#1976d2',
        colorSecundario: '#424242',
        fuenteTitulo: 'Arial',
        fuenteTexto: 'Arial',
        espaciado: 'normal'
      }
    },
    {
      id: 'template-2',
      nombre: 'Moderno',
      descripcion: 'Diseño contemporáneo y limpio',
      preview: 'assets/image/plantillas/plantilla2-1.png',
      estilos: {
        colorPrincipal: '#00bcd4',
        colorSecundario: '#607d8b',
        fuenteTitulo: 'Roboto',
        fuenteTexto: 'Roboto',
        espaciado: 'amplio'
      }
    },
    {
      id: 'template-3',
      nombre: 'Plantilla 3',
      descripcion: 'Header destacado + sidebar limpio',
      preview: 'assets/image/plantillas/plantilla3-1.png',
      estilos: {
        colorPrincipal: '#2563eb',
        colorSecundario: '#0f172a',
        fuenteTitulo: 'Montserrat',
        fuenteTexto: 'Inter',
        espaciado: 'normal'
      }
    }
  ];

  private selectedTemplateSubject = new BehaviorSubject<Template>(this.templates[0]);
  public selectedTemplate$: Observable<Template> = this.selectedTemplateSubject.asObservable();

  private selectedPrimaryColorSubject = new BehaviorSubject<string>(this.DEFAULT_PRIMARY_COLOR);
  public selectedPrimaryColor$: Observable<string> = this.selectedPrimaryColorSubject.asObservable();

  constructor() {
    this.loadSelectedTemplate();
    this.loadPrimaryColor();
    this.applyPrimaryColorToDom(this.selectedPrimaryColorSubject.value);
  }

  getTemplates(): Template[] {
    return this.templates;
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  selectTemplate(templateId: string): void {
    const template = this.getTemplateById(templateId);
    if (template) {
      this.selectedTemplateSubject.next(template);
      localStorage.setItem(this.STORAGE_KEY, templateId);
    }
  }

  getSelectedTemplate(): Template {
    return this.selectedTemplateSubject.value;
  }

  getPrimaryColor(): string {
    return this.selectedPrimaryColorSubject.value;
  }

  setPrimaryColor(color: string): void {
    if (!color) return;
    this.selectedPrimaryColorSubject.next(color);
    try {
      localStorage.setItem(this.PRIMARY_COLOR_KEY, color);
    } catch {
      // ignore
    }
    this.applyPrimaryColorToDom(color);
  }

  private loadSelectedTemplate(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const template = this.getTemplateById(stored);
      if (template) {
        this.selectedTemplateSubject.next(template);
      }
    }
  }

  private loadPrimaryColor(): void {
    try {
      const stored = localStorage.getItem(this.PRIMARY_COLOR_KEY);
      if (stored) {
        this.selectedPrimaryColorSubject.next(stored);
      }
    } catch {
      // ignore
    }
  }

  private applyPrimaryColorToDom(color: string): void {
    // Aplicamos en :root para que impacte el preview (y cualquier componente que use la variable)
    try {
      document.documentElement.style.setProperty('--cv-primary', color);
    } catch {
      // En entornos sin DOM (tests) no hacemos nada
    }
  }
}

