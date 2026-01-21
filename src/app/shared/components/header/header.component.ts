import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MainTab } from '../../../core/models/cv-data.model';
import { filter, Subscription } from 'rxjs';
import { I18nService, AppLang } from '../../../core/services/i18n.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  activeTab: MainTab = 'datos';
  currentLang: AppLang = 'es';
  isDarkMode = false;
  private routerSub?: Subscription;

  tabs = [
    { id: 'datos' as MainTab, labelKey: 'nav.data', icon: 'person' },
    { id: 'plantillas' as MainTab, labelKey: 'nav.templates', icon: 'description' },
    { id: 'personalizar' as MainTab, labelKey: 'nav.customize', icon: 'settings' }
  ];

  languages = this.i18n.supported;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private i18n: I18nService,
    private pdfExport: PdfExportService
  ) {}

  ngOnInit(): void {
    this.currentLang = this.i18n.current;
    this.i18n.lang$.subscribe(l => (this.currentLang = l));
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.applyDarkMode(true);
    } else {
      this.isDarkMode = false;
      this.applyDarkMode(false);
    }

    // Sincronizar tab activo con la URL (back/forward/refresh)
    this.syncActiveTabFromUrl(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.syncActiveTabFromUrl(e.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  selectTab(tab: MainTab): void {
    const path = tab === 'datos'
      ? 'data'
      : tab === 'plantillas'
        ? 'templates'
        : 'customize';
    this.router.navigate(['/', path]);
  }

  private syncActiveTabFromUrl(url: string): void {
    const path = (url || '').split('?')[0].split('#')[0];
    const seg = (path.split('/').filter(Boolean)[0] || 'data').toLowerCase();
    if (seg === 'data') this.activeTab = 'datos';
    else if (seg === 'templates') this.activeTab = 'plantillas';
    else if (seg === 'customize') this.activeTab = 'personalizar';
    else this.activeTab = 'datos';
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

  setLanguage(lang: AppLang): void {
    this.i18n.use(lang);
  }

  downloadPdf(): void {
    this.pdfExport.requestDownload();
  }
}

