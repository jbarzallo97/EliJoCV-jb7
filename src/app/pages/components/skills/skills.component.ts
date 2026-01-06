import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Skill } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  form!: FormGroup;
  skills: Skill[] = [];
  editingIndex: number | null = null;

  niveles = [
    { value: 'basico', label: 'Básico' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'experto', label: 'Experto' }
  ];

  categorias = [
    { value: 'tecnica', label: 'Técnica' },
    { value: 'blanda', label: 'Blanda' }
  ];

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    this.skills = [...this.cvDataService.getCvData().skills];

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      nivel: ['intermedio', Validators.required],
      categoria: ['tecnica', Validators.required]
    });
  }

  addSkill(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const skill: Skill = {
      id: this.editingIndex != null ? this.skills[this.editingIndex].id : this.generateId(),
      nombre: (value.nombre || '').trim(),
      nivel: value.nivel,
      categoria: value.categoria
    };

    if (this.editingIndex != null) {
      this.skills[this.editingIndex] = skill;
      this.editingIndex = null;
    } else {
      this.skills.push(skill);
    }

    this.cvDataService.setSkills([...this.skills]);

    this.form.reset({
      nombre: '',
      nivel: 'intermedio',
      categoria: 'tecnica'
    });
  }

  editSkill(index: number): void {
    const s = this.skills[index];
    this.editingIndex = index;
    this.form.reset({
      nombre: s.nombre || '',
      nivel: s.nivel || 'intermedio',
      categoria: s.categoria || 'tecnica'
    });
  }

  deleteSkill(index: number): void {
    this.skills.splice(index, 1);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.form.reset({
        nombre: '',
        nivel: 'intermedio',
        categoria: 'tecnica'
      });
    }
    this.cvDataService.setSkills([...this.skills]);
  }

  dropSkill(event: CdkDragDrop<Skill[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(this.skills, event.previousIndex, event.currentIndex);
    this.cvDataService.setSkills([...this.skills]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

