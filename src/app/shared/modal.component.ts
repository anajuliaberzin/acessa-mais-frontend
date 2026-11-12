import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <dialog
      #dialog
      class="app-modal"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="description ? descriptionId : null"
      (click)="closeOnBackdrop($event)"
      (close)="closed.emit()"
    >
      <header class="modal-header">
        <span class="modal-icon" aria-hidden="true"><i [class]="'bi ' + icon"></i></span>
        <button class="modal-close" type="button" aria-label="Fechar janela" (click)="close()">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </header>
      <h2 [id]="titleId">{{ title }}</h2>
      @if (description) {
        <p class="modal-description" [id]="descriptionId">{{ description }}</p>
      }
      <div class="modal-content"><ng-content /></div>
      <footer class="modal-actions"><ng-content select="[modal-actions]" /></footer>
    </dialog>
  `,
  styles: `
    .app-modal {
      width: min(100% - 32px, 440px);
      max-width: 440px;
      max-height: min(90dvh, 640px);
      padding: 28px;
      border: 1px solid var(--line);
      border-radius: 26px;
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 24px 80px #171a3040;
      overflow-y: auto;
      animation: modal-enter 160ms ease-out;
    }
    .app-modal::backdrop {
      background: #171a3070;
      backdrop-filter: blur(4px);
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal-icon {
      display: grid;
      place-items: center;
      width: 52px;
      height: 52px;
      border: 1px solid #dcdafd;
      border-radius: 18px;
      background: var(--soft);
      color: var(--primary);
      font-size: 1.375rem;
    }
    .modal-close {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: var(--surface);
      color: var(--muted);
    }
    .app-modal h2 {
      margin: 0;
      font-size: 1.375rem;
      letter-spacing: -0.035em;
    }
    .modal-description {
      margin: 10px 0 0;
      font-size: 0.875rem;
      line-height: 1.7;
    }
    .modal-content:empty,
    .modal-actions:empty {
      display: none;
    }
    .modal-content {
      margin-top: 16px;
    }
    .modal-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }
    .modal-actions > :first-child {
      flex: 1 1 auto;
    }
    @keyframes modal-enter {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .app-modal { animation: none; }
    }
    @media (max-width: 480px) {
      .app-modal { padding: 22px; border-radius: 22px; }
    }
  `,
})
export class ModalComponent implements AfterViewInit, OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() description = '';
  @Input() icon = 'bi-info-circle';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog') private dialog!: ElementRef<HTMLDialogElement>;
  private viewReady = false;
  readonly titleId = `app-modal-title-${++nextModalId}`;
  readonly descriptionId = `${this.titleId}-description`;

  ngAfterViewInit() {
    this.viewReady = true;
    this.syncOpenState();
  }

  ngOnChanges() {
    if (this.viewReady) this.syncOpenState();
  }

  close() {
    if (this.dialog.nativeElement.open) this.dialog.nativeElement.close();
  }

  closeOnBackdrop(event: MouseEvent) {
    if (event.target === this.dialog.nativeElement) this.close();
  }

  private syncOpenState() {
    const dialog = this.dialog.nativeElement;
    if (this.open && !dialog.open) dialog.showModal();
    else if (!this.open && dialog.open) dialog.close();
  }
}
