import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly downloadRequestedSubject = new Subject<void>();
  readonly downloadRequested$ = this.downloadRequestedSubject.asObservable();

  requestDownload(): void {
    this.downloadRequestedSubject.next();
  }
}

