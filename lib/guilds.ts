export type Guild = {
  id: string
  name: string
  tier: string
  level: string
  /** Minimum Guild Boss Score required to join. 0 = open, no requirement. */
  minScore: number
  /** Displayed RC requirement label. */
  rc: string
  /** Displayed contribution label. */
  contribution: string
  open: boolean
  /** Recruitment ranking, higher = more prestigious. */
  rank: number
}

/**
 * Guilds ordered from most to least prestigious (rank descending).
 * minScore is used for the applicant eligibility check against
 * the "Guild Boss Score" they enter.
 */
export const GUILDS: Guild[] = [
  {
    id: 'pandemonium',
    name: 'Pandemonium',
    tier: 'S-1',
    level: 'Lv.20',
    minScore: 2800,
    rc: 'RC 170+',
    contribution: '2800+',
    open: false,
    rank: 100,
  },
  {
    id: 'shadowgarden',
    name: 'ShadowGarden',
    tier: 'S-3',
    level: 'Lv.22',
    minScore: 2400,
    rc: 'RC 120+',
    contribution: '2400+',
    open: false,
    rank: 90,
  },
  {
    id: 'revenants00',
    name: 'Revenants00',
    tier: 'S-3',
    level: 'Lv.20',
    minScore: 2400,
    rc: 'RC 120+',
    contribution: '2400+',
    open: false,
    rank: 85,
  },
  {
    id: 'icefrog',
    name: 'IceFrog',
    tier: 'S-3',
    level: 'Lv.19',
    minScore: 2400,
    rc: 'RC 120+',
    contribution: '2400+',
    open: false,
    rank: 80,
  },
  {
    id: 'rxshadow',
    name: 'RxShadow',
    tier: 'S-3',
    level: 'Lv.16',
    minScore: 2400,
    rc: 'RC 120+',
    contribution: '2400+',
    open: false,
    rank: 75,
  },
  {
    id: 'kalopsia',
    name: 'Kalopsia',
    tier: 'A-2',
    level: 'Lv.5',
    minScore: 2600,
    rc: 'RC 100+',
    contribution: '2600+',
    open: false,
    rank: 70,
  },
  {
    id: 'thurisaz',
    name: 'スリサズ',
    tier: 'A-3',
    level: 'Lv.21',
    minScore: 0,
    rc: 'Open',
    contribution: 'Open',
    open: true,
    rank: 40,
  },
  {
    id: 'theogs',
    name: 'TheOGs',
    tier: 'B-1',
    level: 'Lv.20',
    minScore: 0,
    rc: 'Open',
    contribution: 'Open',
    open: true,
    rank: 30,
  },
]

export const MAIN_GUILD_ID = 'pandemonium'

export function getGuild(id: string): Guild | undefined {
  return GUILDS.find((g) => g.id === id)
}

export type EligibilityResult =
  | { eligible: true; guild: Guild }
  | { eligible: false; guild: Guild; suggestion: Guild | null }

/**
 * Check whether an applicant's Guild Boss Score meets the requirement
 * for the selected guild. If not, suggest the highest-ranked guild they
 * actually qualify for.
 */
export function checkEligibility(
  guildId: string,
  score: number,
): EligibilityResult | null {
  const guild = getGuild(guildId)
  if (!guild) return null

  if (score >= guild.minScore) {
    return { eligible: true, guild }
  }

  const suggestion =
    [...GUILDS]
      .sort((a, b) => b.rank - a.rank)
      .find((g) => score >= g.minScore) ?? null

  return { eligible: false, guild, suggestion }
}

export const DISCORD_INVITE = 'https://discord.gg/bxxXPU7br3'
export const HELP_DISCORD_USER_ID = '1298322269264806020'
