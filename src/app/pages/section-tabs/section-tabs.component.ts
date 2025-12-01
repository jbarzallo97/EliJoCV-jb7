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
    { id: 'habilidades' as FormSection, label: 'Habilidades', icon: 'bar_chart' },
    { id: 'idiomas' as FormSection, label: 'Idiomas', icon: 'language' },
    { id: 'proyectos' as FormSection, label: 'Proyectos', icon: 'folder' }
  ];

  selectSection(section: FormSection): void {
    this.activeSection = section;
    this.sectionChange.emit(section);
  }
}
