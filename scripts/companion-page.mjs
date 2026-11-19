import {icon,search} from './ui.mjs';

const symbol = (name) => {
 const paths = {mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',send:'<path d="M12 20V4M5 11l7-7 7 7"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',pause:'<path d="M8 5v14M16 5v14"/>',leaf:'<path d="M20 3C8 2 2 7 5 15c8 5 16-1 15-12ZM4 21 15 10"/>'};
 return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};
const shortcut=(title,description,path,name,tone='')=>`<a class="companion-shortcut ${tone}" href="${path}"><span class="shortcut-icon">${icon(name)}</span><span><strong>${title}</strong><small>${description}</small></span>${icon('arrow')}</a>`;

export const companionHome = `
<section class="companion-stage" data-companion id="companion" aria-label="NamibOne Companion">
 <div class="companion-landscape" aria-hidden="true"></div>
 <div class="companion-content">
  <div class="companion-heading"><span class="companion-eyebrow">${symbol('spark')} NAMIBONE · EVERYTHING NAMIBIA</span><h1>People. Opportunities.<br><span>A brighter tomorrow.</span></h1></div>
  <div id="companion-welcome"><p class="companion-intro">Your everyday platform for a better Namibia.<br>Ask your NamibOne Companion or explore the services below.</p></div>
  <section id="companion-conversation" aria-label="Your conversation" hidden><div id="companion-messages" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions"></div></section>
  <form id="companion-form" class="companion-composer" aria-label="Ask your companion">
   <label class="sr-only" for="companion-prompt">What would you like help with?</label>
   <textarea id="companion-prompt" name="prompt" rows="2" maxlength="1000" placeholder="Ask something, or tell me what you need…" autocomplete="off" spellcheck="true" aria-describedby="companion-mode companion-status"></textarea>
   <div class="composer-toolbar"><span id="companion-mode" class="companion-mode"><span aria-hidden="true"></span>Service guide preview</span><div class="composer-actions"><button type="button" id="companion-voice" class="companion-icon-button" aria-label="Dictate a message" title="Dictate a message">${symbol('mic')}</button><button type="submit" id="companion-send" class="companion-send" aria-label="Send message" title="Send message">${symbol('send')}</button></div></div>
  </form>
  <p id="companion-status" class="companion-status" role="status" aria-live="polite">Explore the preview with a question. Please leave out personal details.</p>
  <div class="starter-prompts" aria-label="Ideas to get started"><button type="button" data-prompt="Help me renew my identity document">Renew my ID ${icon('arrow')}</button><button type="button" data-prompt="Find learning opportunities">Find learning opportunities ${icon('arrow')}</button><button type="button" data-prompt="How can I start a small business?">Start a business ${icon('arrow')}</button></div>
 </div>
 <figure id="companion-art" class="companion-art"><div class="companion-halo" aria-hidden="true"></div><img class="companion-character" src="/assets/namib-companion.webp" alt="Your friendly Namibian companion in a teal and cream outfit, offering a welcoming hand" width="680" height="907" fetchpriority="high"><figcaption><span class="companion-stripes" aria-hidden="true"><i></i><i></i><i></i><i></i></span><strong>NamibOne Companion</strong><span>Ask in your language.</span></figcaption></figure><button class="motion-control" type="button" data-motion-toggle aria-pressed="false">${symbol('pause')}<span data-motion-label>Pause motion</span></button>
</section>
<section class="companion-explore" aria-labelledby="companion-explore-title"><div class="section-head"><div><span class="eyebrow">A PLACE TO BEGIN</span><h2 id="companion-explore-title">Explore everything Namibia.</h2></div><a href="/services.html">Browse services ${icon('arrow')}</a></div><nav class="companion-shortcut-grid" aria-label="Explore by topic">
 ${shortcut('Government services','Access information and essential services','/services.html','identity')}
 ${shortcut('Learning & careers','Learn, grow and succeed','/department-education.html','book','blue')}
 ${shortcut('Farming & markets','Grow, trade and thrive','/department-business.html','briefcase','warm')}
 ${shortcut('Places & local help','Start with your community','/department-local.html','pin','earth')}
 ${shortcut('Finance & N1 Wallet','Explore the wallet preview','https://n1wallet.net/','wallet','blue')}
 ${shortcut('Community & support','Find guidance and support','/department-community.html','people')}
 </nav></section>
<section class="companion-browse" aria-label="Search the service directory"><div><strong>Prefer to browse?</strong><p>Find a service by name in the preview directory.</p></div>${search('gateway-search','Search the service directory…')}</section>
<div class="companion-bottom-note"><p id="offline-status" role="status">Preparing public pages for offline reading…</p><a href="/companion-wireframes.html">View the mobile & desktop wireframes</a></div>
<nav class="companion-mobile-nav" aria-label="Mobile navigation"><a href="/" aria-current="page">${icon('message')}<span>Companion</span></a><a href="/services.html">${icon('grid')}<span>Services</span></a><a href="/citizen-dashboard.html">${icon('people')}<span>My space · demo</span></a></nav>`;
