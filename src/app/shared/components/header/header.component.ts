import { Component, EventEmitter, Output, OnInit, Renderer2 } from '@angular/core';
import { MainTab } from '../../../core/models/cv-data.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() tabChange = new EventEmitter<MainTab>();

  activeTab: MainTab = 'datos';
  currentLanguage = 'ES';
  isDarkMode = false;

  tabs = [
    { id: 'datos' as MainTab, label: 'Datos', icon: 'person' },
    { id: 'plantillas' as MainTab, label: 'Plantillas', icon: 'description' },
    { id: 'personalizar' as MainTab, label: 'Personalizar', icon: 'settings' }
  ];

  languages = [
    { code: 'ES', name: 'Español' },
    { code: 'EN', name: 'English' }
  ];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.applyDarkMode(true);
    } else {
      this.isDarkMode = false;
      this.applyDarkMode(false);
    }
  }

  selectTab(tab: MainTab): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyDarkMode(this.isDarkMode);
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyDarkMode(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      this.renderer.addClass(body, 'dark-mode');
    } else {
      this.renderer.removeClass(body, 'dark-mode');
    }
  }
}

