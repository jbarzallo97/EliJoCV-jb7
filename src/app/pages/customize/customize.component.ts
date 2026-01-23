import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CvDataService } from 'src/app/core/services/cv-data.service';
import { CvIcons, CvLabels, CvSectionId } from 'src/app/core/models/cv-data.model';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.css']
})
export class CustomizeComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private sub?: Subscription;
  mainSections: CvSectionId[] = [];
  sidebarSections: CvSectionId[] = [];

  readonly sectionMeta: Record<CvSectionId, { labelKey: string; controlName: string }> = {
    profile: { labelKey: 'customize.section.profile', controlName: 'iconProfile' },
    workExperience: { labelKey: 'customize.section.workExperience', controlName: 'iconWorkExperience' },
    education: { labelKey: 'customize.section.education', controlName: 'iconEducation' },
    references: { labelKey: 'customize.section.references', controlName: 'iconReferences' },
    languages: { labelKey: 'customize.section.languages', controlName: 'iconLanguages' },
    skills: { labelKey: 'customize.section.skills', controlName: 'iconSkills' },
    courses: { labelKey: 'customize.section.courses', controlName: 'iconCourses' },
    projects: { labelKey: 'customize.section.projects', controlName: 'iconProjects' }
  };
  iconOptionsBySection: Record<
    keyof CvIcons,
    Array<{ labelKey: string; value: string }>
  > = {
    // Perfil
    profile: [
      { labelKey: 'customize.iconOptions.profile.person', value: 'user' },
      { labelKey: 'customize.iconOptions.profile.badge', value: 'id-card' },
      { labelKey: 'customize.iconOptions.profile.verified_user', value: 'shield' }
    ],

    // Experiencia
    workExperience: [
      { labelKey: 'customize.iconOptions.workExperience.work', value: 'briefcase' },
      { labelKey: 'customize.iconOptions.workExperience.domain', value: 'building' },
      { labelKey: 'customize.iconOptions.workExperience.cases', value: 'case-file' }
    ],

    // Educación
    education: [
      { labelKey: 'customize.iconOptions.education.school', value: 'graduation' },
      { labelKey: 'customize.iconOptions.education.local_library', value: 'book' },
      { labelKey: 'customize.iconOptions.education.workspace_premium', value: 'certificate' }
    ],

    // Referencias
    references: [
      { labelKey: 'customize.iconOptions.references.groups', value: 'users' },
      { labelKey: 'customize.iconOptions.references.handshake', value: 'handshake' },
      { labelKey: 'customize.iconOptions.references.recommend', value: 'sparkles' },
      { labelKey: 'customize.iconOptions.references.contact_mail', value: 'id-card' }
    ],

    // Idiomas
    languages: [
      { labelKey: 'customize.iconOptions.languages.language', value: 'language' },
      { labelKey: 'customize.iconOptions.languages.public', value: 'globe' },
      { labelKey: 'customize.iconOptions.languages.record_voice_over', value: 'mic' }
    ],

    // Habilidades
    skills: [
      { labelKey: 'customize.iconOptions.skills.psychology', value: 'sparkles' },
      { labelKey: 'customize.iconOptions.skills.build', value: 'wrench' },
      { labelKey: 'customize.iconOptions.skills.checklist', value: 'checklist' }
    ],

    // Cursos
    courses: [
      { labelKey: 'customize.iconOptions.courses.menu_book', value: 'book' },
      { labelKey: 'customize.iconOptions.courses.import_contacts', value: 'certificate' },
      { labelKey: 'customize.iconOptions.courses.auto_stories', value: 'graduation' }
    ],

    // Proyectos
    projects: [
      { labelKey: 'customize.iconOptions.projects.folder', value: 'folder' },
      { labelKey: 'customize.iconOptions.projects.code', value: 'code' },
      { labelKey: 'customize.iconOptions.projects.terminal', value: 'terminal' },
      { labelKey: 'customize.iconOptions.projects.laptop_mac', value: 'laptop' }
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
    this.mainSections = [...(data.sectionLayout?.main || [])];
    this.sidebarSections = [...(data.sectionLayout?.sidebar || [])];
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
      if (d.sectionLayout) {
        this.mainSections = [...(d.sectionLayout.main || [])];
        this.sidebarSections = [...(d.sectionLayout.sidebar || [])];
      }
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
    // IMPORTANTE: capturar el orden actual ANTES de emitir setLabels/setIcons,
    // porque esos métodos disparan cvData$ y el subscribe puede rehidratar el layout anterior.
    const sectionLayout = {
      main: [...this.mainSections],
      sidebar: [...this.sidebarSections]
    };
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
    this.cvDataService.setSectionLayout(sectionLayout);
  }

  resetToDefault(): void {
    this.cvDataService.resetLabels();
    this.cvDataService.resetIcons();
    this.cvDataService.resetSectionLayout();
  }

  getSectionIcon(id: CvSectionId): string {
    if (!this.form) return '';
    const meta = this.sectionMeta[id];
    const v = this.form.get(meta.controlName)?.value;
    return typeof v === 'string' ? v : '';
  }

  dropSection(event: CdkDragDrop<CvSectionId[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}


