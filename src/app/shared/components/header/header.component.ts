import { Component, EventEmitter, Output } from '@angular/core';
import { MainTab } from '../../../core/models/cv-data.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() tabChange = new EventEmitter<MainTab>();
  
  activeTab: MainTab = 'datos';
  currentLanguage = 'ES';

  tabs = [
    { id: 'datos' as MainTab, label: 'Datos', icon: 'person' },
    { id: 'plantillas' as MainTab, label: 'Plantillas', icon: 'description' },
    { id: 'personalizar' as MainTab, label: 'Personalizar', icon: 'settings' }
  ];

  languages = [
    { code: 'ES', name: 'Español' },
    { code: 'EN', name: 'English' }
  ];

  selectTab(tab: MainTab): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
  }
}

