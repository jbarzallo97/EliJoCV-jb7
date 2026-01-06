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
  ubicacion?: string;
  promedio?: string;
  descripcion?: string;
}

export interface Course {
  id: string;
  nombre: string;
  institucion?: string;
  fecha?: string; // YYYY-MM-DD (input type="date")
  url?: string;
  descripcion?: string;
}

export interface Skill {
  id: string;
  nombre: string;
  nivel: 'basico' | 'intermedio' | 'avanzado' | 'experto';
  categoria: 'tecnica' | 'blanda';
}

export interface Language {
  id: string;
  idioma: string;
  nivel: 'basico' | 'intermedio' | 'avanzado' | 'nativo';
}

export interface Project {
  id: string;
  nombre: string;
  descripcion?: string;
  tecnologias?: string[];
  url?: string;
  fecha?: string;
}

export interface CvData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  courses: Course[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
}

export interface Template {
  id: string;
  nombre: string;
  descripcion: string;
  preview: string;
  estilos: TemplateStyles;
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

