import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { CvIcons, CvLabels } from 'src/app/core/models/cv-data.model';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.css']
})
export class CustomizeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private sub?: Subscription;
  iconOptionsBySection: Record<
    keyof CvIcons,
    Array<{ label: string; value: string }>
  > = {
    // Perfil
    profile: [
      { label: 'Persona', value: 'person' },
      { label: 'Perfil', value: 'account_circle' },
      { label: 'Credencial', value: 'badge' },
      { label: 'Contacto', value: 'contact_page' },
      { label: 'ID', value: 'assignment_ind' },
      { label: 'Verificado', value: 'verified_user' }
    ],

    // Experiencia
    workExperience: [
      { label: 'Trabajo', value: 'work' },
      { label: 'Portafolio', value: 'work_outline' },
      { label: 'Maletín', value: 'business_center' },
      { label: 'Empresa', value: 'domain' },
      { label: 'Historial', value: 'work_history' },
      { label: 'Casos', value: 'cases' }
    ],

    // Educación
    education: [
      { label: 'Escuela', value: 'school' },
      { label: 'Biblioteca', value: 'local_library' },
      { label: 'Diploma', value: 'workspace_premium' },
      { label: 'Historia', value: 'history_edu' },
      { label: 'Libros', value: 'auto_stories' }
    ],

    // Referencias
    references: [
      { label: 'Personas', value: 'groups' },
      { label: 'Usuarios', value: 'supervisor_account' },
      { label: 'Recomendación', value: 'recommend' },
      { label: 'Manos', value: 'handshake' },
      { label: 'Contacto', value: 'contact_mail' }
    ],

    // Idiomas
    languages: [
      { label: 'Traducir', value: 'translate' },
      { label: 'Idioma', value: 'language' },
      { label: 'Mundo', value: 'public' },
      { label: 'Voz', value: 'record_voice_over' }
    ],

    // Habilidades
    skills: [
      { label: 'Habilidades', value: 'psychology' },
      { label: 'Herramientas', value: 'build' },
      { label: 'Ingeniería', value: 'engineering' },
      { label: 'Estrella', value: 'star' },
      { label: 'Checklist', value: 'checklist' },
      { label: 'Auto-fix', value: 'auto_fix_high' }
    ],

    // Cursos
    courses: [
      { label: 'Libro', value: 'menu_book' },
      { label: 'Cursos', value: 'library_books' },
      { label: 'Biblioteca', value: 'local_library' },
      { label: 'Historias', value: 'auto_stories' },
      { label: 'Libro abierto', value: 'import_contacts' }
    ],

    // Proyectos
    projects: [
      { label: 'Carpeta', value: 'folder' },
      { label: 'Carpeta abierta', value: 'folder_open' },
      { label: 'Código', value: 'code' },
      { label: 'Terminal', value: 'terminal' },
      { label: 'Laptop', value: 'laptop_mac' },
      { label: 'Construcción', value: 'construction' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private cvDataService: CvDataService
  ) {}

  ngOnInit(): void {
    const data = this.cvDataService.getCvData();
    const labels = data.labels;
    const icons = data.icons;
    this.form = this.fb.group({
      // Section titles
      sectionProfile: [labels.sectionProfile, [Validators.required, Validators.maxLength(40)]],
      sectionWorkExperience: [labels.sectionWorkExperience, [Validators.required, Validators.maxLength(40)]],
      sectionEducation: [labels.sectionEducation, [Validators.required, Validators.maxLength(40)]],
      sectionReferences: [labels.sectionReferences, [Validators.required, Validators.maxLength(40)]],

      // Sidebar titles
      sectionLanguages: [labels.sectionLanguages, [Validators.required, Validators.maxLength(40)]],
      sectionSkills: [labels.sectionSkills, [Validators.required, Validators.maxLength(40)]],
      sectionCourses: [labels.sectionCourses, [Validators.required, Validators.maxLength(40)]],
      sectionProjects: [labels.sectionProjects, [Validators.required, Validators.maxLength(40)]],

      // Contact labels
      labelEmail: [labels.labelEmail, [Validators.required, Validators.maxLength(30)]],
      labelPhone: [labels.labelPhone, [Validators.required, Validators.maxLength(30)]],
      labelAddress: [labels.labelAddress, [Validators.required, Validators.maxLength(30)]],
      labelNationality: [labels.labelNationality, [Validators.required, Validators.maxLength(30)]],
      labelBirthDate: [labels.labelBirthDate, [Validators.required, Validators.maxLength(30)]],
      labelAge: [labels.labelAge, [Validators.required, Validators.maxLength(30)]],

      // Icons
      iconProfile: [icons.profile, [Validators.required, Validators.maxLength(40)]],
      iconWorkExperience: [icons.workExperience, [Validators.required, Validators.maxLength(40)]],
      iconEducation: [icons.education, [Validators.required, Validators.maxLength(40)]],
      iconReferences: [icons.references, [Validators.required, Validators.maxLength(40)]],
      iconLanguages: [icons.languages, [Validators.required, Validators.maxLength(40)]],
      iconSkills: [icons.skills, [Validators.required, Validators.maxLength(40)]],
      iconCourses: [icons.courses, [Validators.required, Validators.maxLength(40)]],
      iconProjects: [icons.projects, [Validators.required, Validators.maxLength(40)]]
    });

    // Si en otro lugar cambian labels (por storage/merge), reflejar en el form sin auto-guardar
    this.sub = this.cvDataService.cvData$.subscribe(d => {
      if (!this.form) return;
      this.form.patchValue(
        {
          ...d.labels,
          iconProfile: d.icons?.profile,
          iconWorkExperience: d.icons?.workExperience,
          iconEducation: d.icons?.education,
          iconReferences: d.icons?.references,
          iconLanguages: d.icons?.languages,
          iconSkills: d.icons?.skills,
          iconCourses: d.icons?.courses,
          iconProjects: d.icons?.projects
        },
        { emitEvent: false }
      );
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue() as any;
    const labels: CvLabels = {
      sectionProfile: raw.sectionProfile,
      sectionWorkExperience: raw.sectionWorkExperience,
      sectionEducation: raw.sectionEducation,
      sectionReferences: raw.sectionReferences,
      sectionLanguages: raw.sectionLanguages,
      sectionSkills: raw.sectionSkills,
      sectionCourses: raw.sectionCourses,
      sectionProjects: raw.sectionProjects,
      labelEmail: raw.labelEmail,
      labelPhone: raw.labelPhone,
      labelAddress: raw.labelAddress,
      labelNationality: raw.labelNationality,
      labelBirthDate: raw.labelBirthDate,
      labelAge: raw.labelAge
    };
    const icons: CvIcons = {
      profile: raw.iconProfile,
      workExperience: raw.iconWorkExperience,
      education: raw.iconEducation,
      references: raw.iconReferences,
      languages: raw.iconLanguages,
      skills: raw.iconSkills,
      courses: raw.iconCourses,
      projects: raw.iconProjects
    };
    this.cvDataService.setLabels(labels);
    this.cvDataService.setIcons(icons);
  }

  resetToDefault(): void {
    this.cvDataService.resetLabels();
    this.cvDataService.resetIcons();
  }
}


