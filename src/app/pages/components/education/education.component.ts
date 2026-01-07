import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Education } from 'src/app/core/models/cv-data.model';
import { CvDataService } from 'src/app/core/services/cv-data.service';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent implements OnInit {
  form!: FormGroup;
  educations: Education[] = [];
  editingIndex: number | null = null;
  currentStudyError: string | null = null;
  autoSortByDate = false;
  private manualOrderBackup: Education[] | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.educations = [...this.cvDataService.getCvData().education];

    this.form = this.fb.group({
      institucion: ['', Validators.required],
      titulo: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      enCurso: [false],
      ubicacion: [''],
      promedio: [''],
      descripcion: ['']
    });

    this.form.get('enCurso')?.valueChanges.subscribe((checked: boolean) => {
      this.currentStudyError = null;
      const fechaFin = this.form.get('fechaFin');
      if (!fechaFin) return;
      if (checked) {
        fechaFin.disable({ emitEvent: false });
        fechaFin.setValue('', { emitEvent: false });
      } else {
        fechaFin.enable({ emitEvent: false });
      }
    });
  }

  addEducation(): void {
    this.currentStudyError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.editingIndex != null ? this.educations[this.editingIndex] : null;
    const edu: Education = {
      id: existing ? existing.id : this.generateId(),
      institucion: (value.institucion || '').trim(),
      titulo: (value.titulo || '').trim(),
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin || '',
      enCurso: !!value.enCurso,
      visible: existing?.visible ?? true,
      ubicacion: (value.ubicacion || '').trim(),
      promedio: (value.promedio || '').trim(),
      descripcion: (value.descripcion || '').trim()
    };

    // Regla: puede haber 0 o 1 estudio marcado como "Actualmente estudiando"
    if (edu.enCurso) {
      const otherCurrent = this.educations.some(e => e.enCurso && e.id !== edu.id);
      if (otherCurrent) {
        this.currentStudyError = 'No puedes marcar 2 estudios como "Actualmente estudiando". Desmarca el otro primero.';
        return;
      }
      edu.fechaFin = '';
    }

    if (this.editingIndex != null) {
      this.educations[this.editingIndex] = edu;
      this.upsertBackup(edu);
      this.editingIndex = null;
    } else {
      this.educations.push(edu);
      this.upsertBackup(edu);
    }

    this.applyAutoSortIfEnabled();
    this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));

    this.form.reset({
      institucion: '',
      titulo: '',
      fechaInicio: '',
      fechaFin: '',
      enCurso: false,
      ubicacion: '',
      promedio: '',
      descripcion: ''
    });
  }

  editEducation(index: number): void {
    const edu = this.educations[index];
    this.currentStudyError = null;
    this.editingIndex = index;
    this.form.reset({
      institucion: edu.institucion || '',
      titulo: edu.titulo || '',
      fechaInicio: edu.fechaInicio || '',
      fechaFin: edu.fechaFin || '',
      enCurso: !!edu.enCurso,
      ubicacion: edu.ubicacion || '',
      promedio: edu.promedio || '',
      descripcion: edu.descripcion || ''
    });
  }

  deleteEducation(index: number): void {
    const edu = this.educations[index];
    this.educations.splice(index, 1);
    if (edu?.id) {
      this.removeFromBackup(edu.id);
    }
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.currentStudyError = null;
      this.form.reset({
        institucion: '',
        titulo: '',
        fechaInicio: '',
        fechaFin: '',
        enCurso: false,
        ubicacion: '',
        promedio: '',
        descripcion: ''
      });
    }

    if (edu?.id) {
      this.cvDataService.removeEducation(edu.id);
    } else {
      this.cvDataService.setEducation(this.educations);
    }

    if (this.autoSortByDate) {
      this.applyAutoSortIfEnabled();
      this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));
    }
  }

  dropEducation(event: CdkDragDrop<Education[]>): void {
    if (this.autoSortByDate) return;
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.educations, event.previousIndex, event.currentIndex);
    this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));
  }

  toggleEducationVisibility(index: number): void {
    const edu = this.educations[index];
    if (!edu) return;
    const updated: Education = { ...edu, visible: edu.visible === false ? true : false };
    this.educations[index] = updated;
    this.upsertBackup(updated);
    this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));
  }

  toggleAutoSortByDate(enabled: boolean): void {
    this.autoSortByDate = enabled;
    if (enabled) {
      this.manualOrderBackup = [...this.educations];
      this.applyAutoSortIfEnabled();
      this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));
    } else {
      if (this.manualOrderBackup) {
        this.educations = [...this.manualOrderBackup];
        this.manualOrderBackup = null;
        this.ngZone.run(() => this.cvDataService.setEducation([...this.educations]));
      }
    }
  }

  private applyAutoSortIfEnabled(): void {
    if (!this.autoSortByDate) return;
    this.educations.sort((a, b) => {
      // Primero los que están en curso
      const aCur = !!a.enCurso;
      const bCur = !!b.enCurso;
      if (aCur !== bCur) return aCur ? -1 : 1;
      const aDate = this.toTime(a.fechaFin || a.fechaInicio);
      const bDate = this.toTime(b.fechaFin || b.fechaInicio);
      return bDate - aDate;
    });
  }

  private toTime(dateStr?: string | null): number {
    if (!dateStr) return 0;
    const t = Date.parse(dateStr);
    return Number.isFinite(t) ? t : 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private upsertBackup(edu: Education): void {
    if (!this.manualOrderBackup) return;
    const idx = this.manualOrderBackup.findIndex(e => e.id === edu.id);
    if (idx >= 0) {
      this.manualOrderBackup[idx] = { ...this.manualOrderBackup[idx], ...edu };
    } else {
      this.manualOrderBackup.push(edu);
    }
  }

  private removeFromBackup(id: string): void {
    if (!this.manualOrderBackup) return;
    this.manualOrderBackup = this.manualOrderBackup.filter(e => e.id !== id);
  }
}


