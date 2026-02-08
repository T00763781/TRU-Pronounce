// UI label -> TTS-safe speak string.
// Keep speak strings lowercase to avoid acronym spelling.
export const MOUTH_SOUND_MAP = {
  ER: 'ur',
  AR: 'ahr',
  OR: 'or',
  SH: 'sh',
  CH: 'ch',
  TH: 'th',
  NG: 'ng',
  EE: 'ee',
  OO: 'oo',
  AY: 'ay',
  EYE: 'eye',
  OW: 'ow',
  AH: 'uh',
  UH: 'uh',
  OH: 'oh',
  L: 'luh',
  R: 'r',
  M: 'm',
  N: 'n',
  S: 's',
  T: 't',
  K: 'k',
  D: 'd',
  B: 'b',
  P: 'p',
  V: 'v',
  F: 'f',
  G: 'g',
  H: 'h',
  J: 'j',
  W: 'w',
  Y: 'y',
  Z: 'z',
}

// Super light fallback generator: produces "chips" (labels) and assigns speak via map.
// This is intentionally conservative; curated library should be the primary source.
export function generateChipsFromName(name) {
  const n = (name || '').trim()
  const lower = n.toLowerCase()
  if (!n) return { chips: [], sayAs: '' }

  // Common short-name heuristics (demo-quality). Extend via library over time.
  const shortOverrides = {
    'earl': { labels: ['ER', 'L'], sayAs: 'earl' },
    'sam': { labels: ['SA', 'M'], sayAs: 'sam' },
    'ng': { labels: ['NG'], sayAs: 'ng' },
  }
  if (shortOverrides[lower]) {
    const o = shortOverrides[lower]
    const chips = o.labels.map(label => ({ label, speak: (MOUTH_SOUND_MAP[label] || label.toLowerCase()) }))
    return { chips, sayAs: o.sayAs }
  }

  // Naive vowel-group chunking for longer names: split on vowel group boundaries.
  // Produces labels that are closer to syllables (DAY, vik) for the user to edit.
  const parts = lower.match(/[bcdfghjklmnpqrstvwxyz]*[aeiouy]+[bcdfghjklmnpqrstvwxyz]*/g) || [lower]
  const chips = parts
    .filter(Boolean)
    .slice(0, 5)
    .map(p => ({
      label: p.toUpperCase(),
      speak: p, // speak as plain text; user can refine via chips
    }))

  return { chips, sayAs: parts.join('-') }
}

export function buildPayload(chips, sayAs) {
  const teaching = chips.map(c => c.speak).join(', ')
  return `${teaching}. ${sayAs}`
}
