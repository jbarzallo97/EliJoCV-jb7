import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Template } from 'src/app/core/models/cv-data.model';
import { TemplateService } from 'src/app/core/services/template.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit, OnDestroy {
  selectedColor = '';
  selectedTemplateId = '';
  templates: Template[] = [];

  templateGallery: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    previewBase: string;
    previewHover: string;
    tags: string[];
    isDefault?: boolean;
  }> = [];
  private sub = new Subscription();

  // Paleta de acentos profesionales (CV)
  colors: Array<{ name: string; value: string; hint: string }> = [
    { name: 'Azul clásico', value: '#1976d2', hint: 'Formal y estándar' },
    { name: 'Navy', value: '#1e3a8a', hint: 'Ejecutivo' },
    { name: 'Slate', value: '#334155', hint: 'Sobrio' },
    { name: 'Teal', value: '#0f766e', hint: 'Moderno' },
    { name: 'Esmeralda', value: '#047857', hint: 'Cálido y profesional' },
    { name: 'Borgoña', value: '#7f1d1d', hint: 'Premium' },
    { name: 'Índigo', value: '#4f46e5', hint: 'Tech / producto' },
    { name: 'Grafito', value: '#111827', hint: 'Minimal' }
  ];

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.templates = this.templateService.getTemplates();
    this.selectedColor = this.templateService.getPrimaryColor();
    this.selectedTemplateId = this.templateService.getSelectedTemplate().id;

    const galleryMeta: Record<string, { previewBase: string; previewHover: string; tags: string[]; isDefault?: boolean }> = {
      'template-1': {
        previewBase: 'assets/image/plantillas/plantilla1-1.jpg',
        previewHover: 'assets/image/plantillas/plantilla1-2.jpg',
        tags: ['ATS', 'Por defecto'],
        isDefault: true
      },
      'template-2': {
        previewBase: 'assets/image/plantillas/plantilla2-1.png',
        previewHover: 'assets/image/plantillas/plantilla2-2.png',
        tags: ['Moderno', 'Nuevo']
      },
      'template-3': {
        previewBase: 'assets/image/plantillas/plantilla3-1.png',
        previewHover: 'assets/image/plantillas/plantilla3-2.png',
        tags: ['Minimalista', 'Nuevo']
      }
    };

    this.templateGallery = this.templates
      .filter(t => t.id in galleryMeta)
      .map(t => ({
        id: t.id,
        nombre: t.nombre,
        descripcion: t.descripcion,
        previewBase: galleryMeta[t.id].previewBase,
        previewHover: galleryMeta[t.id].previewHover,
        tags: galleryMeta[t.id].tags,
        isDefault: galleryMeta[t.id].isDefault
      }));

    this.sub.add(this.templateService.selectedPrimaryColor$.subscribe(c => {
      this.selectedColor = c;
    }));

    this.sub.add(this.templateService.selectedTemplate$.subscribe(t => {
      this.selectedTemplateId = t.id;
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  selectColor(value: string): void {
    this.templateService.setPrimaryColor(value);
  }

  selectTemplate(templateId: string): void {
    this.templateService.selectTemplate(templateId);
  }

  onHexChange(raw: string): void {
    const normalized = this.normalizeHex(raw);
    if (!normalized) return;
    this.selectColor(normalized);
  }

  trackByTemplateId(_: number, t: { id: string }): string {
    return t.id;
  }

  private normalizeHex(raw: string): string | null {
    const v = (raw || '').trim();
    if (!v) return null;
    const withHash = v.startsWith('#') ? v : `#${v}`;
    // #RGB o #RRGGBB
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(withHash)) return null;
    return withHash.toUpperCase();
  }
}


