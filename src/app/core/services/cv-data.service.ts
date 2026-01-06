import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CvData, PersonalInfo, WorkExperience, Education, Skill, Language, Project } from '../models/cv-data.model';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private readonly STORAGE_KEY = 'cv_data';

  private cvDataSubject = new BehaviorSubject<CvData>(this.getInitialData());
  public cvData$: Observable<CvData> = this.cvDataSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.loadFromStorage();
  }

  private getInitialData(): CvData {
    return {
      personalInfo: {
        nombres: '',
        apellidos: '',
        nacionalidad: '',
        fechaNacimiento: '',
        puesto: '',
        email: '',
        celular: '',
        ubicacion: '',
        resumenProfesional: '',
        foto: ''
      },
      workExperience: [],
      education: [],
      skills: [],
      languages: [],
      projects: []
    };
  }

  // Personal Info
  updatePersonalInfo(info: Partial<PersonalInfo>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      personalInfo: { ...current.personalInfo, ...info }
    });
    this.saveToStorage();
  }

  getPersonalInfo(): PersonalInfo {
    return this.cvDataSubject.value.personalInfo;
  }

  // Work Experience
  addWorkExperience(experience: Omit<WorkExperience, 'id'>): void {
    const current = this.cvDataSubject.value;
    const newExperience: WorkExperience = {
      ...experience,
      id: this.generateId()
    };
    this.cvDataSubject.next({
      ...current,
      workExperience: [...current.workExperience, newExperience]
    });
    this.saveToStorage();
  }

  setWorkExperience(experiences: WorkExperience[]): void {
    // Drag&drop puede disparar fuera de NgZone: garantizamos emisión dentro de Angular
    // y clonamos el array para forzar nueva referencia.
    this.ngZone.run(() => {
      const current = this.cvDataSubject.value;
      this.cvDataSubject.next({
        ...current,
        workExperience: [...experiences]
      });
      this.saveToStorage();
    });
  }

  updateWorkExperience(id: string, experience: Partial<WorkExperience>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      workExperience: current.workExperience.map(exp =>
        exp.id === id ? { ...exp, ...experience } : exp
      )
    });
    this.saveToStorage();
  }

  removeWorkExperience(id: string): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      workExperience: current.workExperience.filter(exp => exp.id !== id)
    });
    this.saveToStorage();
  }

  // Education
  addEducation(education: Omit<Education, 'id'>): void {
    const current = this.cvDataSubject.value;
    const newEducation: Education = {
      ...education,
      id: this.generateId()
    };
    this.cvDataSubject.next({
      ...current,
      education: [...current.education, newEducation]
    });
    this.saveToStorage();
  }

  setEducation(education: Education[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      education
    });
    this.saveToStorage();
  }

  updateEducation(id: string, education: Partial<Education>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      education: current.education.map(edu =>
        edu.id === id ? { ...edu, ...education } : edu
      )
    });
    this.saveToStorage();
  }

  removeEducation(id: string): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      education: current.education.filter(edu => edu.id !== id)
    });
    this.saveToStorage();
  }

  // Skills
  addSkill(skill: Omit<Skill, 'id'>): void {
    const current = this.cvDataSubject.value;
    const newSkill: Skill = {
      ...skill,
      id: this.generateId()
    };
    this.cvDataSubject.next({
      ...current,
      skills: [...current.skills, newSkill]
    });
    this.saveToStorage();
  }

  setSkills(skills: Skill[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      skills
    });
    this.saveToStorage();
  }

  updateSkill(id: string, skill: Partial<Skill>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      skills: current.skills.map(s =>
        s.id === id ? { ...s, ...skill } : s
      )
    });
    this.saveToStorage();
  }

  removeSkill(id: string): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      skills: current.skills.filter(skill => skill.id !== id)
    });
    this.saveToStorage();
  }

  // Languages
  addLanguage(language: Omit<Language, 'id'>): void {
    const current = this.cvDataSubject.value;
    const newLanguage: Language = {
      ...language,
      id: this.generateId()
    };
    this.cvDataSubject.next({
      ...current,
      languages: [...current.languages, newLanguage]
    });
    this.saveToStorage();
  }

  setLanguages(languages: Language[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      languages
    });
    this.saveToStorage();
  }

  updateLanguage(id: string, language: Partial<Language>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      languages: current.languages.map(l =>
        l.id === id ? { ...l, ...language } : l
      )
    });
    this.saveToStorage();
  }

  removeLanguage(id: string): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      languages: current.languages.filter(lang => lang.id !== id)
    });
    this.saveToStorage();
  }

  // Projects
  addProject(project: Omit<Project, 'id'>): void {
    const current = this.cvDataSubject.value;
    const newProject: Project = {
      ...project,
      id: this.generateId()
    };
    this.cvDataSubject.next({
      ...current,
      projects: [...current.projects, newProject]
    });
    this.saveToStorage();
  }

  setProjects(projects: Project[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      projects
    });
    this.saveToStorage();
  }

  updateProject(id: string, project: Partial<Project>): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      projects: current.projects.map(p =>
        p.id === id ? { ...p, ...project } : p
      )
    });
    this.saveToStorage();
  }

  removeProject(id: string): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      projects: current.projects.filter(proj => proj.id !== id)
    });
    this.saveToStorage();
  }

  getCvData(): CvData {
    return this.cvDataSubject.value;
  }

  clearData(): void {
    this.cvDataSubject.next(this.getInitialData());
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cvDataSubject.value));
    } catch (error) {
      console.error('Error guardando datos:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.cvDataSubject.next(data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

