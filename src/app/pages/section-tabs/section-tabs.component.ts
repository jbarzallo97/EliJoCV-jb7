import { Component, EventEmitter, Output } from '@angular/core';
import { FormSection } from '../../core/models/cv-data.model';

@Component({
  selector: 'app-section-tabs',
  templateUrl: './section-tabs.component.html',
  styleUrls: ['./section-tabs.component.css']
})
export class SectionTabsComponent {
  @Output() sectionChange = new EventEmitter<FormSection>();

  activeSection: FormSection = 'personal';

  sections = [
    { id: 'personal' as FormSection, labelKey: 'sections.personalInfo', icon: 'person' },
    { id: 'trabajo' as FormSection, labelKey: 'sections.workExperience', icon: 'work' },
    { id: 'educacion' as FormSection, labelKey: 'sections.education', icon: 'school' },
    { id: 'cursos' as FormSection, labelKey: 'sections.courses', icon: 'library_books' },
    { id: 'habilidades' as FormSection, labelKey: 'sections.skills', icon: 'psychology' },
    { id: 'idiomas' as FormSection, labelKey: 'sections.languages', icon: 'translate' },
    { id: 'proyectos' as FormSection, labelKey: 'sections.projects', icon: 'folder' },
    { id: 'referencias' as FormSection, labelKey: 'sections.references', icon: 'groups' }
  ];

  selectSection(section: FormSection): void {
    this.activeSection = section;
    this.sectionChange.emit(section);
  }
}
