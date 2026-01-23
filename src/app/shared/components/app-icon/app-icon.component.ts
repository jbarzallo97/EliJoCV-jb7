import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

type IconId =
  | 'user'
  | 'user-circle'
  | 'id-card'
  | 'shield'
  | 'briefcase'
  | 'building'
  | 'clock'
  | 'case-file'
  | 'graduation'
  | 'book'
  | 'certificate'
  | 'folder'
  | 'code'
  | 'terminal'
  | 'laptop'
  | 'users'
  | 'handshake'
  | 'language'
  | 'globe'
  | 'mic'
  | 'sparkles'
  | 'checklist'
  | 'wrench';

const ICON_PATHS: Record<IconId, string[]> = {
  // Simple icons, tailored for CV sections (24x24)
  user: ['M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5Z'],
  'user-circle': [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
    'M6.2 17.2c.9-2 3.1-3.2 5.8-3.2s4.9 1.2 5.8 3.2A8 8 0 0 1 12 20a8 8 0 0 1-5.8-2.8Z'
  ],
  'id-card': [
    'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h16V6H4Z',
    'M7 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    'M6 14.5c0-1.38 1.57-2.5 3.5-2.5s3.5 1.12 3.5 2.5V16H6v-1.5Z',
    'M14 9h5v2h-5V9Zm0 4h5v2h-5v-2Z'
  ],
  shield: [
    'M12 2 20 5v6c0 5.25-3.44 9.74-8 11-4.56-1.26-8-5.75-8-11V5l8-3Z',
    'M10.9 14.7 8.2 12l1.4-1.4 1.3 1.3 3.5-3.5 1.4 1.4-5 4.9Z'
  ],
  briefcase: [
    'M10 4h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v3H0v-3a2 2 0 0 1 2-2h4V6a2 2 0 0 1 2-2Zm4 2h-4v2h4V6Z',
    'M0 15h24v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-5Z'
  ],
  building: [
    'M3 22V3h12v19H3Zm2-2h8V5H5v15Z',
    'M17 22V9h4v13h-4Zm2-2h0V11h0v9Z',
    'M7 8h2v2H7V8Zm0 4h2v2H7v-2Zm0 4h2v2H7v-2Zm4-8h2v2h-2V8Zm0 4h2v2h-2v-2Zm0 4h2v2h-2v-2Z'
  ],
  clock: [
    'M12 2a10 10 0 1 0 .001 20A10 10 0 0 0 12 2Zm1 11h5v-2h-4V6h-2v7Z'
  ],
  'case-file': [
    'M6 2h9l3 3v17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 2H6v18h10V6h-2Z',
    'M8 9h6v2H8V9Zm0 4h6v2H8v-2Z'
  ],
  graduation: [
    'M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z',
    'M5 13v4c0 2.21 3.13 4 7 4s7-1.79 7-4v-4l-7 3-7-3Z'
  ],
  book: [
    'M6 2h11a3 3 0 0 1 3 3v16a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1Zm1 2v15a1 1 0 0 0 1 1h10V5a1 1 0 0 0-1-1H7Z',
    'M9 7h6v2H9V7Zm0 4h6v2H9v-2Z'
  ],
  certificate: [
    'M6 2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v10h12V4H6Z',
    'M12 7.2 13 9l1.9.3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4L11 9l1-1.8Z',
    'M14 16v6l-2-1-2 1v-6h4Z'
  ],
  folder: ['M10 4 12 6h10a2 2 0 0 1 2 2v10a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h8Z'],
  code: [
    'M8.7 16.6 3.1 12l5.6-4.6L7.3 5.8 0 12l7.3 6.2 1.4-1.6ZM15.3 16.6 20.9 12l-5.6-4.6 1.4-1.6L24 12l-7.3 6.2-1.4-1.6Z',
    'M9.6 21.8 14.6 2.2l2 .5-5 19.6-2-.5Z'
  ],
  terminal: [
    'M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v12h18V6H3Z',
    'M6 9l3 3-3 3-1.4-1.4L6.2 12 4.6 10.4 6 9Zm5 6h7v-2h-7v2Z'
  ],
  laptop: [
    'M4 5h16a2 2 0 0 1 2 2v9H2V7a2 2 0 0 1 2-2Zm0 2v7h16V7H4Z',
    'M0 18h24v2a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2Z'
  ],
  users: [
    'M7 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm10 3a3 3 0 1 0-2.8-4.1A5.98 5.98 0 0 1 17 15Z',
    'M1 22v-2c0-3.31 2.69-6 6-6s6 2.69 6 6v2H1Zm14 0v-1.5c0-1.53-.57-2.93-1.5-4 3.59.12 6.5 2.2 6.5 4.5V22h-5Z'
  ],
  handshake: [
    'M7.5 12.5 5 10l3-3 2.2 2.2L9 10.4 7.5 12.5Z',
    'M16.5 12.5 19 10l-3-3-2.2 2.2L15 10.4l1.5 2.1Z',
    'M8.7 13.5 11 11.2l1 1 1-1 2.3 2.3c.8.8.8 2.1 0 2.9l-.9.9c-.5.5-1.3.5-1.8 0l-.3-.3-.3.3c-.5.5-1.3.5-1.8 0l-.9-.9c-.8-.8-.8-2.1 0-2.9Z'
  ],
  language: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.18a15.8 15.8 0 0 0-1.1-5A8.02 8.02 0 0 1 19.93 11ZM12 4c.83 1.2 1.5 2.9 1.87 5H10.13c.37-2.1 1.04-3.8 1.87-5ZM4.07 13h3.18c.2 1.77.65 3.46 1.1 5A8.02 8.02 0 0 1 4.07 13Zm3.18-2H4.07a8.02 8.02 0 0 1 4.28-5c-.45 1.54-.9 3.23-1.1 5ZM12 20c-.83-1.2-1.5-2.9-1.87-5h3.74c-.37 2.1-1.04 3.8-1.87 5Zm2.14-7H9.86c-.1-.67-.16-1.33-.19-2 .03-.67.09-1.33.19-2h4.28c.1.67.16 1.33.19 2-.03.67-.09 1.33-.19 2Zm1.51 5c.45-1.54.9-3.23 1.1-5h3.18a8.02 8.02 0 0 1-4.28 5Z'
  ],
  globe: [
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.7 6H16.9c-.4-1.5-1-2.8-1.7-3.8A8.1 8.1 0 0 1 19.7 8ZM12 4c.9 1.1 1.6 2.6 2 4H10c.4-1.4 1.1-2.9 2-4ZM4.3 14h2.8c.2 1.5.6 2.9 1.1 4.2A8.1 8.1 0 0 1 4.3 14Zm0-4a8.1 8.1 0 0 1 3.9-4.2c-.5 1.3-.9 2.7-1.1 4.2H4.3ZM12 20c-.9-1.1-1.6-2.6-2-4h4c-.4 1.4-1.1 2.9-2 4Zm2.2-6H9.8c-.1-.7-.2-1.3-.2-2s.1-1.3.2-2h4.4c.1.7.2 1.3.2 2s-.1 1.3-.2 2Zm1.6 4.2c.5-1.3.9-2.7 1.1-4.2h2.8a8.1 8.1 0 0 1-3.9 4.2Z'
  ],
  mic: [
    'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z',
    'M17 11h2a7 7 0 0 1-6 6.92V21h-2v-3.08A7 7 0 0 1 5 11h2a5 5 0 0 0 10 0Z'
  ],
  sparkles: [
    'M12 2l1.2 3.6L17 7l-3.8 1.4L12 12l-1.2-3.6L7 7l3.8-1.4L12 2Z',
    'M19 10l.8 2.4L22 13l-2.2.6L19 16l-.8-2.4L16 13l2.2-.6L19 10Z',
    'M5 10l.8 2.4L8 13l-2.2.6L5 16l-.8-2.4L2 13l2.2-.6L5 10Z'
  ],
  checklist: [
    'M4 6h14v2H4V6Zm0 5h14v2H4v-2Zm0 5h14v2H4v-2Z',
    'M21 7l-1.4-1.4-2.1 2.1-.7-.7L15.4 8.4l2.1 2.1L21 7Zm0 5-1.4-1.4-2.1 2.1-.7-.7-1.4 1.4 2.1 2.1L21 12Zm0 5-1.4-1.4-2.1 2.1-.7-.7-1.4 1.4 2.1 2.1L21 17Z'
  ],
  wrench: [
    'M22 6.7 19.3 4l-2.1 2.1 2.7 2.7 2.1-2.1ZM2 20.6l6.7-6.7 3.2 3.2L5.2 24H2v-3.4Z',
    'M14.1 4.6a5 5 0 0 0-6.8 6.8L2 16.7V20h3.3l5.3-5.3a5 5 0 0 0 6.8-6.8l-2 2-3.3-3.3 2-2Z'
  ]
};

function mapAnyToIconId(name: string | null | undefined): IconId {
  const v = (name || '').trim();
  // Si ya viene como un id SVG nuevo, respetarlo tal cual
  if ((Object.keys(ICON_PATHS) as IconId[]).includes(v as IconId)) {
    return v as IconId;
  }
  // Mantener compatibilidad con valores anteriores (Material Icons)
  switch (v) {
    // Profile
    case 'person':
    case 'account_circle':
    case 'badge':
    case 'contact_page':
    case 'assignment_ind':
    case 'verified_user':
      return 'user';

    // Work
    case 'work':
    case 'work_outline':
    case 'business_center':
    case 'domain':
    case 'work_history':
    case 'cases':
      return 'briefcase';

    // Education
    case 'school':
    case 'local_library':
    case 'workspace_premium':
    case 'history_edu':
    case 'auto_stories':
      return 'graduation';

    // References
    case 'groups':
    case 'supervisor_account':
    case 'recommend':
    case 'handshake':
    case 'contact_mail':
      return 'users';

    // Languages
    case 'translate':
    case 'language':
    case 'public':
    case 'record_voice_over':
      return 'language';

    // Skills
    case 'psychology':
    case 'star':
    case 'checklist':
    case 'auto_fix_high':
      return 'sparkles';
    case 'build':
    case 'engineering':
      return 'wrench';

    // Courses
    case 'menu_book':
    case 'library_books':
    case 'import_contacts':
      return 'book';

    // Projects
    case 'folder':
    case 'folder_open':
      return 'folder';
    case 'code':
    case 'terminal':
    case 'laptop_mac':
    case 'construction':
      return 'code';

    default:
      // Fallback razonable
      return 'folder';
  }
}

@Component({
  selector: 'app-icon',
  template: `
    <svg
      class="app-icon"
      [attr.viewBox]="'0 0 24 24'"
      [attr.width]="size"
      [attr.height]="size"
      aria-hidden="true"
      focusable="false">
      <ng-container *ngFor="let d of paths">
        <path [attr.d]="d"></path>
      </ng-container>
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .app-icon {
        display: block;
        fill: currentColor;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppIconComponent {
  @Input() name: string | null | undefined = null;
  @Input() size = 18;

  get paths(): string[] {
    const id = mapAnyToIconId(this.name);
    return ICON_PATHS[id] || ICON_PATHS.folder;
  }
}

