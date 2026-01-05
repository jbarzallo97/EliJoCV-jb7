import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { WorkExperience } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-work-experience',
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.css']
})
export class WorkExperienceComponent implements OnInit {
  form!: FormGroup;
  experiences: WorkExperience[] = [];
  editingIndex: number | null = null;
  currentJobError: string | null = null;
  autoSortByDate = false;
  private manualOrderBackup: WorkExperience[] | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.experiences = [...this.cvDataService.getCvData().workExperience];

    this.form = this.fb.group({
      empresa: ['', Validators.required],
      puesto: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      actualmenteTrabajando: [false],
      descripcion: ['']
    });

    // Toggle fecha fin
    this.form.get('actualmenteTrabajando')?.valueChanges.subscribe((checked: boolean) => {
      this.currentJobError = null;
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

  addExperience(): void {
    this.currentJobError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const exp: WorkExperience = {
      id: this.editingIndex != null ? this.experiences[this.editingIndex].id : this.generateId(),
      empresa: (value.empresa || '').trim(),
      puesto: (value.puesto || '').trim(),
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin || '',
      actualmenteTrabajando: !!value.actualmenteTrabajando,
      descripcion: (value.descripcion || '').trim()
    };

    // Regla: puede haber 0 o 1 experiencia marcada como "actualmente trabajando"
    if (exp.actualmenteTrabajando) {
      const otherCurrent = this.experiences.some(e => e.actualmenteTrabajando && e.id !== exp.id);
      if (otherCurrent) {
        this.currentJobError = 'No puedes marcar 2 experiencias como "Actualmente trabajando aquí". Desmarca la otra experiencia primero.';
        return;
      }
      exp.fechaFin = '';
    }

    if (this.editingIndex != null) {
      this.experiences[this.editingIndex] = exp;
      this.editingIndex = null;
    } else {
      this.experiences.push(exp);
    }

    this.applyAutoSortIfEnabled();
    this.cvDataService.setWorkExperience([...this.experiences]);
    this.form.reset({
      empresa: '',
      puesto: '',
      fechaInicio: '',
      fechaFin: '',
      actualmenteTrabajando: false,
      descripcion: ''
    });
  }

  editExperience(index: number): void {
    const exp = this.experiences[index];
    this.currentJobError = null;
    this.editingIndex = index;
    this.form.reset({
      empresa: exp.empresa || '',
      puesto: exp.puesto || '',
      fechaInicio: exp.fechaInicio || '',
      fechaFin: exp.fechaFin || '',
      actualmenteTrabajando: !!exp.actualmenteTrabajando,
      descripcion: exp.descripcion || ''
    });
  }

  deleteExperience(index: number): void {
    const exp = this.experiences[index];
    this.experiences.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.currentJobError = null;
      this.form.reset({
        empresa: '',
        puesto: '',
        fechaInicio: '',
        fechaFin: '',
        actualmenteTrabajando: false,
        descripcion: ''
      });
    }
    if (exp?.id) {
      this.cvDataService.removeWorkExperience(exp.id);
    } else {
      this.cvDataService.setWorkExperience(this.experiences);
    }
    // Mantener orden si está activado
    if (this.autoSortByDate) {
      this.applyAutoSortIfEnabled();
      this.cvDataService.setWorkExperience([...this.experiences]);
    }
  }

  dropExperience(event: CdkDragDrop<WorkExperience[]>): void {
    if (this.autoSortByDate) return;
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.experiences, event.previousIndex, event.currentIndex);

    // Mantener coherente el índice de edición
    if (this.editingIndex != null) {
      if (this.editingIndex === event.previousIndex) {
        this.editingIndex = event.currentIndex;
      } else if (
        event.previousIndex < this.editingIndex &&
        this.editingIndex <= event.currentIndex
      ) {
        this.editingIndex -= 1;
      } else if (
        event.currentIndex <= this.editingIndex &&
        this.editingIndex < event.previousIndex
      ) {
        this.editingIndex += 1;
      }
    }

    this.cvDataService.setWorkExperience(this.experiences);
  }

  toggleAutoSortByDate(enabled: boolean): void {
    this.autoSortByDate = enabled;
    if (enabled) {
      // Guardar orden manual actual para poder restaurarlo
      this.manualOrderBackup = [...this.experiences];
      this.applyAutoSortIfEnabled();
      this.cvDataService.setWorkExperience([...this.experiences]);
    } else {
      // Restaurar orden manual (si existe)
      if (this.manualOrderBackup) {
        this.experiences = [...this.manualOrderBackup];
        this.manualOrderBackup = null;
        this.cvDataService.setWorkExperience([...this.experiences]);
      }
    }
  }

  private applyAutoSortIfEnabled(): void {
    if (!this.autoSortByDate) return;
    this.experiences.sort((a, b) => {
      // Primero los actuales
      const aCur = !!a.actualmenteTrabajando;
      const bCur = !!b.actualmenteTrabajando;
      if (aCur !== bCur) return aCur ? -1 : 1;

      // Luego por fecha "más reciente" (fechaFin si existe, si no fechaInicio)
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
}

