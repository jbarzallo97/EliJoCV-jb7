import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { Skill } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  form!: FormGroup;
  skillsArray!: FormArray;

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
    const skills = this.cvDataService.getCvData().skills;

    this.form = this.fb.group({
      skills: this.fb.array([])
    });

    this.skillsArray = this.form.get('skills') as FormArray;

    if (skills.length === 0) {
      this.addSkill();
    } else {
      skills.forEach(skill => this.addSkill(skill));
    }

    this.form.valueChanges.subscribe(() => {
      this.saveSkills();
    });
  }

  createSkillForm(skill?: Skill): FormGroup {
    return this.fb.group({
      id: [skill?.id || this.generateId()],
      nombre: [skill?.nombre || '', Validators.required],
      nivel: [skill?.nivel || 'intermedio', Validators.required],
      categoria: [skill?.categoria || 'tecnica', Validators.required]
    });
  }

  addSkill(skill?: Skill): void {
    this.skillsArray.push(this.createSkillForm(skill));
  }

  removeSkill(index: number): void {
    this.skillsArray.removeAt(index);
    if (this.skillsArray.length === 0) {
      this.addSkill();
    }
    this.saveSkills();
  }

  private saveSkills(): void {
    const skills = (this.skillsArray.value as Skill[])
      .filter(skill => (skill.nombre || '').trim().length > 0);
    this.cvDataService.setSkills(skills);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

