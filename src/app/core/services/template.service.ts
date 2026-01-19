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
  private readonly PAPER_COLOR_KEY = 'cv_paper_color';
  private readonly DEFAULT_PAPER_COLOR = '#ffffff';
  private readonly FONT_FAMILY_KEY = 'cv_font_family';
  private readonly FONT_SIZE_KEY = 'cv_font_size';
  private readonly DEFAULT_FONT_FAMILY = `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
  private readonly DEFAULT_FONT_SIZE_KEY = 'm';
  private readonly FONT_SIZE_PRESETS: Record<string, string> = {
    xxs: '10px',
    xs: '11px',
    s: '12px',
    m: '14px',
    l: '15px',
    xl: '16px'
  };

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
    },
    {
      id: 'template-4',
      nombre: 'Plantilla 4',
      descripcion: 'Sidebar izquierda + timeline moderno',
      preview: 'assets/image/plantillas/plantilla4-1.svg',
      estilos: {
        colorPrincipal: '#0f766e',
        colorSecundario: '#0f172a',
        fuenteTitulo: 'Montserrat',
        fuenteTexto: 'Inter',
        espaciado: 'normal'
      }
    },
    {
      id: 'template-5',
      nombre: 'Plantilla 5',
      descripcion: 'Header oscuro + dos columnas',
      preview: 'assets/image/plantillas/plantilla5-1.svg',
      estilos: {
        colorPrincipal: '#111827',
        colorSecundario: '#334155',
        fuenteTitulo: 'Montserrat',
        fuenteTexto: 'Inter',
        espaciado: 'normal'
      }
    },
    {
      id: 'template-6',
      nombre: 'Plantilla 6',
      descripcion: 'Timeline + sidebar limpio (placeholder SVG)',
      preview: 'assets/image/plantillas/plantilla6-1.svg',
      estilos: {
        colorPrincipal: '#4f46e5',
        colorSecundario: '#06b6d4',
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

  private selectedPaperColorSubject = new BehaviorSubject<string>(this.DEFAULT_PAPER_COLOR);
  public selectedPaperColor$: Observable<string> = this.selectedPaperColorSubject.asObservable();

  private selectedFontFamilySubject = new BehaviorSubject<string>(this.DEFAULT_FONT_FAMILY);
  public selectedFontFamily$: Observable<string> = this.selectedFontFamilySubject.asObservable();

  private selectedFontSizeSubject = new BehaviorSubject<string>(this.DEFAULT_FONT_SIZE_KEY);
  public selectedFontSize$: Observable<string> = this.selectedFontSizeSubject.asObservable();

  constructor() {
    this.loadSelectedTemplate();
    this.loadPrimaryColor();
    this.applyPrimaryColorToDom(this.selectedPrimaryColorSubject.value);
    this.loadPaperColor();
    this.applyPaperColorToDom(this.selectedPaperColorSubject.value);
    this.loadTypography();
    this.applyTypographyToDom(this.selectedFontFamilySubject.value, this.fontSizeKeyToPx(this.selectedFontSizeSubject.value));
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

  getPaperColor(): string {
    return this.selectedPaperColorSubject.value;
  }

  setPaperColor(color: string): void {
    if (!color) return;
    this.selectedPaperColorSubject.next(color);
    try {
      localStorage.setItem(this.PAPER_COLOR_KEY, color);
    } catch {
      // ignore
    }
    this.applyPaperColorToDom(color);
  }

  getFontFamily(): string {
    return this.selectedFontFamilySubject.value;
  }

  setFontFamily(fontFamily: string): void {
    if (!fontFamily) return;
    this.selectedFontFamilySubject.next(fontFamily);
    try {
      localStorage.setItem(this.FONT_FAMILY_KEY, fontFamily);
    } catch {
      // ignore
    }
    this.applyTypographyToDom(fontFamily, this.fontSizeKeyToPx(this.selectedFontSizeSubject.value));
  }

  getFontSize(): string {
    return this.selectedFontSizeSubject.value;
  }

  setFontSize(fontSize: string): void {
    const key = this.normalizeFontSizeKey(fontSize);
    if (!key) return;
    this.selectedFontSizeSubject.next(key);
    try {
      localStorage.setItem(this.FONT_SIZE_KEY, key);
    } catch {
      // ignore
    }
    this.applyTypographyToDom(this.selectedFontFamilySubject.value, this.fontSizeKeyToPx(key));
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

  private loadPaperColor(): void {
    try {
      const stored = localStorage.getItem(this.PAPER_COLOR_KEY);
      if (stored) {
        this.selectedPaperColorSubject.next(stored);
      }
    } catch {
      // ignore
    }
  }

  private loadTypography(): void {
    try {
      const storedFamily = localStorage.getItem(this.FONT_FAMILY_KEY);
      if (storedFamily) {
        this.selectedFontFamilySubject.next(storedFamily);
      }
    } catch {
      // ignore
    }

    try {
      const storedSize = localStorage.getItem(this.FONT_SIZE_KEY);
      if (storedSize) {
        const key = this.normalizeFontSizeKey(storedSize);
        if (key) this.selectedFontSizeSubject.next(key);
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

  private applyPaperColorToDom(color: string): void {
    try {
      document.documentElement.style.setProperty('--cv-paper', color);
    } catch {
      // ignore
    }
  }

  private applyTypographyToDom(fontFamily: string, fontSize: string): void {
    try {
      document.documentElement.style.setProperty('--cv-font-family', fontFamily);
      document.documentElement.style.setProperty('--cv-font-size', fontSize);
    } catch {
      // ignore
    }
  }

  private normalizeFontSizeKey(input: string): string | null {
    const v = (input || '').trim().toLowerCase();
    if (!v) return null;
    if (v in this.FONT_SIZE_PRESETS) return v;

    // Backwards-compat: si había un valor como "14px", lo mapeamos al preset más cercano
    const m = v.match(/^(\d+(?:\.\d+)?)px$/);
    if (m) {
      const px = Number(m[1]);
      if (!Number.isFinite(px)) return null;
      const entries = Object.entries(this.FONT_SIZE_PRESETS).map(([k, pxStr]) => [k, Number(pxStr.replace('px', ''))] as const);
      let bestKey = this.DEFAULT_FONT_SIZE_KEY;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const [k, p] of entries) {
        const d = Math.abs(p - px);
        if (d < bestDist) {
          bestDist = d;
          bestKey = k;
        }
      }
      return bestKey;
    }

    return null;
  }

  private fontSizeKeyToPx(key: string): string {
    return this.FONT_SIZE_PRESETS[key] || this.FONT_SIZE_PRESETS[this.DEFAULT_FONT_SIZE_KEY];
  }
}

