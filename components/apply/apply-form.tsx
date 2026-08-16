'use client'

import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldQuestion,
  Swords,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  ACCOUNT_TYPES,
  type AccountType,
  ELEMENTS,
  type ElementId,
} from '@/lib/application'
import {
  checkEligibility,
  DISCORD_INVITE,
  type EligibilityResult,
  GUILDS,
} from '@/lib/guilds'
import { submitApplication } from '@/lib/submit-application'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageSlot, type ImageValue } from '@/components/apply/image-slot'
import { ElementImageGroup } from '@/components/apply/element-image-group'

function emptyGroup(): Record<ElementId, ImageValue[]> {
  return ELEMENTS.reduce(
    (acc, el) => {
      acc[el.id] = [null, null]
      return acc
    },
    {} as Record<ElementId, ImageValue[]>,
  )
}

function Section({
  index,
  title,
  description,
  icon: Icon,
  children,
}: {
  index: number
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="glass-strong rounded-2xl p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-mono text-sm font-bold text-accent">
          {index}
        </span>
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold tracking-wide text-foreground">
            <Icon className="h-4 w-4 text-accent" />
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export function ApplyForm() {
  const [discordId, setDiscordId] = useState('')
  const [guildId, setGuildId] = useState('')
  const [score, setScore] = useState('')
  const [accountType, setAccountType] = useState<AccountType | ''>('')

  const [profileImage, setProfileImage] = useState<ImageValue>(null)
  const [guildBossShot, setGuildBossShot] = useState<ImageValue>(null)
  const [battleTierShot, setBattleTierShot] = useState<ImageValue>(null)

  const [hunters, setHunters] = useState<Record<ElementId, ImageValue[]>>(
    emptyGroup(),
  )
  const [weapons, setWeapons] = useState<Record<ElementId, ImageValue[]>>(
    emptyGroup(),
  )
  const [successor, setSuccessor] = useState<ImageValue[]>([null, null])

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<
    | { kind: 'success'; guildName: string }
    | { kind: 'ineligible'; data: EligibilityResult }
    | null
  >(null)

  const updateElement =
    (setter: typeof setHunters) =>
    (element: ElementId, index: number, v: ImageValue) => {
      setter((prev) => ({
        ...prev,
        [element]: prev[element].map((val, i) => (i === index ? v : val)),
      }))
    }

  const scoreNum = useMemo(() => Number.parseInt(score, 10), [score])

  const validate = (): string | null => {
    if (!discordId.trim()) return 'Enter your Discord ID.'
    if (!guildId) return 'Select a guild to apply for.'
    if (!score.trim() || Number.isNaN(scoreNum) || scoreNum < 0)
      return 'Enter a valid Guild Boss Score.'
    if (!accountType) return 'Select your account type.'
    if (!profileImage) return 'Upload a profile image.'
    if (!guildBossShot) return 'Upload your Guild Boss screenshot.'
    if (!battleTierShot) return 'Upload your Battle Tier screenshot.'
    for (const el of ELEMENTS) {
      if (hunters[el.id].filter(Boolean).length < 2)
        return `Upload 2 ${el.label} hunter images.`
      if (weapons[el.id].filter(Boolean).length < 2)
        return `Upload 2 ${el.label} weapon images.`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    // Eligibility gate — do not submit if they don't qualify.
    const eligibility = checkEligibility(guildId, scoreNum)
    if (!eligibility) {
      toast.error('Invalid guild selection.')
      return
    }
    if (!eligibility.eligible) {
      setResult({ kind: 'ineligible', data: eligibility })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    try {
      await submitApplication({
        discordId: discordId.trim(),
        guildId,
        guildBossScore: scoreNum,
        accountType: accountType as AccountType,
        profileImage,
        guildBossScreenshot: guildBossShot,
        battleTierScreenshot: battleTierShot,
        hunters,
        weapons,
        successor,
      })
      setResult({ kind: 'success', guildName: eligibility.guild.name })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Submission failed. Try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (result?.kind === 'success') {
    return <SuccessCard guildName={result.guildName} />
  }

  return (
    <div className="flex flex-col gap-6">
      {result?.kind === 'ineligible' && (
        <IneligibleBanner
          data={result.data}
          onPick={(id) => {
            setGuildId(id)
            setResult(null)
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Section
          index={1}
          title="Identity"
          icon={Users}
          description="Tell us who you are and where you want to serve."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr]">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">
                Profile Image
              </Label>
              <div className="w-32">
                <ImageSlot value={profileImage} onChange={setProfileImage} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discordId">Discord ID</Label>
                <Input
                  id="discordId"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  placeholder="e.g. username or 123456789012345678"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="guild">Guild Selection</Label>
                <Select value={guildId} onValueChange={setGuildId}>
                  <SelectTrigger id="guild" className="w-full">
                    <SelectValue placeholder="Choose a guild" />
                  </SelectTrigger>
                  <SelectContent>
                    {GUILDS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name} — {g.tier} ({g.open ? 'Open' : g.contribution})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="score">Guild Boss Score</Label>
                <Input
                  id="score"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 2500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="account">Account Type</Label>
                <Select
                  value={accountType}
                  onValueChange={(v) => setAccountType(v as AccountType)}
                >
                  <SelectTrigger id="account" className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Section>

        <Section
          index={2}
          title="Verification"
          icon={ShieldQuestion}
          description="Screenshots to verify your progress."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageSlot
              value={guildBossShot}
              onChange={setGuildBossShot}
              label="Guild Boss Screenshot"
              aspect="video"
            />
            <ImageSlot
              value={battleTierShot}
              onChange={setBattleTierShot}
              label="Battle Tier Screenshot"
              aspect="video"
            />
          </div>
        </Section>

        <Section
          index={3}
          title="Hunters"
          icon={Users}
          description="Upload 2 images for each element."
        >
          <ElementImageGroup value={hunters} onChange={updateElement(setHunters)} />
        </Section>

        <Section
          index={4}
          title="Weapons"
          icon={Swords}
          description="Upload 2 images for each element."
        >
          <ElementImageGroup value={weapons} onChange={updateElement(setWeapons)} />
        </Section>

        <Section
          index={5}
          title="Successor"
          icon={ShieldQuestion}
          description="Optional — up to 2 images."
        >
          <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
            {[0, 1].map((i) => (
              <ImageSlot
                key={i}
                value={successor[i]}
                onChange={(v) =>
                  setSuccessor((prev) =>
                    prev.map((val, idx) => (idx === i ? v : val)),
                  )
                }
              />
            ))}
          </div>
        </Section>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="box-glow w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:self-end"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit Application
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

function IneligibleBanner({
  data,
  onPick,
}: {
  data: EligibilityResult
  onPick: (id: string) => void
}) {
  if (data.eligible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Not eligible for {data.guild.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.guild.name} requires a Guild Boss Score of{' '}
            <span className="font-mono text-foreground">
              {data.guild.minScore}+
            </span>
            .{' '}
            {data.suggestion ? (
              <>
                Based on your score, the highest guild you qualify for is{' '}
                <span className="font-semibold text-accent">
                  {data.suggestion.name}
                </span>{' '}
                ({data.suggestion.tier}).
              </>
            ) : (
              'Unfortunately you do not currently meet the minimum for any guild — keep grinding and apply again soon.'
            )}
          </p>
          {data.suggestion && (
            <Button
              type="button"
              size="sm"
              className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => onPick(data.suggestion!.id)}
            >
              Apply to {data.suggestion.name} instead
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SuccessCard({ guildName }: { guildName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-strong box-glow mx-auto flex max-w-lg flex-col items-center rounded-2xl p-8 text-center sm:p-12"
    >
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-success/40 bg-success/15">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <h2 className="mt-6 font-serif text-2xl font-bold tracking-wide text-glow sm:text-3xl">
        Application Submitted Successfully
      </h2>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
        Your application to <span className="text-accent">{guildName}</span> has
        been received. Our managers will review your submission shortly. Join
        our Discord to stay in the loop and speed up your review.
      </p>
      <Button
        asChild
        size="lg"
        className="box-glow mt-7 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
          Join Discord
          <ArrowRight className="h-4 w-4" />
        </a>
      </Button>
    </motion.div>
  )
}
