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
  selectedPaperColor = '#ffffff';
  selectedTemplateId = '';
  selectedFontFamily = '';
  selectedFontSize = 'm';
  fontQuery = '';
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
    { name: 'Grafito', value: '#111827', hint: 'Minimal' },
    { name: 'Azul petróleo', value: '#155e75', hint: 'Moderno y serio' },
    { name: 'Púrpura profundo', value: '#5b21b6', hint: 'Creativo (sobrio)' },
    { name: 'Ciruela', value: '#9d174d', hint: 'Marca personal (discreta)' },
    { name: 'Oro viejo', value: '#b45309', hint: 'Cálido y elegante' },
    // { name: 'Naranja', value: '#ea580c', hint: 'Dinámico' },
    { name: 'Oliva', value: '#3f6212', hint: 'Natural y sobrio' }
  ];

  // Fondo de hoja (sutiles y elegantes)
  paperColors: Array<{ name: string; value: string }> = [
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Marfil', value: '#fffaf0' },
    { name: 'Perla', value: '#f8fafc' },
    { name: 'Niebla', value: '#f3f4f6' },
    { name: 'Arena', value: '#faf5ef' },
    { name: 'Hielo', value: '#f1f5f9' }
  ];

  fontFamilies: Array<{ name: string; value: string }> = [
    {
      name: 'Inter',
      value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Montserrat',
      value: `'Montserrat', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Roboto (ATS)',
      value: `'Roboto', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Open Sans (ATS)',
      value: `'Open Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Manrope',
      value: `'Manrope', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'DM Sans',
      value: `'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Lato',
      value: `'Lato', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Source Sans 3',
      value: `'Source Sans 3', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Nunito',
      value: `'Nunito', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Hind (ATS)',
      value: `'Hind', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Fira Sans (ATS)',
      value: `'Fira Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Fira Sans Condensed',
      value: `'Fira Sans Condensed', 'Fira Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Space Grotesk',
      value: `'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Work Sans',
      value: `'Work Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Raleway',
      value: `'Raleway', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Bai Jamjuree',
      value: `'Bai Jamjuree', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Saira',
      value: `'Saira', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'IBM Plex Sans',
      value: `'IBM Plex Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'IBM Plex Serif',
      value: `'IBM Plex Serif', 'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'IBM Plex Mono',
      value: `'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
    },
    {
      name: 'Roboto Slab',
      value: `'Roboto Slab', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Merriweather',
      value: `'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Source Serif (Pro)',
      value: `'Source Serif 4', 'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Literata',
      value: `'Literata', 'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Zilla Slab',
      value: `'Zilla Slab', 'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Noto Sans (ATS)',
      value: `'Noto Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Noto Serif',
      value: `'Noto Serif', 'Merriweather', Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Sistema',
      value: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Serif (clásica)',
      value: `Georgia, 'Times New Roman', Times, serif`,
    },
    {
      name: 'Ubuntu',
      value: `'Ubuntu', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    },
    {
      name: 'Caveat Brush',
      value: `'Caveat Brush', cursive`,
    },
    {
      name: 'Pacifico',
      value: `'Pacifico', cursive`,
    },
    {
      name: 'Bungee',
      value: `'Bungee', system-ui, sans-serif`,
    }
  ];

  fontSizes: Array<{ label: string; value: string; hint: string }> = [
    { label: 'XXS', value: 'xxs', hint: 'Muy compacto' },
    { label: 'XS', value: 'xs', hint: 'Compacto' },
    { label: 'S', value: 's', hint: 'Un poco compacto' },
    { label: 'M', value: 'm', hint: 'Recomendado' },
    { label: 'L', value: 'l', hint: 'Más grande' },
    { label: 'XL', value: 'xl', hint: 'Grande' }
  ];

  get filteredFontFamilies(): Array<{ name: string; value: string }> {
    const q = (this.fontQuery || '').trim().toLowerCase();
    if (!q) return this.fontFamilies;
    return this.fontFamilies.filter(f => f.name.toLowerCase().includes(q));
  }

  get selectedFontSizeMeta(): { label: string; value: string; hint: string } | null {
    return this.fontSizes.find(s => s.value === this.selectedFontSize) || null;
  }

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.templates = this.templateService.getTemplates();
    this.selectedColor = this.templateService.getPrimaryColor();
    this.selectedPaperColor = this.templateService.getPaperColor();
    this.selectedFontFamily = this.templateService.getFontFamily();
    this.selectedFontSize = this.templateService.getFontSize();
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
      },
      'template-4': {
        previewBase: 'assets/image/plantillas/plantilla4-1.svg',
        previewHover: 'assets/image/plantillas/plantilla4-2.svg',
        tags: ['Sidebar izquierda', 'Nuevo']
      },
      'template-5': {
        previewBase: 'assets/image/plantillas/plantilla5-1.svg',
        previewHover: 'assets/image/plantillas/plantilla5-2.svg',
        tags: ['Dos columnas', 'Nuevo']
      },
      'template-6': {
        previewBase: 'assets/image/plantillas/plantilla6-1.svg',
        previewHover: 'assets/image/plantillas/plantilla6-2.svg',
        tags: ['Timeline', 'Nuevo']
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

    this.sub.add(this.templateService.selectedPaperColor$.subscribe(c => {
      this.selectedPaperColor = c;
    }));

    this.sub.add(this.templateService.selectedTemplate$.subscribe(t => {
      this.selectedTemplateId = t.id;
    }));

    this.sub.add(this.templateService.selectedFontFamily$.subscribe(f => {
      this.selectedFontFamily = f;
    }));

    this.sub.add(this.templateService.selectedFontSize$.subscribe(s => {
      this.selectedFontSize = s;
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  selectColor(value: string): void {
    this.templateService.setPrimaryColor(value);
  }

  selectPaperColor(value: string): void {
    this.templateService.setPaperColor(value);
  }

  selectFontFamily(value: string): void {
    this.templateService.setFontFamily(value);
  }

  selectFontSize(value: string): void {
    this.templateService.setFontSize(value);
  }

  selectTemplate(templateId: string): void {
    this.templateService.selectTemplate(templateId);
  }

  onHexChange(raw: string): void {
    const normalized = this.normalizeHex(raw);
    if (!normalized) return;
    this.selectColor(normalized);
  }

  onPaperHexChange(raw: string): void {
    const normalized = this.normalizeHex(raw);
    if (!normalized) return;
    this.selectPaperColor(normalized);
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


