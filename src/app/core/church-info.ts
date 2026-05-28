export const churchInfo = {
  name: 'Peniel Baptist Church',
  shortName: 'PBC Tulsa',
  address: '2140 South 67th E Ave, Tulsa, OK 74129',
  phone: '(918) 798-1163',
  motto:
    "Peniel Baptist Church is committed to reach and teach the Gospel with Jesus' love and compassion.",
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
      src: 'images/church-pics/executive.jpg',
      alt: 'Peniel Baptist Church leadership group photo',
      title: 'Leadership'
    },
    {
      src: 'images/church-pics/worship-team.jpg',
      alt: 'Peniel Baptist Church worship team',
      title: 'Worship'
    },
    {
      src: 'images/church-pics/media-team.jpg',
      alt: 'Peniel Baptist Church media team',
      title: 'Media'
    }
  ],
  gallery: [
    {
      src: 'images/church-pics/worship-team.jpg',
      alt: 'Peniel Baptist Church worship gathering'
    },
    {
      src: 'images/church-pics/executive.jpg',
      alt: 'Peniel Baptist Church church family'
    },
    {
      src: 'images/church-pics/media-team.jpg',
      alt: 'Peniel Baptist Church media team'
    },
    {
      src: 'images/church-pics/men.jpg',
      alt: 'Peniel Baptist Church men ministry'
    },
    {
      src: 'images/church-pics/women.jpg',
      alt: 'Peniel Baptist Church women ministry'
    },
    {
      src: 'images/church-pics/youth.jpg',
      alt: 'Peniel Baptist Church youth ministry'
    },
    {
      src: 'images/church-pics/mission.jpg',
      alt: 'Peniel Baptist Church mission ministry'
    },
    {
      src: 'images/church-pics/journey.jpg',
      alt: 'Peniel Baptist Church children ministry'
    },
    {
      src: 'images/church-pics/122153676620759607.jpg',
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
