export const churchInfo = {
  name: 'Peniel Baptist Church',
  shortName: 'PBC Tulsa',
  address: '2140 South 67th E Ave, Tulsa, OK 74129',
  phone: '(918) 798-1163',
  community:
    'PBC Tulsa is mainly a Thadou-speaking community church, with English worship service every third Sunday.',
  mission:
    "Peniel Baptist Church is committed to reach and teach the Gospel with Jesus' love and compassion.",
  vision:
    'Peniel Baptist Church aims to build up a strong missional church for evangelism works to accomplish the Great Commission of Jesus Christ.',
  serviceTimes: [
    { label: 'Sunday Worship Service', time: '11:00 AM' },
    { label: 'English Worship Service', time: 'Every 3rd Sunday at 11:00 AM' },
    { label: 'Wednesday Bible Study', time: '6:30 PM' }
  ],
  photos: [
    {
      src: 'images/church-pics/PHOTO-2025-02-09-18-54-27.jpg',
      alt: 'Peniel Baptist Church congregation gathered for worship',
      title: 'Worship'
    },
    {
      src: 'images/church-pics/WhatsApp Image 2025-07-20 at 01.36.29.jpeg',
      alt: 'Peniel Baptist Church worship service',
      title: 'Preaching'
    },
    {
      src: 'images/church-pics/IMG_1020-Edit.jpg',
      alt: 'Peniel Baptist Church gathering',
      title: 'Praise'
    }
  ],
  gallery: [
    {
      src: 'images/church-pics/IMG_1020-Edit.jpg',
      alt: 'Peniel Baptist Church worship gathering'
    },
    {
      src: 'images/church-pics/IMG_1033-Edit.jpg',
      alt: 'Peniel Baptist Church church family'
    },
    {
      src: 'images/church-pics/IMG_1050-Edit.jpg',
      alt: 'Peniel Baptist Church worship team'
    },
    {
      src: 'images/church-pics/122148129722759607.jpg',
      alt: 'Peniel Baptist Church congregation'
    },
    {
      src: 'images/church-pics/122153676620759607.jpg',
      alt: 'Peniel Baptist Church community moment'
    },
    {
      src: 'images/church-pics/122162793866759607.jpg',
      alt: 'Peniel Baptist Church church event'
    },
    {
      src: 'images/church-pics/935647898724050.jpg',
      alt: 'Peniel Baptist Church fellowship'
    },
    {
      src: 'images/church-pics/940327744922732.jpg',
      alt: 'Peniel Baptist Church worship service'
    },
    {
      src: 'images/church-pics/1031755085779997.jpg',
      alt: 'Peniel Baptist Church ministry gathering'
    }
  ],
  links: {
    giving: 'https://pbctulsa.churchcenter.com/giving',
    bulletin: 'https://pbctulsa.churchcenter.com/pages/bulletin',
    calendar: 'https://pbctulsa.churchcenter.com/calendar',
    directory: 'https://pbctulsa.churchcenter.com/people',
    profile: 'https://pbctulsa.churchcenter.com/profile',
    mediaForm: 'https://pbctulsa.churchcenter.com/people/forms',
    store: 'https://peniel-baptist-church.printify.me',
    facebook: 'https://www.facebook.com/pbctulsa',
    instagram: 'https://www.instagram.com/pbctulsa',
    youtube: 'https://www.youtube.com/@pbctulsa',
    youtubeUploadsEmbed: 'https://www.youtube.com/embed/videoseries?list=UUdFnaB_onPDQLjuhLj0KDkQ',
    podcast: 'https://podcast.pbctulsa.org/',
    bylaws: 'docs/pbc-bylaws-final.pdf',
    bible: 'https://www.bible.com'
  },
  socialLinks: [
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/pbctulsa'
    },
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/pbctulsa'
    },
    {
      label: 'YouTube',
      url: 'https://www.youtube.com/@pbctulsa'
    },
    {
      label: 'Podcast',
      url: 'https://podcast.pbctulsa.org/'
    }
  ]
} as const;
