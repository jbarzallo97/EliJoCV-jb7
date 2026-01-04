import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Project } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  form!: FormGroup;
  projectsArray!: FormArray;

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const projects = this.cvDataService.getCvData().projects;

    this.form = this.fb.group({
      projects: this.fb.array([])
    });

    this.projectsArray = this.form.get('projects') as FormArray;

    if (projects.length === 0) {
      this.addProject();
    } else {
      projects.forEach(project => this.addProject(project));
    }

    this.form.valueChanges.subscribe(() => {
      this.saveProjects();
    });
  }

  createProjectForm(project?: Project): FormGroup {
    return this.fb.group({
      id: [project?.id || this.generateId()],
      nombre: [project?.nombre || '', Validators.required],
      fecha: [project?.fecha || ''],
      url: [project?.url || ''],
      tecnologiasText: [(project?.tecnologias || []).join(', ')],
      descripcion: [project?.descripcion || '']
    });
  }

  addProject(project?: Project): void {
    this.projectsArray.push(this.createProjectForm(project));
  }

  removeProject(index: number): void {
    this.projectsArray.removeAt(index);
    if (this.projectsArray.length === 0) {
      this.addProject();
    }
    this.saveProjects();
  }

  private saveProjects(): void {
    const projects = (this.projectsArray.value as Array<Project & { tecnologiasText?: string }>)
      .map(p => {
        const tecnologias = (p.tecnologiasText || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        const cleaned: Project = {
          id: p.id,
          nombre: (p.nombre || '').trim(),
          fecha: (p.fecha || '').trim() || undefined,
          url: (p.url || '').trim() || undefined,
          descripcion: (p.descripcion || '').trim() || undefined,
          tecnologias: tecnologias.length ? tecnologias : undefined
        };

        return cleaned;
      })
      .filter(p => (p.nombre || '').trim().length > 0);

    this.cvDataService.setProjects(projects);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

