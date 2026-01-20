// Modelos e interfaces para los datos del CV

export interface PersonalInfo {
  nombres: string;
  apellidos: string;
  nacionalidad?: string;
  fechaNacimiento?: string;
  puesto?: string;
  email?: string;
  celular?: string;
  ubicacion?: string;
  resumenProfesional?: string;
  foto?: string;
}

export interface WorkExperience {
  id: string;
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin?: string;
  actualmenteTrabajando: boolean;
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
  descripcion?: string;
  logros?: string[];
}

export interface Education {
  id: string;
  institucion: string;
  titulo: string;
  fechaInicio: string;
  fechaFin?: string;
  enCurso: boolean;
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
  ubicacion?: string;
  promedio?: string;
  descripcion?: string;
}

export interface Course {
  id: string;
  nombre: string;
  institucion?: string;
  fecha?: string; // Texto libre (ej: "2025", "Ene 2025", "2023-2024")
  url?: string;
  descripcion?: string;
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
}

export interface Skill {
  id: string;
  nombre: string;
  nivel: 'basico' | 'intermedio' | 'avanzado' | 'experto';
  categoria: 'tecnica' | 'blanda';
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
}

export interface Language {
  id: string;
  idioma: string;
  nivel: 'basico' | 'intermedio' | 'avanzado' | 'nativo';
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
}

export interface Project {
  id: string;
  nombre: string;
  descripcion?: string;
  tecnologias?: string[];
  url?: string;
  fecha?: string;
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
}

export interface Reference {
  id: string;
  nombre: string;
  cargo?: string;
  empresa?: string;
  telefono?: string;
  email?: string;
  relacion?: string;
  /**
   * Controla si el item se muestra en el preview.
   * Undefined se interpreta como visible (compatibilidad con datos guardados viejos).
   */
  visible?: boolean;
}

export type CvSectionId =
  | 'profile'
  | 'workExperience'
  | 'education'
  | 'references'
  | 'languages'
  | 'skills'
  | 'courses'
  | 'projects';

export interface CvSectionLayout {
  main: CvSectionId[];
  sidebar: CvSectionId[];
}

export interface CvData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  courses: Course[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  references: Reference[];
  labels: CvLabels;
  /**
   * 'auto': los labels siguen el idioma de la app.
   * 'custom': el usuario los editó en Personalizar y no se sobreescriben al cambiar idioma.
   */
  labelsMode?: 'auto' | 'custom';
  icons: CvIcons;
  sectionLayout: CvSectionLayout;
}

export interface CvIcons {
  // Main column
  profile: string;
  workExperience: string;
  education: string;
  references: string;

  // Sidebar
  languages: string;
  skills: string;
  courses: string;
  projects: string;
}

export interface Template {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  estilos: TemplateStyles;
}

export interface CvLabels {
  // Section titles (main column)
  sectionProfile: string;
  sectionWorkExperience: string;
  sectionEducation: string;
  sectionReferences: string;

  // Sidebar titles
  sectionLanguages: string;
  sectionSkills: string;
  sectionCourses: string;
  sectionProjects: string;

  // Contact labels
  labelEmail: string;
  labelPhone: string;
  labelAddress: string;
  labelNationality: string;
  labelBirthDate: string;
  labelAge: string;
}

export interface TemplateStyles {
  colorPrincipal: string;
  colorSecundario: string;
  fuenteTitulo: string;
  fuenteTexto: string;
  espaciado: 'compacto' | 'normal' | 'amplio';
}

export type FormSection = 'personal' | 'trabajo' | 'educacion' | 'cursos' | 'habilidades' | 'idiomas' | 'proyectos' | 'referencias';
export type MainTab = 'datos' | 'plantillas' | 'personalizar';

