import React, { useEffect, useMemo, useState } from 'react'
import { SafeAreaView, View, Text, TextInput, Pressable, ScrollView, Platform } from 'react-native'
import Constants from 'expo-constants'
import { drawReading } from './src/lib/api'
import { scheduleReminder, requestPermissions } from './src/lib/reminders'
import { setupPurchases, checkPro, purchasePro, restorePro } from './src/lib/paywall'
import { Paywall } from './src/components/Paywall'

type Intent = 'decision_clarity' | 'relationship_dynamics' | 'career_money' | 'health_energy' | 'personal_growth' | 'open_reading'
type Timeframe = '7d' | '30d' | '90d' | '6m' | '1y'
type Voice = 'straight_talker' | 'gentle_coach' | 'mystical_poetic' | 'practical_strategist'
type Depth = 'quick' | 'standard' | 'deep'
type Spirituality = 'none' | 'light' | 'rich'

const INTENTS: { id: Intent; label: string }[] = [
  { id: 'decision_clarity', label: 'Decision clarity' },
  { id: 'relationship_dynamics', label: 'Relationship dynamics' },
  { id: 'career_money', label: 'Career or money' },
  { id: 'health_energy', label: 'Health and energy' },
  { id: 'personal_growth', label: 'Personal growth' },
  { id: 'open_reading', label: 'Open reading' },
]
const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }, { id: '6m', label: '6 months' }, { id: '1y', label: '1 year' }
]
const VOICES: { id: Voice; label: string }[] = [
  { id: 'straight_talker', label: 'Straight talker' },
  { id: 'gentle_coach', label: 'Gentle coach' },
  { id: 'mystical_poetic', label: 'Mystical poetic' },
  { id: 'practical_strategist', label: 'Practical strategist' },
]
const DEPTHS: { id: Depth; label: string }[] = [
  { id: 'quick', label: 'Quick' }, { id: 'standard', label: 'Standard' }, { id: 'deep', label: 'Deep' }
]
const SPIRIT: { id: Spirituality; label: string }[] = [
  { id: 'none', label: 'None' }, { id: 'light', label: 'Light' }, { id: 'rich', label: 'Rich' }
]

export default function App() {
  const [step, setStep] = useState<1|2|3|4>(1)
  const [intent, setIntent] = useState<Intent | null>(null)
  const [focus, setFocus] = useState('')
  const [timeframe, setTimeframe] = useState<Timeframe | null>(null)
  const [noTopics, setNoTopics] = useState('')
  const [excludePeople, setExcludePeople] = useState('')
  const [relationship, setRelationship] = useState('n/a')
  const [work, setWork] = useState('n/a')
  const [tone, setTone] = useState(3)
  const [voice, setVoice] = useState<Voice>('straight_talker')
  const [depth, setDepth] = useState<Depth>('standard')
  const [spirituality, setSpirituality] = useState<Spirituality>('light')
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<any | null>(null)
  const [pro, setPro] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => { (async () => { await setupPurchases(); setPro(await checkPro()) })(); }, [])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canNext1 = !!intent && focus.trim().length >= 8 && focus.trim().length <= 200 && !!timeframe

  async function onDraw() {
    if (!intent || !timeframe) return
    setLoading(true); setError(null)
    try {
      const seed = `${Date.now()}-${Math.random()}`
      const payload = {
        user_id: 'mobile',
        session_id: `${Date.now()}`,
        timestamp_iso: new Date().toISOString(),
        intent, focus_prompt: focus.trim(), timeframe,
        constraints: {
          no_topics: noTopics ? noTopics.split(',').map(s => s.trim()).filter(Boolean) : [],
          exclude_people: excludePeople ? excludePeople.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        context: { relationship_status: relationship, work_status: work, emotion_tone: tone },
        style: { voice, depth, spirituality },
        depth, deck: 'RWS', seed, allowReversals: true,
      }
      const out = await drawReading(payload)
      setResult(out)
      await requestPermissions()
      // schedule a soft reminder based on timeframe (client only; real push to be added later)
      if (timeframe === '7d') await scheduleReminder(7)
      else if (timeframe === '30d') await scheduleReminder(30)
    } catch (e: any) { setError(e?.message || String(e)) } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0c0f' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: '#e8e8ea', fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Threads of Fate</Text>
        {step === 1 && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: '#9aa0a6' }}>Pick one so I can aim the reading.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {INTENTS.map(i => (
                <Chip key={i.id} label={i.label} selected={intent === i.id} onPress={() => setIntent(i.id)} />
              ))}
            </View>
            <Text style={{ color: '#9aa0a6' }}>One sentence. What is the real question under your question.</Text>
            <TextInput value={focus} onChangeText={setFocus} placeholder='e.g., Should I accept the startup offer?' placeholderTextColor={'#666'} style={inputStyle} />
            <Text style={{ color: '#9aa0a6' }}>Pick the window you care about. I will read for that.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {TIMEFRAMES.map(t => (
                <Chip key={t.id} label={t.label} selected={timeframe === t.id} onPress={() => setTimeframe(t.id)} />
              ))}
            </View>
            <Primary title='Next' disabled={!canNext1} onPress={() => setStep(2)} />
          </View>
        )}
        {step === 2 && (
          <View style={{ gap: 12 }}>
            <TextInput value={noTopics} onChangeText={setNoTopics} placeholder='No-go topics (comma separated)' placeholderTextColor={'#666'} style={inputStyle} />
            <TextInput value={excludePeople} onChangeText={setExcludePeople} placeholder='Exclude people (comma separated)' placeholderTextColor={'#666'} style={inputStyle} />
            <TextInput value={relationship} onChangeText={setRelationship} placeholder='Relationship status (single/partnered/n/a)' placeholderTextColor={'#666'} style={inputStyle} />
            <TextInput value={work} onChangeText={setWork} placeholder='Work status (employed/freelance/founder/searching/n/a)' placeholderTextColor={'#666'} style={inputStyle} />
            <Primary title='Next' onPress={() => setStep(3)} />
          </View>
        )}
        {step === 3 && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: '#9aa0a6' }}>Style</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {VOICES.map(v => (<Chip key={v.id} label={v.label} selected={voice === v.id} onPress={() => setVoice(v.id)} />))}
            </View>
            <Text style={{ color: '#9aa0a6' }}>Depth & Spirituality</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {DEPTHS.map(d => {
                const proOnly = d.id === 'deep'
                const locked = proOnly && !pro
                return <Chip key={d.id} label={`${d.label}${proOnly ? ' (Pro)' : ''}`} selected={depth === d.id} onPress={() => locked ? null : setDepth(d.id)} />
              })}
              {SPIRIT.map(s => (<Chip key={s.id} label={`${s.label} spiritual`} selected={spirituality === s.id} onPress={() => setSpirituality(s.id)} />))}
            </View>
            <Checkbox checked={consent} onChange={setConsent} label='I understand this is guidance, not legal or medical advice.' />
            <Primary title={loading ? 'Drawing…' : 'Draw'} disabled={!consent || loading || (depth === 'deep' && !pro)} onPress={onDraw} />
            {!pro && depth === 'deep' && (
              <View style={{ flexDirection: 'row' }}>
                <Primary title='Unlock Pro' onPress={async () => { setShowPaywall(true) }} />
                <View style={{ width: 12 }} />
                <Primary title='Restore' onPress={async () => { const ok = await restorePro(); if (ok) { setPro(true); alert('Pro restored') } }} />
              </View>
            )}
            {error && <Text style={{ color: '#ff9ba6' }}>{error}</Text>}
          </View>
        )}
        {step === 3 && result?.output && (
          <View style={{ marginTop: 16, gap: 12 }}>
            <Text style={{ color: '#e8e8ea', fontSize: 18, fontWeight: '600' }}>{result.output.headline}</Text>
            <Text style={{ color: '#c2c2c5' }}>{result.output.summary}</Text>
            {result.output.position_readings.map((p: any, i: number) => (
              <View key={i} style={{ borderColor: '#232530', borderWidth: 1, borderRadius: 10, padding: 12 }}>
                <Text style={{ color: '#9aa0a6', fontSize: 12 }}>{p.position}</Text>
                <Text style={{ color: '#e8e8ea', fontWeight: '600' }}>{p.card}{p.reversed ? ' (reversed)' : ''}</Text>
                <Text style={{ color: '#c2c2c5' }}>{p.meaning}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={{ marginTop: 24, color: '#6b7280', fontSize: 12 }}>API: {Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE}</Text>
      </ScrollView>
      <Paywall open={showPaywall} onClose={() => setShowPaywall(false)} onPurchased={() => { setPro(true); setShowPaywall(false) }} />
    </SafeAreaView>
  )
}

function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: selected ? '#6b8cff' : '#2a2d3a', backgroundColor: selected ? '#1c2238' : '#12141a', marginRight: 8, marginBottom: 8 }}>
      <Text style={{ color: '#e8e8ea' }}>{label}</Text>
    </Pressable>
  )
}

function Primary({ title, disabled, onPress }: { title: string; disabled?: boolean; onPress?: () => void }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={{ opacity: disabled ? 0.5 : 1, backgroundColor: '#1d2030', borderColor: '#2a2d3a', borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
      <Text style={{ color: '#e8e8ea', fontWeight: '600' }}>{title}</Text>
    </Pressable>
  )
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: '#2a2d3a', backgroundColor: checked ? '#1c2238' : 'transparent' }} />
      <Text style={{ color: '#c2c2c5' }}>{label}</Text>
    </Pressable>
  )
}

const inputStyle = { color: '#e8e8ea', borderColor: '#2a2d3a', borderWidth: 1, borderRadius: 10, padding: 12 } as const
