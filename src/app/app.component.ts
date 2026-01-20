import { Component, OnInit } from '@angular/core';
import { I18nService } from './core/services/i18n.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EliJoCV-jb7';

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    this.i18n.init();
  }
}
