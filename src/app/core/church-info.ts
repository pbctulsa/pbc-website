export const churchInfo = {
  name: 'Peniel Baptist Church',
  shortName: 'PBC Tulsa',
  address: '2140 South 67th E Ave, Tulsa, OK 74129',
  phone: '(918) 798-1163',
  mission:
    "Peniel Baptist Church is committed to reach and teach the Gospel with Jesus' love and compassion.",
  vision:
    'Peniel Baptist Church aims to build up a strong missional church for evangelism works to accomplish the Great Commission of Jesus Christ.',
  serviceTimes: [
    { label: 'Sunday Worship Service', time: '11:00 AM' },
    { label: 'Wednesday Bible Study', time: '6:30 PM' }
  ],
  photos: [
    {
      src: 'images/687156666_1261870276101809_669626852360092061_n.jpg',
      alt: 'Peniel Baptist Church worship leader singing during service',
      title: 'Worship'
    },
    {
      src: 'images/688635082_1261870286101808_4743110680737030896_n.jpg',
      alt: 'Peniel Baptist Church pastor preaching from the pulpit',
      title: 'Preaching'
    },
    {
      src: 'images/689360299_1261870219435148_7023988842433850567_n.jpg',
      alt: 'Peniel Baptist Church worship leader playing guitar',
      title: 'Praise'
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
    bible: 'https://www.bible.com'
  }
} as const;
