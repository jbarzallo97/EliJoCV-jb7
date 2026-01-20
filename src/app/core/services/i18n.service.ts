import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export type AppLang = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly STORAGE_KEY = 'app_lang';
  readonly supported: Array<{ code: AppLang; label: string }> = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' }
  ];

  private langSubject = new BehaviorSubject<AppLang>('es');
  lang$ = this.langSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('es');
  }

  init(): void {
    const saved = (localStorage.getItem(this.STORAGE_KEY) || '').toLowerCase();
    const initial: AppLang = saved === 'en' ? 'en' : 'es';
    this.use(initial);
  }

  get current(): AppLang {
    return this.langSubject.value;
  }

  use(lang: AppLang): void {
    this.langSubject.next(lang);
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    try {
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  }

  t(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }
}

