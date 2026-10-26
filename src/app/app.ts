import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { AccessibilityPanelComponent } from './accessibility/accessibility-panel.component';
import { RouteFocusService } from './accessibility/route-focus.service';

@Component({
  imports: [RouterOutlet, HeaderComponent, AccessibilityPanelComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  template: `<app-header />
    <div id="conteudo" tabindex="-1"><router-outlet /></div><app-accessibility-panel />`,
})
export class App { private readonly routeFocus = inject(RouteFocusService); }
