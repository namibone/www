import {services} from './data.js';

// Conversation content stays in memory. A configured API receives text only
// after the person explicitly sends it; this module never stores or logs it.
const host = document.querySelector('[data-companion]');
if (host) initialiseCompanion(host);

function initialiseCompanion(root) {
  const find = selector => document.querySelector(selector);
  const form = find('#companion-form');
  const input = find('#companion-prompt');
  const send = find('#companion-send');
  const voice = find('#companion-voice');
  const status = find('#companion-status');
  const messages = find('#companion-messages');
  const welcome = find('#companion-welcome');
  const conversation = find('#companion-conversation');
  const newChat = find('#companion-new-chat');
  const art = find('#companion-art');
  const motionButtons = [...document.querySelectorAll('[data-motion-toggle]')];
  if (!form || !input || !send || !status || !messages || !conversation) return;

  const MAX_LENGTH = 1000;
  const MAX_TURNS = 30;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const keyboardHint = 'Use the microphone on your keyboard or type your question.';
  const voiceLabel = Recognition ? 'Dictate your question' : 'Use keyboard dictation';
  let turns = [];
  let generation = 0;
  let pending = false;
  let controller;
  let recognition;
  let finishingDictation = false;
  let motionPaused = media.matches;

  input.maxLength = MAX_LENGTH;
  form.noValidate = true;
  const setStatus = text => { status.textContent = text; };
  const setPending = value => {
    pending = value;
    send.disabled = value;
    form.setAttribute('aria-busy', String(value));
    if (voice) voice.disabled = value;
  };

  function applyMotion() {
    const paused = motionPaused || media.matches;
    root.classList.toggle('motion-paused', paused);
    art?.classList.toggle('motion-paused', paused);
    for (const button of motionButtons) {
      button.setAttribute('aria-pressed', String(paused));
      button.disabled = media.matches;
      const label = media.matches ? 'Motion off' : paused ? 'Resume animation' : 'Pause animation';
      button.setAttribute('aria-label', label);
      const labelNode = button.querySelector('[data-motion-label]');
      if (labelNode) labelNode.textContent = label;
      else button.textContent = label;
      button.title = media.matches ? 'Animation is disabled by your reduced-motion preference.' : '';
    }
  }
  motionButtons.forEach(button => button.addEventListener('click', () => {
    motionPaused = !motionPaused;
    applyMotion();
  }));
  media.addEventListener('change', () => { motionPaused = media.matches; applyMotion(); });
  applyMotion();

  function showConversation() {
    if (welcome) welcome.hidden = true;
    conversation.hidden = false;
    root.classList.add('has-conversation');
  }

  function appendMessage(role, text, links = [], label) {
    const followLatest = role === 'user' || conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 72;
    const article = document.createElement('article');
    article.className = `companion-message ${role}`;
    const author = document.createElement('p');
    author.className = 'companion-message-author';
    author.textContent = role === 'user' ? 'You' : label || 'OneNam · Service guide preview';
    const content = document.createElement('p');
    content.className = 'companion-message-content';
    content.textContent = text;
    article.append(author, content);
    if (links.length) {
      const list = document.createElement('ul');
      list.className = 'companion-result-links';
      for (const link of links) {
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.className = 'companion-result-link';
        anchor.href = link.href;
        anchor.textContent = link.label;
        item.append(anchor);
        list.append(item);
      }
      article.append(list);
    }
    messages.append(article);
    if (followLatest) requestAnimationFrame(() => {
      if (!conversation.hidden) conversation.scrollTop = conversation.scrollHeight;
    });
    return article;
  }

  function localGuidance(text) {
    const term = text.toLocaleLowerCase('en').normalize('NFKC');
    const keywords = {
      identity: /\b(identity|id|passport|identification)\b/,
      certificate: /\b(certificate|birth|marriage|civil)\b/,
      vehicle: /\b(vehicle|car|licen[cs]e|driving|transport|renewal)\b/,
      municipal: /\b(municipal|council|account|utility|utilities|water|electricity)\b/,
      report: /\b(report|streetlight|pothole|road|issue)\b/,
      business: /\b(business|enterprise|company|entrepreneur|register)\b/,
      education: /\b(learning|learn|education|school|study|student|career|training|skills|course)\b/,
      support: /\b(community|support|assistance|family|help)\b/,
    };
    const matched = services.filter(service => keywords[service.id]?.test(term)).slice(0, 3);
    if (/\b(track|application|request|status)\b/.test(term)) {
      return {text:'You can explore how requests are tracked in the sample citizen workspace. Its records are demonstrations; I cannot look up a real application.', links:[{label:'Explore sample applications',href:'/citizen-applications.html'},...matched.map(serviceLink)]};
    }
    if (/\b(pay|payment|wallet|finance|money|balance)\b/.test(term)) {
      return {text:'The payment area demonstrates balances, review and receipts using sample records. It does not move money or connect to a real bank account.',links:[{label:'Explore the payment preview',href:'/payments.html'},{label:'Browse all service previews',href:'/services.html'}]};
    }
    if (matched.length) {
      return {text:'Here are service previews related to your question. These are links selected from the local catalogue, not a generated AI answer. Open a preview to explore the next steps.',links:matched.map(serviceLink)};
    }
    return {text:'I can guide you to the service previews available here. Live AI conversations are not connected yet. You can explore the catalogue, learning support or community assistance below.',links:[{label:'Browse all service previews',href:'/services.html'},{label:'Explore learning support',href:'/service-education.html'},{label:'Explore community assistance',href:'/service-support.html'}]};
  }
  function serviceLink(service) { return {label:service.name,href:`/service-${service.id}.html`}; }

  function resetDictation(cancel = true) {
    const previous = recognition;
    recognition = undefined;
    finishingDictation = false;
    if (previous) {
      previous.onstart = previous.onresult = previous.onerror = previous.onend = null;
      if (cancel) {
        try { previous.abort(); } catch { /* Already stopped. */ }
      }
    }
    if (voice) {
      if (Recognition) voice.setAttribute('aria-pressed', 'false');
      voice.setAttribute('aria-label', voiceLabel);
    }
  }

  function endpointURL() {
    const configured = root.dataset.companionEndpoint?.trim();
    if (!configured) return null;
    const url = new URL(configured, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith('/api/') || url.username || url.password || url.search || url.hash) {
      throw new Error('Invalid endpoint configuration');
    }
    return url;
  }

  async function submit() {
    if (pending) return;
    const text = input.value.trim();
    if (!text) { setStatus('Type a question to start.'); input.focus(); return; }
    if (text.length > MAX_LENGTH) { setStatus('Keep your question to 1,000 characters or fewer.'); input.focus(); return; }
    if (turns.filter(turn => turn.role === 'user').length >= MAX_TURNS) {
      setStatus('Start a new conversation to continue. This preview keeps up to 30 questions in memory.');
      newChat?.focus();
      return;
    }
    resetDictation();
    const token = generation;
    const history = turns.slice(-10).map(({role,content}) => ({role,content}));
    turns.push({role:'user',content:text});
    appendMessage('user', text);
    showConversation();
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    setPending(true);
    setStatus('Preparing your response…');
    let timer;
    try {
      const endpoint = endpointURL();
      if (!endpoint || !navigator.onLine) {
        const guidance = localGuidance(text);
        appendMessage('assistant', guidance.text, guidance.links);
        turns.push({role:'assistant',content:guidance.text});
        setStatus(navigator.onLine ? 'Service guide preview · No question was sent to an AI provider.' : 'You’re offline. Showing local service guidance; saved public pages remain available.');
      } else {
        const requestController = new AbortController();
        controller = requestController;
        timer = setTimeout(() => requestController.abort(), 20_000);
        const response = await fetch(endpoint, {
          method:'POST', credentials:'same-origin', cache:'no-store',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body:JSON.stringify({message:text,history}), signal:requestController.signal,
        });
        if (!response.ok) throw new Error('Response unavailable');
        const data = await response.json();
        if (typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 20_000) throw new Error('Invalid response');
        if (token !== generation) return;
        appendMessage('assistant',data.reply,[],'OneNam · AI companion');
        turns.push({role:'assistant',content:data.reply});
        setStatus('AI response received. Check important details with the responsible service.');
      }
    } catch {
      if (token !== generation) return;
      const guidance = localGuidance(text);
      appendMessage('assistant','Live AI is unavailable right now. You can still explore the service previews below.',guidance.links);
      setStatus('AI could not respond. Your conversation is still here; try another question or use a service link.');
    } finally {
      clearTimeout(timer);
      if (token === generation) {
        controller = undefined;
        setPending(false);
        input.focus({preventScroll:true});
      }
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); void submit(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void submit();
    }
  });
  document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => {
    input.value = (button.dataset.prompt || button.textContent.trim()).slice(0, MAX_LENGTH);
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.focus();
    setStatus('Suggested question added. Edit it or send when you’re ready.');
  }));

  newChat?.addEventListener('click', () => {
    generation++;
    controller?.abort();
    controller = undefined;
    resetDictation();
    turns = [];
    messages.replaceChildren();
    conversation.hidden = true;
    if (welcome) welcome.hidden = false;
    root.classList.remove('has-conversation');
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    setPending(false);
    setStatus('New conversation. Previous messages have been cleared from this page.');
    if (document.documentElement.classList.contains('menu-open')) {
      document.documentElement.classList.remove('menu-open');
      const navigationToggle = find('.mobile-toggle');
      navigationToggle?.setAttribute('aria-expanded', 'false');
      navigationToggle?.setAttribute('aria-label', 'Open navigation');
    }
    input.focus();
  });

  if (voice) {
    voice.disabled = false;
    resetDictation();
    voice.title = Recognition ? 'Dictation uses your browser’s speech service. Review the text before sending.' : keyboardHint;
    voice.addEventListener('click', () => {
      if (pending || finishingDictation) return;
      if (!Recognition) {
        setStatus(keyboardHint);
        input.focus();
        return;
      }
      if (recognition) {
        finishingDictation = true;
        setStatus('Finishing dictation…');
        try { recognition.stop(); } catch {
          resetDictation();
          setStatus(`Dictation ended early. ${keyboardHint}`);
        }
        return;
      }
      try {
        const current = new Recognition();
        recognition = current;
        let hasTranscript = false;
        current.lang = 'en-ZA';
        current.continuous = false;
        current.interimResults = false;
        current.maxAlternatives = 1;
        current.onstart = () => {
          if (recognition === current && !finishingDictation) {
            setStatus('Listening through your browser’s speech service. Review your text before sending.');
          }
        };
        current.onresult = event => {
          if (recognition !== current) return;
          const dictated = Array.from(event.results).slice(event.resultIndex ?? 0)
            .filter(result => result.isFinal).map(result => result[0].transcript).join(' ').trim();
          if (!dictated) return;
          hasTranscript = true;
          const prefix = input.value.trim();
          input.value = `${prefix}${prefix ? ' ' : ''}${dictated}`.slice(0, MAX_LENGTH);
          input.dispatchEvent(new Event('input', {bubbles:true}));
          setStatus('Dictation added. Review your question, then send it.');
          input.focus();
        };
        current.onerror = event => {
          if (recognition !== current) return;
          resetDictation();
          const reasons = {
            'not-allowed': 'Your browser did not allow dictation. Check microphone access for NamibOne.',
            'service-not-allowed': 'This browser could not start its speech service.',
            'audio-capture': 'The browser could not access a microphone.',
            'no-speech': 'No speech was detected.',
            'network': 'The browser could not reach its speech service.',
            'language-not-supported': 'The browser’s speech service could not use the selected language.',
          };
          setStatus(`${reasons[event.error] ?? 'Dictation is unavailable right now.'} Tap the question box. ${keyboardHint}`);
        };
        current.onend = () => {
          if (recognition !== current) return;
          resetDictation(false);
          if (!hasTranscript) setStatus(`No speech was captured. Tap the question box. ${keyboardHint}`);
        };
        voice.setAttribute('aria-pressed','true');
        voice.setAttribute('aria-label','Stop dictation');
        setStatus('Starting dictation. Allow microphone access if your browser asks.');
        current.start();
      } catch {
        resetDictation();
        setStatus(`Dictation could not start. Tap the question box. ${keyboardHint}`);
      }
    });
  }
  addEventListener('pagehide', () => { generation++; controller?.abort(); resetDictation(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && recognition) {
      resetDictation();
      setStatus('Dictation stopped when you left the page. Review your question before sending.');
    }
  });
}
