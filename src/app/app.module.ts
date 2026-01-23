import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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
import { TemplatesComponent } from './pages/templates/templates.component';
import { CustomizeComponent } from './pages/customize/customize.component';
import { AppIconComponent } from './shared/components/app-icon/app-icon.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CvPreviewComponent,
    SectionTabsComponent,
    HeaderComponent,
    AppIconComponent,
    PersonalInfoComponent,
    WorkExperienceComponent,
    SkillsComponent,
    LanguagesComponent,
    ProjectsComponent,
    EducationComponent,
    CoursesComponent,
    ReferencesComponent,
    TemplatesComponent,
    CustomizeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DragDropModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
