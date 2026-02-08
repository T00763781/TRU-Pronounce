<script>
  import { onMount } from 'svelte'
  import { listLocalVoices, speak } from './lib/speech.js'
  import { generateChipsFromName, buildPayload } from './lib/mouthSoundMap.js'

  const LIB_BASE = import.meta.env.VITE_LIBRARY_BASE_URL || ''

  let name = 'Deiveek'
  let status = ''
  let voices = []
  let selectedVoiceURI = ''
  let selectedVoice = null

  let libraryIndex = null
  let matches = []
  let selectedCard = null

  let chips = []
  let sayAs = ''
  let hint = ''

  async function loadLibrary() {
    status = 'Loading library...'
    try {
      const idx = await fetch(`${LIB_BASE}/index.json`, { cache: 'no-cache' }).then(r => r.json())
      libraryIndex = idx
      status = ''
    } catch (e) {
      status = `Library load failed. Set VITE_LIBRARY_BASE_URL. (${e?.message || e})`
    }
  }

  async function loadCard(cardId) {
    const card = await fetch(`${LIB_BASE}/cards/${cardId}.json`, { cache: 'no-cache' }).then(r => r.json())
    return card
  }

  function normalizeKey(s) {
    return (s || '').trim().toLowerCase().replace(/[^a-z0-9\-]+/g, '-').replace(/\-+/g, '-').replace(/^\-|\-$/g, '')
  }

  async function updateFromName() {
    const key = normalizeKey(name)
    matches = []
    selectedCard = null

    // search curated library by exact cardId or exact name match
    if (libraryIndex?.cards?.length) {
      const exact = libraryIndex.cards.filter(c => c.cardId === key || (c.name || '').toLowerCase() === (name || '').trim().toLowerCase())
      matches = exact.slice(0, 8)

      if (matches.length) {
        // show variants below; auto-select first
        const card = await loadCard(matches[0].cardId)
        applyCard(card)
        return
      }
    }

    // fallback generator
    const gen = generateChipsFromName(name)
    chips = gen.chips
    sayAs = gen.sayAs || (name || '').toLowerCase()
    hint = ''
  }

  function applyCard(card) {
    selectedCard = card
    name = card.name
    chips = (card.pronunciation?.chips || []).map(c => ({ label: c.label, speak: c.speak }))
    sayAs = card.pronunciation?.sayAs || (card.name || '').toLowerCase()
    hint = card.pronunciation?.hint || ''
  }

  function refreshSelectedVoice() {
    selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI) || null
  }

  function onPlay() {
    if (!chips.length) return
    const payload = buildPayload(chips, sayAs)
    try {
      speak(payload, selectedVoice, { rate: 0.95, pitch: 1.0, volume: 1.0 })
    } catch (e) {
      status = `Play failed: ${e?.message || e}`
    }
  }

  function addChip() {
    chips = [...chips, { label: 'NEW', speak: 'new' }]
  }

  function exportSubmission() {
    const cardId = normalizeKey(name)
    const payload = buildPayload(chips, sayAs)
    const submission = {
      schemaVersion: '0.2',
      cardId,
      name: name.trim(),
      pronunciation: { chips, sayAs, hint },
      tts: { engine: 'web-speech-api', payload, voice: selectedVoice ? {
        voiceURI: selectedVoice.voiceURI, name: selectedVoice.name, lang: selectedVoice.lang, localService: selectedVoice.localService
      } : undefined },
      meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), source: 'user-submission' }
    }
    const blob = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cardId}.json`
    a.click()
    URL.revokeObjectURL(url)
    status = 'Downloaded submission JSON. Upload it to the Submission Inbox repo (cards/).'
  }

  onMount(async () => {
    // voices load async in some browsers
    const loadVoices = () => {
      voices = listLocalVoices()
      if (!selectedVoiceURI && voices.length) selectedVoiceURI = voices[0].voiceURI
      refreshSelectedVoice()
    }
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices)
    loadVoices()

    if (LIB_BASE) await loadLibrary()
    await updateFromName()
  })
</script>

<style>
  :global(body){ font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin:0; background:#0b2b33; color:#e8f2f4;}
  .wrap{max-width:980px;margin:0 auto;padding:24px; display:grid; gap:24px; grid-template-columns: 1fr 380px;}
  .card{background:#0f3b45;border-radius:18px;padding:18px; box-shadow: 0 10px 30px rgba(0,0,0,.25);}
  .title{font-size:34px; font-weight:800; color:#42d1c5; letter-spacing:-0.02em;}
  .sub{opacity:.85; line-height:1.4}
  .builder{background:#1a8ea2;border-radius:22px;padding:18px;}
  .name{font-size:26px; font-weight:800; text-align:center; margin:4px 0 12px;}
  .chips{display:flex; gap:10px; justify-content:center; flex-wrap:wrap;}
  .chip{background:#f5f1de; color:#07343c; border-radius:999px; padding:8px 12px; display:flex; gap:8px; align-items:center;}
  .chip input{width:72px; border:none; outline:none; background:transparent; font-weight:800; text-transform:uppercase;}
  .chip small{opacity:.7}
  .hint{background:#f5f1de; color:#07343c; border-radius:999px; padding:8px 12px; margin:10px auto 0; max-width:320px; text-align:center;}
  .bar{background:#08313a;border-radius:999px;padding:10px 12px; text-align:center; font-weight:800; margin:12px 0;}
  .voices{display:grid; gap:10px;}
  select{width:100%; padding:10px 12px; border-radius:12px; border:none;}
  button{border:none;border-radius:999px;padding:12px 14px;font-weight:800; cursor:pointer;}
  .row{display:flex; gap:10px; justify-content:center; flex-wrap:wrap;}
  .btn-red{background:#df2b6d;color:white}
  .btn-green{background:#20c997;color:#08313a}
  .btn-yellow{background:#ffd43b;color:#08313a}
  .btn-teal{background:#21d4c6;color:#08313a}
  .status{margin-top:10px; opacity:.9; font-size:13px;}
  .variants{display:grid; gap:10px;}
  .variant{background:#0c3640;border-radius:16px;padding:12px;}
  .variant h4{margin:0 0 6px 0}
  .variant .mini{display:flex; gap:8px; flex-wrap:wrap}
  .mini span{background:#f5f1de; color:#07343c; border-radius:999px; padding:4px 8px; font-weight:800; font-size:12px;}
</style>

<div class="wrap">
  <div>
    <div class="card">
      <div class="title">Name/builder</div>
      <p class="sub">
        Type a name. If it exists in the curated library, variants appear below. Otherwise, we generate teaching chips you can edit.
      </p>
      {#if status}<div class="status">{status}</div>{/if}
    </div>

    <div class="card" style="margin-top:16px;">
      <div style="display:flex; gap:10px; align-items:center;">
        <input style="flex:1; padding:12px 14px; border-radius:14px; border:none;" bind:value={name} placeholder="Type your name..." on:input={() => updateFromName()} />
        <button class="btn-teal" on:click={updateFromName}>Update</button>
      </div>
      <div class="status">Natural: <b>{sayAs}</b></div>

      {#if matches.length}
        <div class="bar">Library Variants</div>
        <div class="variants">
          {#each matches as m}
            <div class="variant">
              <h4>{m.name}</h4>
              <button class="btn-yellow" on:click={async ()=> applyCard(await loadCard(m.cardId))}>Use {m.cardId}</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="builder">
    <div class="name">{name}</div>

    <div class="chips">
      {#each chips as c, i}
        <div class="chip">
          <input bind:value={c.label} on:input={(e)=>{ chips[i].label = e.target.value.toUpperCase(); chips = [...chips] }} />
          <small>→</small>
          <input style="width:90px; text-transform:none; font-weight:700;" bind:value={c.speak} on:input={(e)=>{ chips[i].speak = e.target.value.toLowerCase(); chips = [...chips] }} />
        </div>
      {/each}
      <button class="btn-yellow" on:click={addChip}>+</button>
    </div>

    {#if hint}
      <div class="hint">{hint}</div>
    {/if}

    <div class="bar">Detected Local Voice Models</div>
    <select bind:value={selectedVoiceURI} on:change={refreshSelectedVoice}>
      {#each voices as v}
        <option value={v.voiceURI}>{v.name} — {v.lang}</option>
      {/each}
    </select>

    <div class="bar">Add Your Voice</div>
    <div class="row">
      <button class="btn-red" disabled>Record</button>
      <button class="btn-green" on:click={onPlay}>Play</button>
      <button class="btn-yellow" disabled>Save</button>
    </div>

    <div class="row" style="margin-top:12px;">
      <button class="btn-teal" on:click={exportSubmission}>Save Name</button>
      <button class="btn-green" on:click={exportSubmission}>Add to library</button>
    </div>

    <div class="status">
      Tip: edit the right-hand "speak" values to avoid letter spelling (e.g., ER → ur; L → luh).
    </div>
  </div>
</div>
