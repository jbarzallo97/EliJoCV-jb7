import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TemplateService } from 'src/app/core/services/template.service';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit, OnDestroy {
  selectedColor = '';
  private sub?: Subscription;

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
    this.selectedColor = this.templateService.getPrimaryColor();
    this.sub = this.templateService.selectedPrimaryColor$.subscribe(c => {
      this.selectedColor = c;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  selectColor(value: string): void {
    this.templateService.setPrimaryColor(value);
  }

  onHexChange(raw: string): void {
    const normalized = this.normalizeHex(raw);
    if (!normalized) return;
    this.selectColor(normalized);
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


