import {icon, search, walletHomeUrl} from './ui.mjs';

const symbols = {
  chat: '<path fill="currentColor" fill-rule="evenodd" d="M12 2a10 10 0 0 0-9.3 13.7L2 22l6-2.1A10 10 0 1 0 12 2Zm-4 9.7c0-2 2.2-3.7 4.6-3.7 1.9 0 3.2.9 3.2 2.1 0 1.1-1 1.7-2.4 1.7h-1.8l-2.7 2.3.5-2.2c-.9-.1-1.4-.7-1.4-1.2Z"/>',
  people: '<path fill="currentColor" d="M7.3 11.1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.9 10.8a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6ZM1.3 19.9h12v-2.6a6 6 0 0 0-12 0v2.6Zm14 0h7.4v-2.6a5.8 5.8 0 0 0-7.9-5.4 7.9 7.9 0 0 1 .5 2.8v5.2Z"/>',
  card: '<path fill="currentColor" fill-rule="evenodd" d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 4v2h18V9H3Zm1 5v2h5v-2H4Z"/>',
  cap: '<path fill="currentColor" d="m.5 8.3 11.5-5 11.5 5L12 13.4.5 8.3ZM5.1 12v4.6c0 2.2 3.5 3.6 6.9 3.6s6.9-1.4 6.9-3.6V12L12 15l-6.9-3Zm15.4-1.3h1.6v7.6h-1.6z"/>',
  leaf: '<path fill="currentColor" d="M22 2C10 2.9 4 6.5 3.6 14.4c-.1 1.4.2 2.8.7 4.1l9.3-8.9L6 20.1c1.4.4 3.1.4 4.7 0C18 18.3 21.7 11.6 22 2Z"/>',
  pin: '<path fill="currentColor" fill-rule="evenodd" d="M12 1a8.9 8.9 0 0 0-9 8.9c0 5.4 6.6 11.6 8.3 13 .4.3 1 .3 1.4 0 1.7-1.4 8.3-7.6 8.3-13A8.9 8.9 0 0 0 12 1Zm0 5.7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>',
  mic: '<rect x="9" y="2" width="6" height="13" rx="3" fill="currentColor"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  send: '<path fill="currentColor" d="m3 2.8 19 9.2-19 9.2 2.6-7.5 8.4-1.7-8.4-1.7L3 2.8Z"/>',
  shield: '<path d="M12 2.8 20 6v5.1c0 5-3 8.4-8 10.1-5-1.7-8-5.1-8-10.1V6l8-3.2ZM8.6 11.8l2.2 2.3 4.6-4.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
};

const sceneIcon = name => `<svg class="scene-icon" viewBox="0 0 24 24" aria-hidden="true">${symbols[name]}</svg>`;
const topic = (name, symbol, label, path) =>
  `<a class="companion-bubble bubble-${name}" href="${path}">${sceneIcon(symbol)}<span>${label}</span></a>`;

export const companionHome = `
<section class="companion-stage" id="companion" data-companion aria-labelledby="companion-title">
  <div class="companion-scene">
    <div class="companion-art" id="companion-art">
      <img class="companion-character" src="/assets/namib-companion-scene.webp" width="1536" height="1536" fetchpriority="high" alt="The illustrated NamibOne Companion offering a welcoming hand in a Namibian landscape at sunset">
    </div>
    <header class="companion-heading">
      <h1 id="companion-title"><span>NamibOne</span> <span>Companion</span></h1>
      <p class="companion-language">Ask in your language</p>
      <span class="companion-stripes" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <p class="companion-tagline"><span>People</span><span>Opportunities</span><span>A brighter Namibia</span></p>
    </header>
    <div class="companion-welcome" id="companion-welcome">
      <button type="button" class="companion-bubble bubble-greeting" data-prompt="What services can I explore?">${sceneIcon('chat')}<span>How can I<br>help you today?</span></button>
      ${topic('information','people','Information<br>and services','/services.html')}
      ${topic('payments','card','Payments<br>and finances','/payments.html')}
      ${topic('learning','cap','Learning<br>and career','/department-education.html')}
      ${topic('community','leaf','Community<br>and civic life','/department-community.html')}
      ${topic('places','pin','Places and<br>local support','/department-local.html')}
    </div>
    <div class="companion-content">
      <button type="button" id="companion-new-chat" class="new-conversation">${icon('message')} New conversation</button>
      <section id="companion-conversation" tabindex="0" aria-label="Your conversation" hidden>
        <div id="companion-messages" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions"></div>
      </section>
      <form id="companion-form" class="companion-composer" aria-label="Ask your companion">
        <button type="button" id="companion-voice" class="companion-icon-button" aria-label="Dictate a message" disabled>${sceneIcon('mic')}</button>
        <label class="sr-only" for="companion-prompt">What would you like help with?</label>
        <textarea id="companion-prompt" name="prompt" rows="1" maxlength="1000" placeholder="Ask something…" autocomplete="off" spellcheck="true" aria-describedby="companion-mode companion-status"></textarea>
        <button type="submit" id="companion-send" class="companion-send" aria-label="Send message">${sceneIcon('send')}</button>
      </form>
      <p id="companion-status" class="companion-status" role="status" aria-live="polite"></p>
    </div>
    <ul class="companion-values" aria-label="NamibOne values" role="list">
      <li>${sceneIcon('shield')}<span>Safe</span></li>
      <li>${sceneIcon('people')}<span>Inclusive</span></li>
      <li>${sceneIcon('leaf')}<span>For a brighter<br>tomorrow</span></li>
    </ul>
    <p class="companion-pledge">Same<br>people<br>brighter<br>tomorrows</p>
  </div>
</section>
<div class="prototype-bar companion-preview">
  <span id="companion-mode"><strong>English service guide preview.</strong> Sample services and records. No live government transactions. Please leave out personal details.</span>
  <div class="companion-preview-actions">
    <a href="/about.html">About this pilot</a>
    <button class="motion-control" type="button" data-motion-toggle aria-pressed="false">${sceneIcon('pause')}<span data-motion-label>Pause animation</span></button>
  </div>
</div>
<section class="companion-browse" aria-labelledby="companion-browse-title">
  <h2 id="companion-browse-title">Search the service directory</h2>
  ${search('gateway-search','Find a service…')}
</section>
<div class="companion-bottom-note">
  <p id="offline-status" role="status">Preparing public pages for offline reading…</p>
  <a href="/department-business.html">Business and markets</a>
  <a href="/companion-wireframes.html">Companion wireframes</a>
</div>
<nav class="companion-mobile-nav" aria-label="Mobile navigation">
  <a href="/" aria-current="page">${icon('message')}<span>Companion</span></a>
  <a href="/services.html">${icon('grid')}<span>Services</span></a>
  <a href="${walletHomeUrl}">${icon('wallet')}<span>N1 Wallet</span></a>
  <a href="/citizen-dashboard.html">${icon('people')}<span>My space · demo</span></a>
</nav>`;
