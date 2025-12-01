import { Component, OnInit } from '@angular/core';
import { CvDataService } from '../../core/services/cv-data.service';
import { CvData } from '../../core/models/cv-data.model';
import { WordGeneratorService } from '../../core/services/word-generator.service';

@Component({
  selector: 'app-cv-preview',
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.css']
})
export class CvPreviewComponent implements OnInit {
  cvData!: CvData;

  constructor(
    private cvDataService: CvDataService,
    private wordGeneratorService: WordGeneratorService
  ) {}

  ngOnInit(): void {
    this.cvDataService.cvData$.subscribe(data => {
      this.cvData = data;
    });
  }

  downloadCV(): void {
    this.wordGeneratorService.generateWordDocument(this.cvData);
  }

  hasData(): boolean {
    const { personalInfo, workExperience, education, skills, languages, projects } = this.cvData;
    return !!(
      personalInfo.nombres || 
      personalInfo.apellidos || 
      workExperience.length > 0 || 
      education.length > 0 ||
      skills.length > 0 ||
      languages.length > 0 ||
      projects.length > 0
    );
  }
}
