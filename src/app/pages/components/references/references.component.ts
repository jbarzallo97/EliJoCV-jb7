import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Reference } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-references',
  templateUrl: './references.component.html',
  styleUrls: ['./references.component.css']
})
export class ReferencesComponent implements OnInit {
  form!: FormGroup;
  references: Reference[] = [];
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.references = [...this.cvDataService.getCvData().references];
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      cargo: [''],
      empresa: [''],
      telefono: [''],
      email: [''],
      relacion: ['']
    });
  }

  addReference(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue() as Omit<Reference, 'id'>;
    const ref: Reference = {
      id: this.editingIndex != null ? this.references[this.editingIndex].id : this.generateId(),
      nombre: (v.nombre || '').trim(),
      cargo: (v.cargo || '').trim() || undefined,
      empresa: (v.empresa || '').trim() || undefined,
      telefono: (v.telefono || '').trim() || undefined,
      email: (v.email || '').trim() || undefined,
      relacion: (v.relacion || '').trim() || undefined
    };

    if (this.editingIndex != null) {
      this.references[this.editingIndex] = ref;
      this.editingIndex = null;
    } else {
      this.references.push(ref);
    }

    this.cvDataService.setReferences([...this.references]);

    this.form.reset({
      nombre: '',
      cargo: '',
      empresa: '',
      telefono: '',
      email: '',
      relacion: ''
    });
  }

  editReference(index: number): void {
    const r = this.references[index];
    this.editingIndex = index;
    this.form.reset({
      nombre: r.nombre || '',
      cargo: r.cargo || '',
      empresa: r.empresa || '',
      telefono: r.telefono || '',
      email: r.email || '',
      relacion: r.relacion || ''
    });
  }

  deleteReference(index: number): void {
    this.references.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        nombre: '',
        cargo: '',
        empresa: '',
        telefono: '',
        email: '',
        relacion: ''
      });
    }
    this.cvDataService.setReferences([...this.references]);
  }

  dropReference(event: CdkDragDrop<Reference[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.references, event.previousIndex, event.currentIndex);
    this.cvDataService.setReferences([...this.references]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
