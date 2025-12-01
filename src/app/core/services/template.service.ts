import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Template } from '../models/cv-data.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private readonly STORAGE_KEY = 'selected_template';
  
  private templates: Template[] = [
    {
      id: 'template-1',
      nombre: 'Clásico',
      descripcion: 'Diseño tradicional y profesional',
      preview: '/assets/templates/template-1-preview.png',
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
      preview: '/assets/templates/template-2-preview.png',
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
      nombre: 'Minimalista',
      descripcion: 'Diseño simple y elegante',
      preview: '/assets/templates/template-3-preview.png',
      estilos: {
        colorPrincipal: '#212121',
        colorSecundario: '#757575',
        fuenteTitulo: 'Helvetica',
        fuenteTexto: 'Helvetica',
        espaciado: 'compacto'
      }
    }
  ];

  private selectedTemplateSubject = new BehaviorSubject<Template>(this.templates[0]);
  public selectedTemplate$: Observable<Template> = this.selectedTemplateSubject.asObservable();

  constructor() {
    this.loadSelectedTemplate();
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

  private loadSelectedTemplate(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const template = this.getTemplateById(stored);
      if (template) {
        this.selectedTemplateSubject.next(template);
      }
    }
  }
}

