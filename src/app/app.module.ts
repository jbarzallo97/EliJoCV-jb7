import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CvPreviewComponent } from './pages/cv-preview/cv-preview.component';
import { SectionTabsComponent } from './pages/section-tabs/section-tabs.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { WorkExperienceComponent } from './pages/components/work-experience/work-experience.component';
import { SkillsComponent } from './pages/components/skills/skills.component';
import { LanguagesComponent } from './pages/components/languages/languages.component';
import { ProjectsComponent } from './pages/components/projects/projects.component';
import { PersonalInfoComponent } from './pages/components/personal-info/personal-info.component';
import { EducationComponent } from './pages/components/education/education.component';
import { CoursesComponent } from './pages/components/courses/courses.component';
import { ReferencesComponent } from './pages/components/references/references.component';

@NgModule({
  declarations: [
    AppComponent,
    CvPreviewComponent,
    SectionTabsComponent,
    HeaderComponent,
    PersonalInfoComponent,
    WorkExperienceComponent,
    SkillsComponent,
    LanguagesComponent,
    ProjectsComponent,
    EducationComponent,
    CoursesComponent,
    ReferencesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    CommonModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
