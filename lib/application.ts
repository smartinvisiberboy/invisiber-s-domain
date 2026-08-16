export const ELEMENTS = [
  { id: 'fire', label: 'Fire' },
  { id: 'water', label: 'Water' },
  { id: 'wind', label: 'Wind' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const

export type ElementId = (typeof ELEMENTS)[number]['id']

export const ACCOUNT_TYPES = ['F2P', 'Dolphin', 'Whale'] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

/** A stored image reference (Firebase Storage download URL + path). */
export type StoredImage = {
  url: string
  path: string
}

/** Shape sent from the client to the submit API and stored in Firestore. */
export type ApplicationPayload = {
  discordId: string
  guildId: string
  guildBossScore: number
  accountType: AccountType
  profileImage: StoredImage
  guildBossScreenshot: StoredImage
  battleTierScreenshot: StoredImage
  hunters: Record<ElementId, StoredImage[]>
  weapons: Record<ElementId, StoredImage[]>
  successor: StoredImage[]
}

/** Full Firestore document, including moderation metadata. */
export type ApplicationDoc = ApplicationPayload & {
  id: string
  status: ApplicationStatus
  createdAt: number
  updatedAt: number
  guildName: string
  reviewedBy?: string
}
