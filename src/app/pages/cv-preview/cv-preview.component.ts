import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CvDataService } from '../../core/services/cv-data.service';
import { CvData } from '../../core/models/cv-data.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-cv-preview',
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.css']
})
export class CvPreviewComponent implements OnInit {
  cvData!: CvData;
  pages: number[] = [0];
  previewReady = true;

  @ViewChild('flowLeft') flowLeftRef!: ElementRef<HTMLElement>;
  @ViewChild('flowRight') flowRightRef!: ElementRef<HTMLElement>;
  @ViewChildren('pageLeft') pageLeftRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('pageRight') pageRightRefs!: QueryList<ElementRef<HTMLElement>>;

  private paginateRaf: number | null = null;
  private destroyed = false;

  constructor(
    private cvDataService: CvDataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cvDataService.cvData$.subscribe(data => {
      this.cvData = data;
      this.rebuildPreviewThenPaginate();
    });
  }

  ngAfterViewInit(): void {
    this.schedulePaginate();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.paginateRaf) {
      cancelAnimationFrame(this.paginateRaf);
      this.paginateRaf = null;
    }
  }

  async downloadCV(): Promise<void> {
    // Asegura que la paginación esté lista antes de capturar
    this.paginate();
    await new Promise(resolve => requestAnimationFrame(() => resolve(true)));

    const pageEls = Array.from(document.querySelectorAll('.cv-pages .a4-page')) as HTMLElement[];
    if (!pageEls.length) return;

    const body = document.body;
    body.classList.add('pdf-export');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidthMm = 210;
      const pageHeightMm = 297;

      for (let i = 0; i < pageEls.length; i++) {
        const pageEl = pageEls[i];

        // Aumentar scale mejora nitidez del PDF
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm);
      }

      const pi = this.cvData?.personalInfo;
      const name = [pi?.nombres, pi?.apellidos].filter(Boolean).join(' ').trim();
      pdf.save(name ? `CV - ${name}.pdf` : 'CV.pdf');
    } finally {
      body.classList.remove('pdf-export');
    }
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

  formatBulletLines(text?: string | null): string[] {
    if (!text) {
      return [];
    }
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => !!line)
      .map(line => line.replace(/^-+\s*/, ''));
  }

  trackById(_index: number, item: { id: string }): string {
    return item.id;
  }

  getAgeFromBirthDate(dateStr?: string | null): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;

    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age >= 0 && age <= 120 ? age : null;
  }

  private schedulePaginate(): void {
    if (this.destroyed) return;
    this.ngZone.runOutsideAngular(() => {
      if (this.paginateRaf) cancelAnimationFrame(this.paginateRaf);
      // Doble RAF: asegura que Angular termine de renderizar *ngFor antes de medir/mover nodos
      this.paginateRaf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.paginateRaf = null;
          if (this.destroyed) return;
          this.ngZone.run(() => this.paginate());
        });
      });
    });
  }

  private rebuildPreviewThenPaginate(): void {
    if (this.destroyed) return;
    // Fuerza a Angular a reconstruir el DOM del preview antes de paginar,
    // evitando que "desaparezcan" items al reordenar/editar.
    this.previewReady = false;
    this.cdr.detectChanges();

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.destroyed) return;
        this.ngZone.run(() => {
          this.previewReady = true;
          this.cdr.detectChanges();
          this.schedulePaginate();
        });
      });
    });
  }

  private paginate(): void {
    if (!this.flowLeftRef || !this.flowRightRef) return;
    if (!this.pageLeftRefs || !this.pageRightRefs) return;

    if (this.pages.length === 0) {
      this.pages = [0];
      this.cdr.detectChanges();
    }

    // 1) Reset: todo lo visible vuelve al flujo oculto
    this.resetPagesToFlow();

    // 2) Llenar páginas por columna, pero usando el alto REAL del contenido (incluye márgenes)
    const leftPagesNeeded = this.fillColumnFromFlow(
      this.flowLeftRef.nativeElement,
      (pageIndex) => this.getPageLeftEl(pageIndex)
    );

    const rightPagesNeeded = this.fillColumnFromFlow(
      this.flowRightRef.nativeElement,
      (pageIndex) => this.getPageRightEl(pageIndex)
    );

    // 3) Sincronizar cantidad de páginas (si una columna necesita más, se crean páginas vacías para la otra)
    const totalNeeded = Math.max(leftPagesNeeded, rightPagesNeeded, 1);
    if (this.pages.length !== totalNeeded) {
      this.pages = Array.from({ length: totalNeeded }, (_, i) => i);
      this.cdr.detectChanges();
    }
  }

  private resetPagesToFlow(): void {
    const flowLeft = this.flowLeftRef.nativeElement;
    const flowRight = this.flowRightRef.nativeElement;

    this.pageLeftRefs.toArray().forEach(ref => {
      const pageEl = ref.nativeElement;
      // Solo mover ELEMENTOS (Angular usa nodos comentario como anchors)
      while (pageEl.firstElementChild) {
        flowLeft.appendChild(pageEl.firstElementChild);
      }
      pageEl.innerHTML = '';
    });

    this.pageRightRefs.toArray().forEach(ref => {
      const pageEl = ref.nativeElement;
      while (pageEl.firstElementChild) {
        flowRight.appendChild(pageEl.firstElementChild);
      }
      pageEl.innerHTML = '';
    });

    // Reorden determinístico en el flujo izquierdo: Resumen(100) -> Experiencia(200) -> Educación(300)
    const reorderByKey = (container: HTMLElement) => {
      const els = Array.from(container.children);
      els
        .map((el, idx) => ({
          el,
          idx,
          key: Number((el as HTMLElement).dataset?.['key'] ?? Number.POSITIVE_INFINITY)
        }))
        .sort((a, b) => (a.key - b.key) || (a.idx - b.idx))
        .forEach(x => container.appendChild(x.el));
    };

    reorderByKey(flowLeft);
  }

  private fillColumnFromFlow(
    flowEl: HTMLElement,
    getPageEl: (pageIndex: number) => HTMLElement
  ): number {
    let pageIndex = 0;

    const ensurePage = (index: number) => {
      if (index < this.pages.length) return;
      this.pages = Array.from({ length: index + 1 }, (_, i) => i);
      this.cdr.detectChanges();
    };

    while (flowEl.firstElementChild) {
      const node = flowEl.firstElementChild as HTMLElement;

      ensurePage(pageIndex);
      const pageEl = getPageEl(pageIndex);
      const available = this.getAvailableHeightPx(pageEl);

      pageEl.appendChild(node);

      const used = this.measureUsedHeightPx(pageEl);
      if (used > available && pageEl.childElementCount > 1) {
        pageEl.removeChild(node);

        // Caso especial: Experiencia profesional se pagina por item.
        // Si el item que no cupo dejó el título solo al final de la página, movemos el título junto al item (sin repetirlo).
        const section = node.dataset?.['section'] || '';
        const role = node.dataset?.['role'] || '';
        if (section === 'workExperience' && role === 'item') {
          const last = pageEl.lastElementChild as HTMLElement | null;
          if (last?.dataset?.['section'] === 'workExperience' && last?.dataset?.['role'] === 'title') {
            pageEl.removeChild(last);
            pageIndex += 1;
            ensurePage(pageIndex);
            const nextPageEl = getPageEl(pageIndex);
            nextPageEl.appendChild(last);
            nextPageEl.appendChild(node);
            continue;
          }
        }

        pageIndex += 1;
        ensurePage(pageIndex);
        getPageEl(pageIndex).appendChild(node);
      }
    }

    return Math.max(this.pages.length, pageIndex + 1);
  }

  private getPageLeftEl(pageIndex: number): HTMLElement {
    const arr = this.pageLeftRefs.toArray();
    const ref = arr[pageIndex];
    if (ref) return ref.nativeElement;
    this.pages = Array.from({ length: pageIndex + 1 }, (_, i) => i);
    this.cdr.detectChanges();
    return this.pageLeftRefs.toArray()[pageIndex].nativeElement;
  }

  private getPageRightEl(pageIndex: number): HTMLElement {
    const arr = this.pageRightRefs.toArray();
    const ref = arr[pageIndex];
    if (ref) return ref.nativeElement;
    this.pages = Array.from({ length: pageIndex + 1 }, (_, i) => i);
    this.cdr.detectChanges();
    return this.pageRightRefs.toArray()[pageIndex].nativeElement;
  }

  private getAvailableHeightPx(columnEl: HTMLElement): number {
    const inner = columnEl.closest('.a4-inner') as HTMLElement | null;
    if (!inner) return Number.POSITIVE_INFINITY;
    const innerRect = inner.getBoundingClientRect();
    const colRect = columnEl.getBoundingClientRect();
    return Math.max(0, innerRect.bottom - colRect.top);
  }

  private measureUsedHeightPx(columnEl: HTMLElement): number {
    const first = columnEl.firstElementChild as HTMLElement | null;
    const last = columnEl.lastElementChild as HTMLElement | null;
    if (!first || !last) return 0;

    const colRect = columnEl.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const styles = window.getComputedStyle(last);
    const marginBottom = parseFloat(styles.marginBottom || '0') || 0;
    return Math.max(0, (lastRect.bottom - colRect.top) + marginBottom);
  }
}
