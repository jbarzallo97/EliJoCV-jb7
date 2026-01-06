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
    { id: 'personal' as FormSection, label: 'Información Personal', icon: 'person' },
    { id: 'trabajo' as FormSection, label: 'Experiencia Laboral', icon: 'work' },
    { id: 'educacion' as FormSection, label: 'Educación', icon: 'school' },
    { id: 'cursos' as FormSection, label: 'Cursos', icon: 'library_books' },
    { id: 'habilidades' as FormSection, label: 'Habilidades', icon: 'psychology' },
    { id: 'idiomas' as FormSection, label: 'Idiomas', icon: 'translate' },
    { id: 'proyectos' as FormSection, label: 'Proyectos', icon: 'folder' },
    { id: 'referencias' as FormSection, label: 'Referencias', icon: 'groups' }
  ];

  selectSection(section: FormSection): void {
    this.activeSection = section;
    this.sectionChange.emit(section);
  }
}
