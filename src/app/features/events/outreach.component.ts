import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { missionOutreach } from './event-data';

@Component({
  selector: 'app-outreach',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './events.scss',
  template: `
    <section class="page-section event-hero">
      <div class="section-inner">
        <a class="back-link" routerLink="/events">← All events</a>
        <p class="eyebrow">Peniel Baptist Church · Mission Ministry</p>
        <h1>Mission Outreach</h1>
        <p class="event-subtitle">Free lunch &amp; clothes</p>
        <p>A day to serve our neighbors with the love and compassion of Jesus. Individuals and families in our community are welcome.</p>
        @if (past) { <p class="past-notice">This event has ended. Visit our events page for upcoming gatherings.</p> }
      </div>
    </section>
    <section class="page-section">
      <div class="section-inner detail-grid">
        <div>
          <section aria-labelledby="expect-title">
            <h2 id="expect-title">What to expect</h2>
            <p>Come to Peniel Baptist Church for a one-day community outreach with free lunch and clothes.</p>
            <div class="expect-grid">
              <article><h3>Free lunch</h3><p>Enjoy lunch provided by the church at no cost.</p></article>
              <article><h3>Free clothes</h3><p>Clothing will be offered free of charge to help individuals and families in our community.</p></article>
            </div>
          </section>
          <section class="donation-box" aria-labelledby="donate-title">
            <p class="eyebrow">For our congregation</p>
            <h2 id="donate-title">Help through clothing donations</h2>
            @if (!past) {
              <p>Church members are encouraged to begin donating clothes now to support this outreach.</p>
              <p>Please contact the church for donation drop-off arrangements and questions about what to bring.</p>
            } @else {
              <p>Contact the church to ask about current opportunities to donate clothing and serve our neighbors.</p>
            }
            <a class="button-link secondary" routerLink="/contact">Ask about donating</a>
          </section>
          <section class="questions" aria-labelledby="questions-title">
            <h2 id="questions-title">Questions before you come?</h2>
            <p>For questions about registration, parking, accessibility, food, or clothing pickup, please contact the church before your visit.</p>
            <a routerLink="/contact">Contact Peniel Baptist Church</a>
          </section>
        </div>
        <aside class="event-facts" aria-labelledby="details-title">
          <h2 id="details-title">Event details</h2>
          <dl>
            <dt>Date</dt><dd><time [attr.datetime]="event.start">{{ event.date }}</time></dd>
            <dt>Time</dt><dd>{{ event.time }}<small>Tulsa local time (CST)</small></dd>
            <dt>Location</dt><dd>Peniel Baptist Church<small>{{ event.address }}</small></dd>
            <dt>Cost</dt><dd>Lunch and clothes are free</dd>
          </dl>
          <a class="button-link" [href]="event.directions" target="_blank" rel="noreferrer">Get directions</a>
          <a class="ministry-link" routerLink="/ministries/mission">Meet our Mission Ministry</a>
        </aside>
      </div>
    </section>
  `
})
export class OutreachComponent {
  protected readonly event = missionOutreach;
  protected readonly past = Date.now() >= Date.parse(missionOutreach.end);
}
