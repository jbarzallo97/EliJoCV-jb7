import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';


@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
  form!: FormGroup;
  photoPreview: string | null = null;
  age: number | null = null;
  readonly resumenWordLimit = 80;
  readonly phoneMaxLen = 18;
  resumenWordCount = 0;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const personalInfo = this.cvDataService.getPersonalInfo();
    this.form = this.fb.group({
      nombres: [personalInfo.nombres || ''],
      apellidos: [personalInfo.apellidos || ''],
      nacionalidad: [personalInfo.nacionalidad || ''],
      fechaNacimiento: [personalInfo.fechaNacimiento || ''],
      puesto: [personalInfo.puesto || ''],
      email: [personalInfo.email || ''],
      celular: [personalInfo.celular || ''],
      ubicacion: [personalInfo.ubicacion || ''],
      resumenProfesional: [personalInfo.resumenProfesional || ''],
      foto: [personalInfo.foto || '']
    });

    if (personalInfo.foto) {
      this.photoPreview = personalInfo.foto;
    }

    this.age = this.getAgeFromBirthDate(this.form.get('fechaNacimiento')?.value);
    this.form.get('fechaNacimiento')?.valueChanges.subscribe((v) => {
      this.age = this.getAgeFromBirthDate(v);
    });

    const resumenCtrl = this.form.get('resumenProfesional');
    this.resumenWordCount = this.countWords(resumenCtrl?.value);
    resumenCtrl?.valueChanges.subscribe((v) => {
      const text = (v || '').toString();
      const words = this.extractWords(text);
      this.resumenWordCount = words.length;

      if (words.length > this.resumenWordLimit) {
        const truncated = words.slice(0, this.resumenWordLimit).join(' ');
        resumenCtrl.setValue(truncated, { emitEvent: false });
        this.resumenWordCount = this.resumenWordLimit;
        this.cvDataService.updatePersonalInfo({ resumenProfesional: truncated });
      }
    });

    this.form.valueChanges.subscribe(values => {
      this.cvDataService.updatePersonalInfo(values);
    });

    const phoneCtrl = this.form.get('celular');
    phoneCtrl?.valueChanges.subscribe((v) => {
      const s = (v ?? '').toString();
      if (s.length <= this.phoneMaxLen) return;
      phoneCtrl.setValue(s.slice(0, this.phoneMaxLen), { emitEvent: false });
    });
  }

  private extractWords(text: string): string[] {
    return (text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  private countWords(text?: string | null): number {
    return this.extractWords((text || '').toString()).length;
  }

  onResumenKeyDown(event: KeyboardEvent): void {
    const el = event.target as HTMLTextAreaElement | null;
    if (!el) return;

    // Permitir teclas de control/navegación/edición
    const allowedKeys = new Set([
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'Tab', 'Enter', 'Escape'
    ]);
    if (allowedKeys.has(event.key)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    // Si no es un caracter imprimible, no bloqueamos
    if (!event.key || event.key.length !== 1) return;

    const current = el.value ?? '';
    const next = this.applyInsertion(current, event.key, el.selectionStart ?? current.length, el.selectionEnd ?? current.length);

    if (this.extractWords(next).length > this.resumenWordLimit) {
      event.preventDefault();
    }
  }

  onResumenPaste(event: ClipboardEvent): void {
    const el = event.target as HTMLTextAreaElement | null;
    if (!el) return;

    const pasteText = event.clipboardData?.getData('text') ?? '';
    if (!pasteText) return;

    const current = el.value ?? '';
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = this.applyInsertion(current, pasteText, start, end);

    const words = this.extractWords(next);
    if (words.length <= this.resumenWordLimit) return; // pega normal

    // Si excede el límite, pegamos solo lo necesario hasta completar 80 palabras.
    event.preventDefault();

    const before = current.slice(0, start);
    const after = current.slice(end);

    const beforeWords = this.extractWords(before);
    const afterWords = this.extractWords(after);
    const remaining = Math.max(0, this.resumenWordLimit - beforeWords.length - afterWords.length);

    if (remaining <= 0) return;

    const pasteWords = this.extractWords(pasteText).slice(0, remaining);
    const insert = pasteWords.length ? (before.endsWith(' ') || before.length === 0 ? '' : ' ') + pasteWords.join(' ') : '';

    const finalText = (before + insert + (insert && after && !insert.endsWith(' ') ? ' ' : '') + after).replace(/\s+/g, ' ').trim();
    el.value = finalText;
    this.form.get('resumenProfesional')?.setValue(finalText);
  }

  private applyInsertion(current: string, inserted: string, start: number, end: number): string {
    return current.slice(0, start) + inserted + current.slice(end);
  }

  private getAgeFromBirthDate(dateStr?: string | null): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;

    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age >= 0 && age <= 120 ? age : null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona una imagen válida (JPG o PNG).');
        return;
      }

      // Máximo 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.photoPreview = e.target.result as string;
          this.form.patchValue({ foto: this.photoPreview });
          this.cvDataService.updatePersonalInfo({ foto: this.photoPreview });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.form.patchValue({ foto: '' });
    this.cvDataService.updatePersonalInfo({ foto: '' });
  }
}

