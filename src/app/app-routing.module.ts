import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionTabsComponent } from './pages/section-tabs/section-tabs.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { CustomizeComponent } from './pages/customize/customize.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'data' },
  { path: 'data', component: SectionTabsComponent },
  { path: 'templates', component: TemplatesComponent },
  { path: 'customize', component: CustomizeComponent },
  { path: '**', redirectTo: 'data' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
