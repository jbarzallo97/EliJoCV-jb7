import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CvData, CvIcons, CvLabels, CvSectionId, CvSectionLayout, PersonalInfo, WorkExperience, Education, Course, Skill, Language, Project, Reference } from '../models/cv-data.model';
import { I18nService, AppLang } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class CvDataService {
  private readonly STORAGE_KEY = 'cv_data';

  private cvDataSubject = new BehaviorSubject<CvData>(this.getInitialData());
  public cvData$: Observable<CvData> = this.cvDataSubject.asObservable();

  constructor(private ngZone: NgZone, private i18n: I18nService) {
    this.loadFromStorage();

    // Si los labels están en modo auto, siguen el idioma de la app.
    this.i18n.lang$.subscribe(lang => {
      const current = this.cvDataSubject.value;
      if ((current.labelsMode || 'auto') === 'auto') {
        this.cvDataSubject.next({
          ...current,
          labels: this.getDefaultLabels(lang),
          labelsMode: 'auto'
        });
        this.saveToStorage();
      }
    });
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
      courses: [],
      skills: [],
      languages: [],
      projects: [],
      references: [],
      labels: this.getDefaultLabels(this.i18n.current),
      labelsMode: 'auto',
      icons: this.getDefaultIcons(),
      sectionLayout: this.getDefaultSectionLayout()
    };
  }

  private getDefaultLabels(lang: AppLang): CvLabels {
    if (lang === 'en') {
      return {
        sectionProfile: 'Profile',
        sectionWorkExperience: 'Work experience',
        sectionEducation: 'Education',
        sectionReferences: 'References',
        sectionLanguages: 'Languages',
        sectionSkills: 'Skills',
        sectionCourses: 'Courses',
        sectionProjects: 'Projects',
        labelEmail: 'Email',
        labelPhone: 'Phone',
        labelAddress: 'Address',
        labelNationality: 'Nationality',
        labelBirthDate: 'Birth date',
        labelAge: 'Age'
      };
    }
    return {
      sectionProfile: 'Perfil',
      sectionWorkExperience: 'Experiencia profesional',
      sectionEducation: 'Educación',
      sectionReferences: 'Referencias',
      sectionLanguages: 'Idiomas',
      sectionSkills: 'Habilidades',
      sectionCourses: 'Cursos',
      sectionProjects: 'Proyectos',
      labelEmail: 'Email',
      labelPhone: 'Número de teléfono',
      labelAddress: 'Dirección',
      labelNationality: 'Nacionalidad',
      labelBirthDate: 'Fecha de nacimiento',
      labelAge: 'Edad'
    };
  }

  private getDefaultIcons(): CvIcons {
    return {
      profile: 'person',
      workExperience: 'work',
      education: 'school',
      references: 'groups',
      languages: 'translate',
      skills: 'psychology',
      courses: 'menu_book',
      projects: 'folder'
    };
  }

  private getDefaultSectionLayout(): CvSectionLayout {
    return {
      main: ['profile', 'workExperience', 'education', 'references'],
      sidebar: ['languages', 'skills', 'courses', 'projects']
    };
  }

  private sanitizeSectionLayout(layout: CvSectionLayout | null | undefined): CvSectionLayout {
    const defaults = this.getDefaultSectionLayout();
    const all: CvSectionId[] = [
      'profile',
      'workExperience',
      'education',
      'references',
      'languages',
      'skills',
      'courses',
      'projects'
    ];

    const main = Array.isArray(layout?.main) ? (layout!.main as CvSectionId[]) : [];
    const sidebar = Array.isArray(layout?.sidebar) ? (layout!.sidebar as CvSectionId[]) : [];
    const seen = new Set<CvSectionId>();

    const cleanMain: CvSectionId[] = [];
    const cleanSidebar: CvSectionId[] = [];

    for (const id of main) {
      if (all.includes(id) && !seen.has(id)) {
        seen.add(id);
        cleanMain.push(id);
      }
    }

    for (const id of sidebar) {
      if (all.includes(id) && !seen.has(id)) {
        seen.add(id);
        cleanSidebar.push(id);
      }
    }

    // Completar faltantes en el mismo orden default (prioridad: main primero, luego sidebar)
    for (const id of defaults.main) {
      if (!seen.has(id)) {
        seen.add(id);
        cleanMain.push(id);
      }
    }
    for (const id of defaults.sidebar) {
      if (!seen.has(id)) {
        seen.add(id);
        cleanSidebar.push(id);
      }
    }

    // Si aún faltara algo (por cambios futuros), completar con la lista total
    for (const id of all) {
      if (!seen.has(id)) {
        seen.add(id);
        cleanSidebar.push(id);
      }
    }

    return { main: cleanMain, sidebar: cleanSidebar };
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

  // Courses
  setCourses(courses: Course[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      courses
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

  // References
  setReferences(references: Reference[]): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      references
    });
    this.saveToStorage();
  }

  // Labels (Customize)
  setLabels(labels: CvLabels): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      labels: { ...labels },
      labelsMode: 'custom'
    });
    this.saveToStorage();
  }

  resetLabels(): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      labels: this.getDefaultLabels(this.i18n.current),
      labelsMode: 'auto'
    });
    this.saveToStorage();
  }

  // Icons (Customize)
  setIcons(icons: CvIcons): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      icons: { ...icons }
    });
    this.saveToStorage();
  }

  resetIcons(): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      icons: this.getDefaultIcons()
    });
    this.saveToStorage();
  }

  // Section layout (Customize)
  setSectionLayout(layout: CvSectionLayout): void {
    const current = this.cvDataSubject.value;
    const sanitized = this.sanitizeSectionLayout(layout);
    this.cvDataSubject.next({
      ...current,
      sectionLayout: sanitized
    });
    this.saveToStorage();
  }

  resetSectionLayout(): void {
    const current = this.cvDataSubject.value;
    this.cvDataSubject.next({
      ...current,
      sectionLayout: this.getDefaultSectionLayout()
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
        const initial = this.getInitialData();
        const merged: CvData = {
          ...initial,
          ...data,
          personalInfo: {
            ...initial.personalInfo,
            ...(data?.personalInfo || {})
          },
          workExperience: Array.isArray(data?.workExperience) ? data.workExperience : [],
          education: Array.isArray(data?.education) ? data.education : [],
          courses: Array.isArray(data?.courses) ? data.courses : [],
          skills: Array.isArray(data?.skills) ? data.skills : [],
          languages: Array.isArray(data?.languages) ? data.languages : [],
          projects: Array.isArray(data?.projects) ? data.projects : [],
          references: Array.isArray(data?.references) ? data.references : [],
          labels: {
            ...initial.labels,
            ...(data?.labels || {})
          },
          labelsMode: (data?.labelsMode === 'custom' ? 'custom' : 'auto'),
          icons: {
            ...initial.icons,
            ...(data?.icons || {})
          },
          sectionLayout: this.sanitizeSectionLayout(data?.sectionLayout)
        };
        // Si viene en auto, forzar labels del idioma actual
        if ((merged.labelsMode || 'auto') === 'auto') {
          merged.labels = this.getDefaultLabels(this.i18n.current);
        }
        this.cvDataSubject.next(merged);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

