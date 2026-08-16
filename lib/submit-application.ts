'use client'

import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseStorage, isFirebaseConfigured } from '@/lib/firebase/client'
import type {
  AccountType,
  ApplicationPayload,
  ElementId,
  StoredImage,
} from '@/lib/application'
import { ELEMENTS } from '@/lib/application'
import type { ImageValue } from '@/components/apply/image-slot'

export type ApplicationFormFiles = {
  discordId: string
  guildId: string
  guildBossScore: number
  accountType: AccountType
  profileImage: ImageValue
  guildBossScreenshot: ImageValue
  battleTierScreenshot: ImageValue
  hunters: Record<ElementId, ImageValue[]>
  weapons: Record<ElementId, ImageValue[]>
  successor: ImageValue[]
}

function slugId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

async function upload(
  storage: ReturnType<typeof getFirebaseStorage>,
  folder: string,
  name: string,
  value: ImageValue,
): Promise<StoredImage> {
  if (!value) throw new Error(`Missing image: ${name}`)
  const ext = value.file.name.split('.').pop() || 'png'
  const path = `applications/${folder}/${name}-${slugId()}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, value.file, {
    contentType: value.file.type,
  })
  const url = await getDownloadURL(storageRef)
  return { url, path }
}

/**
 * Uploads all applicant images to Firebase Storage, then posts the resulting
 * metadata to the API route which persists it to Firestore.
 */
export async function submitApplication(
  data: ApplicationFormFiles,
): Promise<{ id: string }> {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* environment variables to enable submissions.',
    )
  }

  const storage = getFirebaseStorage()
  const folder = `${data.discordId.replace(/[^a-zA-Z0-9_-]/g, '_')}-${slugId()}`

  const [profileImage, guildBossScreenshot, battleTierScreenshot] =
    await Promise.all([
      upload(storage, folder, 'profile', data.profileImage),
      upload(storage, folder, 'guild-boss', data.guildBossScreenshot),
      upload(storage, folder, 'battle-tier', data.battleTierScreenshot),
    ])

  const uploadGroup = async (
    group: Record<ElementId, ImageValue[]>,
    prefix: string,
  ) => {
    const result = {} as Record<ElementId, StoredImage[]>
    for (const el of ELEMENTS) {
      const slots = group[el.id].filter(Boolean)
      result[el.id] = await Promise.all(
        slots.map((v, i) => upload(storage, folder, `${prefix}-${el.id}-${i}`, v)),
      )
    }
    return result
  }

  const hunters = await uploadGroup(data.hunters, 'hunter')
  const weapons = await uploadGroup(data.weapons, 'weapon')

  const successor = await Promise.all(
    data.successor
      .filter(Boolean)
      .map((v, i) => upload(storage, folder, `successor-${i}`, v)),
  )

  const payload: ApplicationPayload = {
    discordId: data.discordId,
    guildId: data.guildId,
    guildBossScore: data.guildBossScore,
    accountType: data.accountType,
    profileImage,
    guildBossScreenshot,
    battleTierScreenshot,
    hunters,
    weapons,
    successor,
  }

  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(msg || 'Failed to save application.')
  }

  return (await res.json()) as { id: string }
}
