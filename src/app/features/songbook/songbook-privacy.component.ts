import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-songbook-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page-section">
      <article class="section-inner privacy-policy">
        <p class="eyebrow">PBC Songbook</p>
        <h1 class="section-title">Privacy Policy</h1>
        <p class="effective-date">Effective September 13, 2026</p>

        <p class="lead">
          PBC Songbook is a ministry of Peniel Baptist Church. The app is designed
          for reading, finding, saving, and sharing songs used in worship. It has
          no advertising, analytics SDKs, or user accounts.
        </p>

        <section>
          <h2>Information stored on your device</h2>
          <p>
            The app stores downloaded songs, favorites, reading preferences, and
            unsent correction drafts on your device. This information is not sent
            to Peniel Baptist Church unless you deliberately submit a suggested edit.
          </p>
        </section>

        <section>
          <h2>Songbook updates</h2>
          <p>
            When the app checks for songbook updates, it connects to pbctulsa.org.
            Our hosting provider may process ordinary technical request information,
            such as an IP address, device browser or networking information, and the
            time of the request, for security and reliable delivery.
          </p>
        </section>

        <section>
          <h2>Suggested edits</h2>
          <p>
            If you submit a correction, the app sends the song's existing fields,
            your proposed changes, your note, and any name or email address you
            voluntarily provide. Peniel Baptist Church uses this information only
            to review the correction and, when necessary, follow up with you. We
            retain submissions only as long as reasonably needed for review,
            recordkeeping, and protection against misuse.
          </p>
        </section>

        <section>
          <h2>Sharing and donations</h2>
          <p>
            Sharing is handled by the iOS share sheet and occurs only when you choose
            it. The donation button opens the church's external Church Center giving
            page. PBC Songbook does not receive or store your payment-card or bank
            information; Church Center's own privacy terms govern information entered there.
          </p>
        </section>

        <section>
          <h2>Tracking and children</h2>
          <p>
            We do not use information for advertising or cross-app tracking. The app
            does not knowingly solicit personal information from children. A child
            should not include a name or email address with a correction without a
            parent or guardian's permission.
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <p>
            You may use the songbook without providing a name or email address.
            Removing the app deletes its locally stored information. To ask about a
            submitted correction or request deletion of information you provided,
            contact the church through our contact page.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            We may update this policy when the app or our practices change. The
            effective date above identifies the current version.
          </p>
        </section>

        <div class="actions">
          <a class="button-link" routerLink="/contact">Contact Peniel Baptist Church</a>
          <a class="button-link secondary" routerLink="/songbook">Open the web songbook</a>
        </div>
      </article>
    </main>
  `,
  styles: [`
    .privacy-policy {
      max-width: 52rem;
    }

    .effective-date {
      margin: -0.5rem 0 1.5rem;
      color: var(--color-muted);
      font-size: 0.9rem;
    }

    section {
      margin-top: 2rem;
      border-top: 1px solid var(--color-border);
      padding-top: 1.5rem;
    }

    h2 {
      margin: 0 0 0.6rem;
      color: var(--color-blue-900);
      font-family: var(--font-serif);
      font-size: 1.45rem;
    }

    p {
      margin: 0;
      color: var(--color-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      margin-top: 2.5rem;
      gap: 0.75rem;
    }
  `]
})
export class SongbookPrivacyComponent {}
