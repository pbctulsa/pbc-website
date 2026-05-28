import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor],
  template: `
    <section class="page-section">
      <div class="section-inner">
        <p class="eyebrow">About</p>
        <h1 class="section-title">About {{ church.name }}</h1>

        <div class="about-hero">
          <div>
            <p class="lead">
              {{ church.shortName }} exists to glorify God by reaching and teaching the Gospel with
              Jesus' love and compassion. We are a Baptist church in Tulsa shaped by worship,
              evangelism, ministry, discipleship, and fellowship.
            </p>
            <div class="mission-pair">
              <article>
                <h2>Mission</h2>
                <p>{{ church.mission }}</p>
              </article>
              <article>
                <h2>Vision</h2>
                <p>{{ church.vision }}</p>
              </article>
            </div>
          </div>
          <img [src]="church.gallery[0].src" [alt]="church.gallery[0].alt" loading="lazy">
        </div>

        <section class="belief-section" aria-labelledby="belief-heading">
          <div>
            <p class="eyebrow">What We Believe</p>
            <h2 id="belief-heading">Rooted in Scripture and centered on Christ</h2>
            <p>
              We affirm the Holy Bible as the inspired Word of God and the foundation for our faith.
              As a Baptist church, we receive The Baptist Faith and Message as a general statement of
              our beliefs.
            </p>
          </div>
          <div class="belief-grid">
            <article *ngFor="let belief of beliefs">
              <span>{{ belief.label }}</span>
              <h3>{{ belief.title }}</h3>
              <p>{{ belief.text }}</p>
            </article>
          </div>
        </section>

        <section class="church-life" aria-labelledby="life-heading">
          <img [src]="church.gallery[2].src" [alt]="church.gallery[2].alt" loading="lazy">
          <div>
            <p class="eyebrow">Church Life</p>
            <h2 id="life-heading">A family called to worship, serve, and welcome</h2>
            <p>
              Our members commit to protect the unity of the church, share responsibility for its
              growth, serve with their gifts, and support the church's witness through faithful
              worship and godly living.
            </p>
            <p>
              We serve the Tulsa Metropolitan Area, including Asian immigrant families, and welcome
              people without discrimination because of race, color, national origin, disability, age,
              or sex.
            </p>
          </div>
        </section>

        <section class="affiliation-band" aria-label="Church affiliations">
          <p>
            {{ church.shortName }} is autonomous and voluntarily cooperates with the Southern Baptist
            Convention, the Baptist General Convention of Oklahoma, and the Tulsa Metro Baptist
            Association.
          </p>
          <a class="button-link" [href]="church.links.bylaws" target="_blank" rel="noreferrer">
            Download Bylaws
          </a>
        </section>

        <div class="photo-grid" aria-label="Church photo gallery">
          <img
            *ngFor="let photo of church.gallery.slice(3, 9)"
            [src]="photo.src"
            [alt]="photo.alt"
            loading="lazy"
          >
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .about-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(16rem, 0.75fr);
        align-items: start;
        margin-top: 1.5rem;
        gap: 2rem;
      }

      .about-hero > img,
      .church-life > img {
        display: block;
        width: 100%;
        border-radius: 0.5rem;
        object-fit: cover;
      }

      .about-hero > img {
        max-height: 22rem;
        aspect-ratio: 4 / 3;
      }

      .mission-pair {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: 1.5rem;
        gap: 1rem;
      }

      .mission-pair article {
        border-top: 4px solid var(--color-red-700);
        padding: 1.25rem;
        background: var(--color-surface);
      }

      h2 {
        margin: 0 0 0.5rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
      }

      h3 {
        margin: 0 0 0.5rem;
        color: var(--color-blue-900);
        font-family: var(--font-serif);
        font-size: 1.25rem;
      }

      p,
      .lead {
        margin: 0;
        color: var(--color-muted);
      }

      .lead {
        max-width: 52rem;
        font-size: clamp(1.05rem, 2vw, 1.25rem);
        line-height: 1.7;
      }

      .belief-section {
        display: grid;
        grid-template-columns: 0.75fr 1.25fr;
        margin-top: 3rem;
        gap: 2rem;
      }

      .belief-section h2,
      .church-life h2 {
        font-size: clamp(1.8rem, 4vw, 3rem);
        line-height: 1.08;
      }

      .belief-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1rem;
      }

      .belief-grid article {
        border: 1px solid var(--color-border);
        border-radius: 0.5rem;
        padding: 1rem;
        background: var(--color-white);
      }

      .belief-grid span {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--color-red-700);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .church-life {
        display: grid;
        grid-template-columns: minmax(14rem, 0.65fr) minmax(0, 1.35fr);
        align-items: center;
        margin-top: 3rem;
        gap: 2rem;
      }

      .church-life > img {
        max-height: 18rem;
        aspect-ratio: 1 / 1;
      }

      .church-life p + p {
        margin-top: 1rem;
      }

      .affiliation-band {
        margin-top: 3rem;
        border-left: 4px solid var(--color-red-700);
        padding: 1.25rem 1.5rem;
        background: var(--color-surface);
      }

      .affiliation-band p {
        max-width: 58rem;
        color: var(--color-blue-900);
        font-weight: 800;
      }

      .affiliation-band .button-link {
        margin-top: 1rem;
      }

      .photo-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        margin-top: 1rem;
        gap: 0.75rem;
      }

      .photo-grid img {
        margin: 0;
        aspect-ratio: 1 / 1;
      }

      .photo-grid img:nth-child(1),
      .photo-grid img:nth-child(4) {
        grid-column: span 1;
        aspect-ratio: 1 / 1;
      }

      @media (max-width: 760px) {
        .photo-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .photo-grid img:nth-child(1),
        .photo-grid img:nth-child(4) {
          grid-column: span 1;
          aspect-ratio: 1 / 1;
        }
      }

      @media (max-width: 900px) {
        .about-hero,
        .belief-section,
        .church-life {
          grid-template-columns: 1fr;
        }

        .about-hero > img {
          max-height: 18rem;
        }
      }

      @media (max-width: 640px) {
        .mission-pair,
        .belief-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class AboutComponent {
  protected readonly church = churchInfo;
  protected readonly beliefs = [
    {
      label: 'Scripture',
      title: 'The Bible is our foundation',
      text: 'We affirm the Holy Bible as God-inspired and the basis for what we believe, teach, and practice.'
    },
    {
      label: 'Mission',
      title: 'Great Commandment and Great Commission',
      text: 'We seek to love God, love our neighbors, make disciples, and share the Gospel of Jesus Christ.'
    },
    {
      label: 'Formation',
      title: 'Growing as disciples',
      text: 'We gather for worship, learn together, serve with our gifts, and encourage one another toward faithful living.'
    },
    {
      label: 'Community',
      title: 'A welcoming church family',
      text: 'We want every person and family who visits to be received warmly and pointed toward life in Christ.'
    }
  ];
}
