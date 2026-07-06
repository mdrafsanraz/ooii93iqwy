export interface FeatureHighlight {
  title: string
  description: string
  icon: string
}

export interface FeaturePageConfig {
  slug: string
  badge: string
  title: string
  titleAccent: string
  subtitle: string
  illustration: 'analytics' | 'playlist' | 'tools'
  accentFrom: string
  accentTo: string
  highlights: FeatureHighlight[]
  steps?: { title: string; description: string }[]
  ctaTitle: string
  ctaSubtitle: string
}

export const analyticsConfig: FeaturePageConfig = {
  slug: 'analytics',
  badge: 'Insights Dashboard',
  title: 'Know your music',
  titleAccent: 'inside and out',
  subtitle:
    'See where your streams come from, who your listeners are, and which releases earn the most — all in one clean dashboard built for independent artists and labels.',
  illustration: 'analytics',
  accentFrom: '#0f172a',
  accentTo: '#334155',
  highlights: [
    {
      icon: '📈',
      title: 'Daily performance trends',
      description:
        'Watch streams, saves, and revenue update day by day so you can spot momentum early and double down on what works.',
    },
    {
      icon: '🌍',
      title: 'Audience by region & platform',
      description:
        'Break down listeners by country, city, and streaming service to plan tours, ads, and collaborations with real data.',
    },
    {
      icon: '🎵',
      title: 'Track-level breakdowns',
      description:
        'Compare songs on the same release, see skip rates and completion, and understand which tracks fans replay most.',
    },
    {
      icon: '💸',
      title: 'Revenue & royalty reports',
      description:
        'Transparent monthly statements and exportable reports so you always know what you earned and where it came from.',
    },
    {
      icon: '📱',
      title: 'Social + streaming combined',
      description:
        'Connect the dots between TikTok, Instagram, and DSP activity to see how social buzz turns into real streams.',
    },
    {
      icon: '📥',
      title: 'Export when you need it',
      description:
        'Download CSV summaries for your accountant, manager, or label partners without digging through spreadsheets.',
    },
  ],
  ctaTitle: 'Start tracking your growth',
  ctaSubtitle: 'Sign up free and get analytics from your very first release.',
}

export const playlistPitchingConfig: FeaturePageConfig = {
  slug: 'playlist-pitching',
  badge: 'Discovery Engine',
  title: 'Get your music',
  titleAccent: 'in front of curators',
  subtitle:
    'Pitch upcoming releases for editorial playlist consideration across major platforms. One focused submission per release — reviewed by humans who care about the music.',
  illustration: 'playlist',
  accentFrom: '#14532d',
  accentTo: '#166534',
  highlights: [
    {
      icon: '🎯',
      title: 'Editorial playlist pitching',
      description:
        'Submit unreleased tracks for Spotify, Apple Music, and partner editorial teams to consider for playlist placement.',
    },
    {
      icon: '📅',
      title: 'Plan ahead',
      description:
        'Schedule releases 3–4 weeks early so curators have time to review — the same window top distributors recommend.',
    },
    {
      icon: '✨',
      title: 'Quality-first review',
      description:
        'We look at production, originality, and fit — not follower count. Every genre is welcome when the song stands out.',
    },
    {
      icon: '🎧',
      title: 'One pitch per release',
      description:
        'Keep submissions focused: pick your strongest track per release so curators get your best first impression.',
    },
    {
      icon: '🌐',
      title: 'Multi-platform reach',
      description:
        'Opportunities span streaming services, discovery playlists, and promotional programs from our distribution partners.',
    },
    {
      icon: '📝',
      title: 'Clear guidelines',
      description:
        'Straightforward eligibility rules and tips so you know exactly how to prepare a pitch that gets taken seriously.',
    },
  ],
  steps: [
    {
      title: 'Distribute your release',
      description: 'Upload through RDistro and set a release date at least 3 weeks out.',
    },
    {
      title: 'Submit your pitch',
      description: 'Choose one standout track and add context — mood, story, and comparable artists help.',
    },
    {
      title: 'We advocate for you',
      description: 'Our team forwards strong submissions to partner curators. Placement is never guaranteed, but great music gets heard.',
    },
  ],
  ctaTitle: 'Ready to pitch your next release?',
  ctaSubtitle: 'Distribute with RDistro and unlock the pitch portal from your dashboard.',
}

export const artistToolsConfig: FeaturePageConfig = {
  slug: 'artist-tools',
  badge: 'Release Toolkit',
  title: 'Everything to',
  titleAccent: 'launch louder',
  subtitle:
    'Pre-saves, smart links, promo assets, and fan tools — built into your distribution workflow so every release ships with momentum behind it.',
  illustration: 'tools',
  accentFrom: '#4c1d95',
  accentTo: '#6d28d9',
  highlights: [
    {
      icon: '🔗',
      title: 'Smart links',
      description:
        'One beautiful link that routes fans to Spotify, Apple Music, YouTube, and every store you distribute to.',
    },
    {
      icon: '💾',
      title: 'Pre-save campaigns',
      description:
        'Auto-generated pre-save pages help you stack day-one streams and capture listener emails before release day.',
    },
    {
      icon: '🎨',
      title: 'Promo graphics',
      description:
        'Generate share-ready artwork and social tiles sized for Instagram, Stories, and TikTok in seconds.',
    },
    {
      icon: '📣',
      title: 'Fan announcements',
      description:
        'Reach your audience directly with release updates instead of fighting social algorithms for every post.',
    },
    {
      icon: '⏱️',
      title: 'Release countdown',
      description:
        'Build anticipation with a live countdown page fans can bookmark and share with their friends.',
    },
    {
      icon: '📊',
      title: 'Pre-save analytics',
      description:
        'See who saved your release in real time and measure which channels drive the most pre-release buzz.',
    },
  ],
  ctaTitle: 'Ship your next release with tools included',
  ctaSubtitle: 'No extra plugins or third-party logins — it all lives in your RDistro account.',
}
