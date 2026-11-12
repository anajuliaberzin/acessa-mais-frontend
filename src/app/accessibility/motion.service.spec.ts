import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MotionService } from './motion.service';

describe('MotionService', () => {
  let originalMatchMedia: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    localStorage.removeItem('acessa.motion.reduced.v1');
    document.documentElement.classList.remove('reduce-motion');
  });

  afterEach(() => {
    localStorage.removeItem('acessa.motion.reduced.v1');
    document.documentElement.classList.remove('reduce-motion');
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('combines and persists user and operating system preferences', () => {
    localStorage.setItem('acessa.motion.reduced.v1', 'true');
    let systemChange: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        systemChange = listener;
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => mediaQuery),
    });

    TestBed.configureTestingModule({});
    const motion = TestBed.inject(MotionService);
    motion.initialize();

    expect(motion.userReduced()).toBe(true);
    expect(motion.reduced()).toBe(true);
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);

    motion.toggle();
    expect(motion.userReduced()).toBe(false);
    expect(localStorage.getItem('acessa.motion.reduced.v1')).toBe('false');
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(false);

    systemChange?.({ matches: true } as MediaQueryListEvent);
    expect(motion.systemReduced()).toBe(true);
    expect(motion.reduced()).toBe(true);
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
  });

  it('does not access browser APIs during server rendering', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(),
    });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const motion = TestBed.inject(MotionService);

    expect(() => motion.initialize()).not.toThrow();
    expect(window.matchMedia).not.toHaveBeenCalled();
  });
});
