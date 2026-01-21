import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly downloadRequestedSubject = new Subject<void>();
  readonly downloadRequested$ = this.downloadRequestedSubject.asObservable();

  private readonly downloadingSubject = new BehaviorSubject<boolean>(false);
  readonly downloading$ = this.downloadingSubject.asObservable();

  requestDownload(): void {
    this.downloadRequestedSubject.next();
  }

  setDownloading(isDownloading: boolean): void {
    this.downloadingSubject.next(isDownloading);
  }
}

