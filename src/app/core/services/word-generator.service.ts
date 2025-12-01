import { Injectable } from '@angular/core';
import { CvData } from '../models/cv-data.model';

@Injectable({
  providedIn: 'root'
})
export class WordGeneratorService {

  constructor() { }

  /**
   * Genera un documento Word (.docx) a partir de los datos del CV
   * TODO: Instalar docx y file-saver para implementar
   * npm install docx file-saver
   * npm install --save-dev @types/file-saver
   */
  async generateWordDocument(cvData: CvData, templateId?: string): Promise<void> {
    try {
      console.log('Generando documento Word...', cvData);
      // Implementación pendiente con librería docx
      alert('Funcionalidad de generación Word en desarrollo');
    } catch (error) {
      console.error('Error generando documento Word:', error);
      throw error;
    }
  }
}

