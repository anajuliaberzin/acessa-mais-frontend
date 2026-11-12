import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AccessibilityService } from './accessibility.service';
import { AccessibilityPanelComponent } from './accessibility-panel.component';
import { MotionService } from './motion.service';
import { SpeechService } from './speech.service';

describe('AccessibilityPanelComponent motion controls', () => {
  it('announces the motion preference and returns focus to the trigger on Escape', async () => {
    const userReduced = signal(false);
    const motion = {
      userReduced,
      systemReduced: signal(true),
      reduced: signal(true),
      toggle: vi.fn(() => userReduced.update((value) => !value)),
      reset: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [AccessibilityPanelComponent],
      providers: [
        {
          provide: AccessibilityService,
          useValue: {
            scale: signal(100),
            contrast: signal(false),
            resize: vi.fn(),
            toggleContrast: vi.fn(),
            reset: vi.fn(),
          },
        },
        { provide: MotionService, useValue: motion },
        {
          provide: SpeechService,
          useValue: {
            supported: false,
            state: signal('idle'),
            message: signal(''),
            voiceAvailable: signal(false),
            read: vi.fn(),
            pause: vi.fn(),
            resume: vi.fn(),
            stop: vi.fn(),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AccessibilityPanelComponent);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.accessibility-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const toggle = fixture.nativeElement.querySelector('[role="switch"]') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(fixture.nativeElement.textContent).toContain(
      'Seu sistema operacional já solicita movimento reduzido.',
    );
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect(motion.toggle).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Animações reduzidas.');

    const panel = fixture.nativeElement.querySelector('#accessibility-panel') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });
});
