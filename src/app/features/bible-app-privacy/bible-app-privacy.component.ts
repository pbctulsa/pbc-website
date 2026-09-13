import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-bible-app-privacy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bible-app-privacy.component.html',
  styleUrl: '../privacy/privacy.component.scss'
})
export class BibleAppPrivacyComponent {
  protected readonly church = churchInfo;
}
