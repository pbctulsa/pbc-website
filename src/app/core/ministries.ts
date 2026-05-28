export interface MinistryEntry {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  image: {
    src: string;
    alt: string;
  };
  overview: string;
  bylawFocus: string[];
  emphasis: string[];
}

export const ministries: MinistryEntry[] = [
  {
    slug: 'mission',
    title: 'Mission Ministry',
    subtitle: 'Reaching, teaching, and supporting the Gospel work.',
    summary:
      'The mission ministry helps the church focus on evangelism, outreach, and supporting the work of Christ at home and beyond.',
    image: {
      src: 'images/church-pics/mission.jpg',
      alt: 'Church members gathered in worship and mission'
    },
    overview:
      'This ministry exists to keep the church looking outward, encouraging prayer, service, giving, and participation in the Great Commission.',
    bylawFocus: [
      'Encourage evangelism and outreach in the church and community.',
      'Support mission efforts through prayer, giving, and service.',
      'Help the congregation stay focused on the Great Commission.'
    ],
    emphasis: ['Evangelism', 'Outreach', 'Prayer support', 'Mission giving']
  },
  {
    slug: 'men',
    title: 'Men Ministry',
    subtitle: 'Strengthening men to lead in faith, service, and prayer.',
    summary:
      'The men’s ministry exists to encourage men to grow in Christ, support their families, and serve the church with steady faithfulness.',
    image: {
      src: 'images/church-pics/men.jpg',
      alt: 'Men gathered for a church fellowship photo'
    },
    overview:
      'This ministry helps men stay rooted in Scripture, build fellowship, and take part in the work of the church through prayer, service, and outreach.',
    bylawFocus: [
      'Encourage men to live as faithful disciples at home and in the church.',
      'Support leadership, stewardship, and service in the congregation.',
      'Build fellowship that strengthens prayer, accountability, and gospel witness.'
    ],
    emphasis: ['Prayer and fellowship', 'Family leadership', 'Service and outreach', 'Stewardship']
  },
  {
    slug: 'women',
    title: 'Women Ministry',
    subtitle: 'Serving through prayer, care, discipleship, and fellowship.',
    summary:
      'The women’s ministry nurtures spiritual growth and helps women serve the church through compassion, hospitality, prayer, and teaching.',
    image: {
      src: 'images/church-pics/women.jpg',
      alt: 'Women gathered for a church fellowship photo'
    },
    overview:
      'This ministry is a place for women to grow together in the Word, care for one another, and support the church through meaningful service.',
    bylawFocus: [
      'Encourage spiritual growth through Bible study, prayer, and fellowship.',
      'Support the church through care, hospitality, and service.',
      'Strengthen the witness of the church through godly living and unity.'
    ],
    emphasis: ['Bible study and prayer', 'Care and hospitality', 'Service in the church', 'Fellowship']
  },
  {
    slug: 'youth',
    title: 'Youth Ministry',
    subtitle: 'Building young disciples for worship, service, and mission.',
    summary:
      'The youth ministry helps young people grow in faith, develop leadership, and live out the Gospel with purpose and joy.',
    image: {
      src: 'images/church-pics/youth.jpg',
      alt: 'Youth ministry gathering at church'
    },
    overview:
      'We want our youth to know Christ deeply, stay connected to the church, and learn how to serve others with conviction and humility.',
    bylawFocus: [
      'Equip young people with biblical teaching and discipleship.',
      'Create fellowship that encourages accountability and healthy growth.',
      'Prepare youth to serve in worship, outreach, and church leadership.'
    ],
    emphasis: ['Discipleship', 'Fellowship and worship', 'Outreach', 'Leadership development']
  },
  {
    slug: 'children',
    title: 'Children Ministry',
    subtitle: 'Teaching children the Gospel in a safe and caring environment.',
    summary:
      'The children’s ministry supports families by helping children learn Scripture, worship, and the love of Jesus in age-appropriate ways.',
    image: {
      src: 'images/church-pics/journey.jpg',
      alt: 'Children in a church ministry gathering'
    },
    overview:
      'This ministry lays a foundation of faith through Bible teaching, care, and activities that help children know and follow Christ.',
    bylawFocus: [
      'Provide Bible teaching that is simple, clear, and age appropriate.',
      'Partner with parents and caregivers in the formation of children.',
      'Maintain a welcoming and safe environment for children to learn and grow.'
    ],
    emphasis: ['Bible teaching', 'Family partnership', 'Safety and care', 'Worship and joy']
  }
];

export function getMinistryBySlug(slug: string | null): MinistryEntry | undefined {
  if (!slug) {
    return undefined;
  }

  return ministries.find((ministry) => ministry.slug === slug);
}
