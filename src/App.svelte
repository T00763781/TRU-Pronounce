<script>
  import { onDestroy, onMount, tick } from "svelte";

  const STORAGE_KEY = "tru-pronounce.phase0.lastConfig";
  const playIconUrl = new URL("../play.svg", import.meta.url).href;

  let config = {
    name: "Deiveek",
    syllables: ["DAY", "vik"],
    ipa: "ˈdeɪ.viːk",
    guidance: "Like David with a “K” instead of “D”",
    voiceId: null,
  };

  let lastTtsPayload = null;

  let ttsSupported = false;
  let voicesLoading = true;
  let voicesError = "";
  let localVoices = [];
  let localVoicesOpen = false;

  let nameEl;
  let ipaEl;
  let guidanceEl;
  let syllableEls = [];

  function setSyllableEl(node, index) {
    syllableEls[index] = node;

    return {
      destroy() {
        if (syllableEls[index] === node) syllableEls[index] = null;
      },
    };
  }

  function cleanText(text) {
    return (text ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  function bestEffortSyllables(name) {
    const cleaned = cleanText(name);
    if (!cleaned) return [""];

    const wordParts = cleaned
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/[\s-]+/)
      .filter(Boolean);

    if (wordParts.length > 1) return wordParts.map((p) => p.toUpperCase());

    const lower = cleaned.toLowerCase();
    const matches = lower.match(
      /[^aeiouy]*[aeiouy]+(?:[^aeiouy]+(?=[aeiouy]|$))?/g
    );
    const syllables = (matches && matches.length ? matches : [cleaned]).map((s) =>
      s.toUpperCase()
    );

    return syllables.length ? syllables : [cleaned.toUpperCase()];
  }

  function bestEffortIpa(name, syllables) {
    const cleaned = cleanText(name);
    if (!cleaned) return "";

    const base = (syllables || [])
      .map((s) => cleanText(s).toLowerCase())
      .filter(Boolean)
      .join(".");

    return base ? `ˈ${base}` : `ˈ${cleaned.toLowerCase()}`;
  }

  function regenerateFromName(nextName) {
    const nextSyllables = bestEffortSyllables(nextName);
    const nextIpa = bestEffortIpa(nextName, nextSyllables);

    config = {
      ...config,
      name: nextName,
      syllables: nextSyllables,
      ipa: nextIpa,
    };
  }

  function updateNameFromDom() {
    const nextName = nameEl ? cleanText(nameEl.textContent) : "";
    regenerateFromName(nextName);
  }

  function updateIpaFromDom() {
    const next = ipaEl ? cleanText(ipaEl.textContent) : "";
    config = { ...config, ipa: next };
  }

  function updateGuidanceFromDom() {
    const next = guidanceEl ? cleanText(guidanceEl.textContent) : "";
    config = { ...config, guidance: next };
  }

  function updateSyllableFromDom(index) {
    const el = syllableEls[index];
    const next = el ? cleanText(el.textContent).toUpperCase() : "";
    const nextSyllables = [...config.syllables];
    nextSyllables[index] = next;
    config = { ...config, syllables: nextSyllables };
  }

  function removeSyllable(index) {
    if (config.syllables.length <= 1) {
      config = { ...config, syllables: [""] };
      tick().then(() => syllableEls[0]?.focus());
      return;
    }

    const nextSyllables = config.syllables.filter((_, i) => i !== index);
    config = { ...config, syllables: nextSyllables };

    tick().then(() => {
      const nextIndex = Math.min(index, nextSyllables.length - 1);
      syllableEls[nextIndex]?.focus();
    });
  }

  function maybeRemoveEmptySyllable(index) {
    const value = cleanText(config.syllables[index]);
    if (!value) removeSyllable(index);
  }

  function addSyllable() {
    config = { ...config, syllables: [...config.syllables, ""] };
    tick().then(() => syllableEls[config.syllables.length - 1]?.focus());
  }

  function onPressEnterOrSpace(event, action) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  }

  function preventEnterNewline(event) {
    if (event.key === "Enter") event.preventDefault();
  }

  function handleSyllableKeydown(index, event) {
    preventEnterNewline(event);

    if (event.key === "Backspace") {
      const current = cleanText(config.syllables[index]);
      if (!current) {
        event.preventDefault();
        removeSyllable(index);
      }
    }
  }

  function detectVoices() {
    if (!ttsSupported) return;

    try {
      const voices = window.speechSynthesis.getVoices() || [];
      localVoices = voices.filter((v) => v && v.localService === true);
      voicesLoading = false;

      if (
        !config.voiceId ||
        !localVoices.some((v) => v.voiceURI === config.voiceId)
      ) {
        config = { ...config, voiceId: localVoices[0]?.voiceURI ?? null };
      }
    } catch {
      voicesLoading = false;
      voicesError = "Unable to detect voices in this browser.";
    }
  }

  function selectVoice(voiceURI) {
    config = { ...config, voiceId: voiceURI ?? null };
  }

  function buildSpokenNameText() {
    return (config.syllables || []).map(cleanText).filter(Boolean).join(", ");
  }

  function speakName() {
    if (!ttsSupported) return;

    const syllableParts = (config.syllables || []).map(cleanText).filter(Boolean);
    const instructionalText = syllableParts.join(", ");
    if (!instructionalText) return;
    const mergedText = syllableParts.join("-");
    const spokenText = `${instructionalText}. ${mergedText}`;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const voice =
      localVoices.find((v) => v.voiceURI === config.voiceId) ||
      (window.speechSynthesis.getVoices() || []).find(
        (v) => v.voiceURI === config.voiceId
      );
    if (voice) utterance.voice = voice;

    lastTtsPayload = {
      instructionalText,
      mergedText,
      spokenText,
      voiceId: config.voiceId ?? null,
      resolvedVoice: voice
        ? {
            voiceURI: voice.voiceURI,
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
          }
        : null,
      utterance: { text: spokenText },
    };

    window.speechSynthesis.speak(utterance);
  }

  function saveToDevice() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ config, ttsPayload: lastTtsPayload })
      );
    } catch {
      // Phase 0: silent failure is acceptable in constrained environments.
    }
  }

  function loadFromDevice() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      const source =
        parsed.config && typeof parsed.config === "object" ? parsed.config : parsed;

      config = {
        ...config,
        name: typeof source.name === "string" ? source.name : config.name,
        ipa: typeof source.ipa === "string" ? source.ipa : config.ipa,
        guidance:
          typeof source.guidance === "string" ? source.guidance : config.guidance,
        voiceId:
          typeof source.voiceId === "string" || source.voiceId === null
            ? source.voiceId
            : config.voiceId,
        syllables: Array.isArray(source.syllables)
          ? source.syllables.map((s) => (typeof s === "string" ? s : "")).slice(0, 12)
          : config.syllables,
      };
    } catch {
      // Ignore malformed saved state.
    }
  }

  function voiceRows(voices, perRow = 2) {
    const rows = [];
    for (let i = 0; i < voices.length; i += perRow) {
      rows.push(voices.slice(i, i + perRow));
    }
    return rows;
  }

  onMount(() => {
    loadFromDevice();

    ttsSupported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;

    if (!ttsSupported) {
      voicesLoading = false;
      voicesError = "Text-to-Speech is not supported in this browser.";
      return;
    }

    const handleVoicesChanged = () => detectVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);

    detectVoices();

    onDestroy(() => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged
      );
      window.speechSynthesis.cancel();
    });
  });
</script>

<main class="frame">
  <h1>pronounce/name</h1>

  <div class="pill-row">
    <div
      class="pill primary"
      bind:this={nameEl}
      contenteditable="true"
      role="textbox"
      aria-label="Name"
      tabindex="0"
      spellcheck="false"
      on:keydown={preventEnterNewline}
      on:input={updateNameFromDom}
    >
      {config.name}
    </div>
    <div class="pill secondary">
      /
      <span
        bind:this={ipaEl}
        contenteditable="true"
        role="textbox"
        aria-label="IPA"
        tabindex="0"
        spellcheck="false"
        on:keydown={preventEnterNewline}
        on:input={updateIpaFromDom}
        >{config.ipa}</span
      >/
    </div>
  </div>

  <div class="syllable-row">
    {#each config.syllables as s, i}
      <div
        class="syllable"
        use:setSyllableEl={i}
        contenteditable="true"
        role="textbox"
        aria-label="Syllable"
        tabindex="0"
        spellcheck="false"
        on:keydown={(e) => handleSyllableKeydown(i, e)}
        on:input={() => updateSyllableFromDom(i)}
        on:blur={() => maybeRemoveEmptySyllable(i)}
      >
        {s}
      </div>
    {/each}
    <div
      class="syllable add"
      role="button"
      tabindex="0"
      aria-label="Add syllable"
      on:click={addSyllable}
      on:keydown={(e) => onPressEnterOrSpace(e, addSyllable)}
    >
      +
    </div>
  </div>

  <div class="card">
    <h2>{config.name}</h2>
    <div class="syllable-row center">
      {#each config.syllables as s}
        <div class="syllable">{s}</div>
      {/each}
    </div>
    <div
      class="guide"
      bind:this={guidanceEl}
      contenteditable="true"
      role="textbox"
      aria-label="Sounds like"
      tabindex="0"
      spellcheck="false"
      on:keydown={preventEnterNewline}
      on:input={updateGuidanceFromDom}
    >
      {config.guidance}
    </div>
    <p class="listen">
      listen at <strong>tru.ca/pronounce</strong>
      <button
        type="button"
        aria-label="Play name"
        on:click={speakName}
        on:keydown={(e) => onPressEnterOrSpace(e, speakName)}
        style="background:transparent;border:0;padding:0;margin-left:.35rem;cursor:pointer;line-height:1;"
      >
        <img
          src={playIconUrl}
          alt="Play"
          style="width:1em;height:1em;vertical-align:-0.15em;display:inline-block;"
        />
      </button>
    </p>
  </div>

  <div
    class="accordion"
    role="button"
    tabindex="0"
    aria-expanded={localVoicesOpen}
    on:click={() => (localVoicesOpen = !localVoicesOpen)}
    on:keydown={(e) =>
      onPressEnterOrSpace(e, () => (localVoicesOpen = !localVoicesOpen))}
  >
    Detected Local Voice Models ▾
  </div>
  {#if localVoicesOpen}
    {#if voicesError}
      <div class="syllable-row">
        <div class="syllable add">{voicesError}</div>
      </div>
    {:else if voicesLoading}
      <div class="syllable-row">
        <div class="syllable add">Detecting voices…</div>
      </div>
    {:else if localVoices.length === 0}
      <div class="syllable-row">
        <div class="syllable add">No local voices detected.</div>
      </div>
    {:else}
      {#each voiceRows(localVoices) as row}
        <div class="syllable-row">
          {#each row as v (v.voiceURI)}
            <div
              class="syllable"
              class:add={v.voiceURI === config.voiceId}
              role="button"
              tabindex="0"
              aria-label="Select voice"
              on:click={() => selectVoice(v.voiceURI)}
              on:keydown={(e) =>
                onPressEnterOrSpace(e, () => selectVoice(v.voiceURI))}
              title={`${v.name} (${v.lang})`}
            >
              {v.name}
            </div>
          {/each}
        </div>
      {/each}
    {/if}
  {/if}

  <div class="accordion">Cloud Models ▾</div>
  <div class="accordion">Add your voice ▾</div>

  <div class="actions">
    <button on:click={saveToDevice}>save on device</button>
    <button>iframe</button>
    <button class="ghost">submit to library</button>
  </div>

  <footer>
    made by the<br />
    <strong>2025–2026 Intercultural Ambassador Team</strong>
  </footer>
</main>

<style>
  .frame {
    width: 390px;
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
  }

  h1 {
    color: var(--bg);
    margin-bottom: 1rem;
  }

  .pill-row {
    display: flex;
    gap: .5rem;
    justify-content: center;
    margin-bottom: .75rem;
  }

  .pill {
    padding: .5rem 1rem;
    border-radius: 999px;
    font-weight: 500;
  }

  .primary {
    background: var(--accent);
    color: white;
  }

  .secondary {
    background: var(--bg-dark);
    color: white;
  }

  .syllable-row {
    display: flex;
    justify-content: center;
    gap: .5rem;
    margin-bottom: 1rem;
  }

  .syllable {
    background: var(--accent);
    color: white;
    padding: .5rem 1rem;
    border-radius: 999px;
    font-size: .9rem;
  }

  .syllable.add {
    background: var(--bg-dark);
  }

  .card {
    background: var(--bg);
    color: white;
    border-radius: 16px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .card h2 {
    margin-top: 0;
  }

  .center {
    justify-content: center;
  }

  .guide {
    margin: .75rem 0 .25rem;
  }

  .listen {
    font-size: .85rem;
    opacity: .9;
  }

  .accordion {
    background: var(--bg-dark);
    color: white;
    padding: .75rem;
    border-radius: 999px;
    margin-bottom: .5rem;
    font-size: .9rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    gap: .5rem;
    margin: 1rem 0;
  }

  button {
    flex: 1;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 999px;
    padding: .6rem;
    font-size: .85rem;
  }

  button.ghost {
    background: var(--accent-soft);
  }

  footer {
    font-size: .75rem;
    color: #555;
  }
</style>
