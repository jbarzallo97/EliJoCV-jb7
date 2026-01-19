import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CvDataService } from '../../core/services/cv-data.service';
import { CvData } from '../../core/models/cv-data.model';
import { TemplateService } from '../../core/services/template.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-cv-preview',
  templateUrl: './cv-preview.component.html',
  styleUrls: ['./cv-preview.component.css']
})
export class CvPreviewComponent implements OnInit {
  cvData!: CvData;
  selectedTemplateId = 'template-1';
  pages: number[] = [0];
  previewReady = true;
  isDownloading = false;
  private hasCvData = false;

  @ViewChild('flowTop') flowTopRef?: ElementRef<HTMLElement>;
  @ViewChild('flowLeft') flowLeftRef!: ElementRef<HTMLElement>;
  @ViewChild('flowRight') flowRightRef!: ElementRef<HTMLElement>;
  @ViewChildren('pageTop') pageTopRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('pageLeft') pageLeftRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('pageRight') pageRightRefs!: QueryList<ElementRef<HTMLElement>>;

  private paginateRaf: number | null = null;
  private destroyed = false;
  // Margen de seguridad para paginar un poco antes del borde inferior (en px)
  private readonly pageBottomReservePx =30;

  constructor(
    private cvDataService: CvDataService,
    private templateService: TemplateService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cvDataService.cvData$.subscribe(data => {
      this.cvData = data;
      this.hasCvData = true;
      this.rebuildPreviewThenPaginate();
    });

    this.templateService.selectedTemplate$.subscribe(t => {
      this.selectedTemplateId = t?.id || 'template-1';
      if (this.hasCvData) {
        this.rebuildPreviewThenPaginate();
      }
    });

    // Tipografía: al cambiar tamaño/fuente, recalcular paginación
    this.templateService.selectedFontFamily$.subscribe(() => {
      if (this.hasCvData) {
        this.rebuildPreviewThenPaginate();
      }
    });

    this.templateService.selectedFontSize$.subscribe(() => {
      if (this.hasCvData) {
        this.rebuildPreviewThenPaginate();
      }
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
    if (this.isDownloading) return;
    this.isDownloading = true;

    // Asegura que la paginación esté lista antes de capturar
    this.paginate();
    await new Promise(resolve => requestAnimationFrame(() => resolve(true)));

    const pageEls = Array.from(document.querySelectorAll('.cv-pages .a4-page')) as HTMLElement[];
    if (!pageEls.length) {
      this.isDownloading = false;
      return;
    }

    const body = document.body;
    body.classList.add('pdf-export');

    try {
      // Esperar a que el CSS de pdf-export aplique antes de medir/capturar (evita diferencias vs preview)
      await new Promise(resolve => requestAnimationFrame(() => resolve(true)));
      await new Promise(resolve => requestAnimationFrame(() => resolve(true)));

      // Esperar a que las fuentes estén listas (mejora nitidez en canvas)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = (document as any).fonts;
        if (fonts?.ready) {
          await fonts.ready;
        }
      } catch {
        // ignore
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidthMm = 210;
      const pageHeightMm = 297;

      // Calidad alta por defecto: scale 3 + PNG
      for (let i = 0; i < pageEls.length; i++) {
        const pageEl = pageEls[i];

        const cleanups = await this.applyPhotoExportFix(pageEl);
        try {
          const rect = pageEl.getBoundingClientRect();
          const capW = Math.round(rect.width);
          const capH = Math.round(rect.height);
          const bg = getComputedStyle(pageEl).backgroundColor || '#ffffff';
          const canvas = await html2canvas(pageEl, {
            scale: 3,
            backgroundColor: bg,
            useCORS: true,
            width: capW,
            height: capH
          });

          // PNG evita artefactos de compresión (JPEG suele verse "pixelado" en texto)
          const imgData = canvas.toDataURL('image/png');

          if (i > 0) pdf.addPage();
          // Forzar a ocupar toda el área A4 para que márgenes/ancho coincidan 1:1 con el preview
          pdf.addImage(imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm);
        } finally {
          cleanups.forEach(fn => fn());
        }
      }

      const pi = this.cvData?.personalInfo;
      const name = [pi?.nombres, pi?.apellidos].filter(Boolean).join(' ').trim();
      pdf.save(name ? `CV - ${name}.pdf` : 'CV.pdf');
    } finally {
      body.classList.remove('pdf-export');
      this.isDownloading = false;
    }
  }

  /**
   * html2canvas puede renderizar distinto `object-fit: cover` cuando la imagen no es cuadrada.
   * Para que el PDF se vea igual que el preview SIN perder nitidez, durante la exportación
   * reemplazamos temporalmente el <img> por una versión cuadrada recortada (cover) en alta resolución.
   */
  private async applyPhotoExportFix(root: HTMLElement): Promise<Array<() => void>> {
    const cleanups: Array<() => void> = [];
    const imgs = Array.from(root.querySelectorAll('.cv-photo-circle img.cv-photo-img')) as HTMLImageElement[];

    for (const img of imgs) {
      const src = img.currentSrc || img.src;
      if (!src) continue;

      const prevSrc = img.src;
      const prevSrcset = img.srcset;
      const prevObjFit = img.style.objectFit;
      const prevObjPos = img.style.objectPosition;

      // Genera un recorte cuadrado en alta resolución (evita pixelado)
      let newSrc: string | null = null;
      try {
        newSrc = await this.renderCoverSquareDataUrl(src, 1024);
      } catch {
        newSrc = null;
      }

      if (!newSrc) continue;

      img.src = newSrc;
      img.srcset = '';
      img.style.objectFit = 'cover';
      img.style.objectPosition = 'center';

      // Asegura que el navegador decodifique la nueva imagen antes de capturar
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = (img as any).decode;
        if (typeof d === 'function') {
          await d.call(img);
        }
      } catch {
        // ignore
      }

      cleanups.push(() => {
        img.src = prevSrc;
        img.srcset = prevSrcset;
        img.style.objectFit = prevObjFit;
        img.style.objectPosition = prevObjPos;
      });
    }

    return cleanups;
  }

  private async renderCoverSquareDataUrl(src: string, size: number): Promise<string | null> {
    try {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = src;

      // decode() es más confiable que onload para algunos casos
      if (typeof (image as any).decode === 'function') {
        try {
          await (image as any).decode();
        } catch {
          // fallback a onload
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('image load failed'));
          });
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('image load failed'));
        });
      }

      const sw = image.naturalWidth || image.width;
      const sh = image.naturalHeight || image.height;
      if (!sw || !sh) return null;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // High quality smoothing
      (ctx as any).imageSmoothingEnabled = true;
      try {
        (ctx as any).imageSmoothingQuality = 'high';
      } catch {
        // ignore
      }

      const scale = Math.max(size / sw, size / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      ctx.drawImage(image, dx, dy, dw, dh);

      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  hasData(): boolean {
    const { personalInfo, references } = this.cvData;
    return !!(
      personalInfo.nombres ||
      personalInfo.apellidos ||
      this.getVisibleWorkExperience().length > 0 ||
      this.getVisibleEducation().length > 0 ||
      this.getVisibleCourses().length > 0 ||
      this.getVisibleSkills().length > 0 ||
      this.getVisibleLanguages().length > 0 ||
      this.getVisibleProjects().length > 0 ||
      this.getVisibleReferences().length > 0
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

  getVisibleWorkExperience(): CvData['workExperience'] {
    const list = this.cvData?.workExperience || [];
    return list.filter(e => (e as any).visible !== false);
  }

  getVisibleEducation(): CvData['education'] {
    const list = this.cvData?.education || [];
    return list.filter(e => (e as any).visible !== false);
  }

  getVisibleCourses(): CvData['courses'] {
    const list = this.cvData?.courses || [];
    return list.filter(c => (c as any).visible !== false);
  }

  getVisibleSkills(): CvData['skills'] {
    const list = this.cvData?.skills || [];
    return list.filter(s => (s as any).visible !== false);
  }

  getVisibleLanguages(): CvData['languages'] {
    const list = this.cvData?.languages || [];
    return list.filter(l => (l as any).visible !== false);
  }

  getVisibleProjects(): CvData['projects'] {
    const list = this.cvData?.projects || [];
    return list.filter(p => (p as any).visible !== false);
  }

  getVisibleReferences(): CvData['references'] {
    const list = this.cvData?.references || [];
    return list.filter(r => (r as any).visible !== false);
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

    // 1.5) Template 2: llenar el bloque superior (Perfil) antes de las columnas
    const topPagesNeeded =
      this.selectedTemplateId === 'template-2' && this.flowTopRef
        ? this.fillColumnFromFlow(
            this.flowTopRef.nativeElement,
            (pageIndex) => this.getPageTopEl(pageIndex)
          )
        : 0;

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
    const totalNeeded = Math.max(topPagesNeeded, leftPagesNeeded, rightPagesNeeded, 1);
    if (this.pages.length !== totalNeeded) {
      this.pages = Array.from({ length: totalNeeded }, (_, i) => i);
      this.cdr.detectChanges();
    }
  }

  private resetPagesToFlow(): void {
    const flowTop = this.flowTopRef?.nativeElement || null;
    const flowLeft = this.flowLeftRef.nativeElement;
    const flowRight = this.flowRightRef.nativeElement;

    // Template 2: devolver top (Perfil) al flowTop
    if (flowTop) {
      this.pageTopRefs.toArray().forEach(ref => {
        const pageEl = ref.nativeElement;
        while (pageEl.firstElementChild) {
          flowTop.appendChild(pageEl.firstElementChild);
        }
        pageEl.innerHTML = '';
      });
    }

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
        if ((section === 'workExperience' || section === 'education' || section === 'references') && role === 'item') {
          const last = pageEl.lastElementChild as HTMLElement | null;
          if (last?.dataset?.['section'] === section && last?.dataset?.['role'] === 'title') {
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

  private getPageTopEl(pageIndex: number): HTMLElement {
    const arr = this.pageTopRefs.toArray();
    const ref = arr[pageIndex];
    if (ref) return ref.nativeElement;
    this.pages = Array.from({ length: pageIndex + 1 }, (_, i) => i);
    this.cdr.detectChanges();
    return this.pageTopRefs.toArray()[pageIndex].nativeElement;
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
    return Math.max(0, (innerRect.bottom - colRect.top) - this.pageBottomReservePx);
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
