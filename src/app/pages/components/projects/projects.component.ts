import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Project } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  form!: FormGroup;
  projects: Project[] = [];
  editingIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.projects = [...this.cvDataService.getCvData().projects];

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      fecha: [''],
      url: [''],
      tecnologiasText: [''],
      descripcion: ['']
    });
  }

  addProject(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as {
      nombre: string;
      fecha: string;
      url: string;
      tecnologiasText: string;
      descripcion: string;
    };

    const existing = this.editingIndex != null ? this.projects[this.editingIndex] : null;
    const tecnologias = (value.tecnologiasText || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const project: Project = {
      id: existing ? existing.id : this.generateId(),
      nombre: (value.nombre || '').trim(),
      fecha: (value.fecha || '').trim() || undefined,
      url: (value.url || '').trim() || undefined,
      descripcion: (value.descripcion || '').trim() || undefined,
      tecnologias: tecnologias.length ? tecnologias : undefined,
      visible: existing?.visible ?? true
    };

    if (this.editingIndex != null) {
      this.projects[this.editingIndex] = project;
      this.editingIndex = null;
    } else {
      this.projects.push(project);
    }

    this.cvDataService.setProjects([...this.projects]);

    this.form.reset({
      nombre: '',
      fecha: '',
      url: '',
      tecnologiasText: '',
      descripcion: ''
    });
  }

  editProject(index: number): void {
    const p = this.projects[index];
    this.editingIndex = index;
    this.form.reset({
      nombre: p.nombre || '',
      fecha: p.fecha || '',
      url: p.url || '',
      tecnologiasText: (p.tecnologias || []).join(', '),
      descripcion: p.descripcion || ''
    });
  }

  deleteProject(index: number): void {
    this.projects.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        nombre: '',
        fecha: '',
        url: '',
        tecnologiasText: '',
        descripcion: ''
      });
    }
    this.cvDataService.setProjects([...this.projects]);
  }

  dropProject(event: CdkDragDrop<Project[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.projects, event.previousIndex, event.currentIndex);
    this.cvDataService.setProjects([...this.projects]);
  }

  toggleProjectVisibility(index: number): void {
    const p = this.projects[index];
    if (!p) return;
    this.projects[index] = { ...p, visible: p.visible === false ? true : false };
    this.cvDataService.setProjects([...this.projects]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

