// NamibOne progressive internationalisation foundation.
// English remains the canonical source for untranslated content.
// Locale choice is stored only in this browser; no personal data is transmitted.
const catalogs={
 en:{home:'Home',services:'Services',companion:'AI Companion',government:'Government services',wallet:'Finance & N1 Wallet',discover:'Discover',help:'Help & guidance',language:'Language',welcome:'People. Opportunities.',tomorrow:'A brighter tomorrow.',ask:'Ask something, or tell me what you need…',intro:'Your everyday platform for a better Namibia.'},
 af:{home:'Tuis',services:'Dienste',companion:'KI-metgesel',government:'Regeringsdienste',wallet:'Finansies en N1 Wallet',discover:'Ontdek',help:'Hulp en leiding',language:'Taal',welcome:'Mense. Geleenthede.',tomorrow:'’n Helderder môre.',ask:'Vra iets, of vertel my wat jy nodig het…',intro:'Jou alledaagse platform vir ’n beter Namibië.'},
 pt:{home:'Início',services:'Serviços',companion:'Assistente de IA',government:'Serviços públicos',wallet:'Finanças e N1 Wallet',discover:'Descobrir',help:'Ajuda e orientação',language:'Idioma',welcome:'Pessoas. Oportunidades.',tomorrow:'Um amanhã melhor.',ask:'Pergunte algo ou diga-me do que precisa…',intro:'A sua plataforma diária para uma Namíbia melhor.'},
 fr:{home:'Accueil',services:'Services',companion:'Assistant IA',government:'Services publics',wallet:'Finance et N1 Wallet',discover:'Découvrir',help:'Aide et conseils',language:'Langue',welcome:'Personnes. Opportunités.',tomorrow:'Un avenir meilleur.',ask:'Posez une question ou dites-moi ce dont vous avez besoin…',intro:'Votre plateforme quotidienne pour une Namibie meilleure.'},
 tn:{home:'Gae',services:'Ditirelo',companion:'AI Companion',government:'Ditirelo tsa puso',wallet:'Finance & N1 Wallet',discover:'Batlisisa',help:'Thuso le kaelo',language:'Puo',welcome:'Batho. Ditšhono.',tomorrow:'Isago e e botoka.',ask:'Botsa potso kgotsa o mpolelele se o se tlhokang…'},
 st:{home:'Lehae',services:'Ditshebeletso',companion:'AI Companion',government:'Ditshebeletso tsa mmuso',wallet:'Finance & N1 Wallet',discover:'Fumana',help:'Thuso le tataiso',language:'Puo',welcome:'Batho. Menyetla.',tomorrow:'Bokamoso bo betere.',ask:'Botsa potso kapa o mpolelle seo o se hlokang…'},
 sn:{home:'Kumba',services:'Masevhisi',companion:'AI Companion',government:'Masevhisi ehurumende',wallet:'Finance & N1 Wallet',discover:'Ongorora',help:'Rubatsiro nenhungamiro',language:'Mutauro',welcome:'Vanhu. Mikana.',tomorrow:'Ramangwana riri nani.',ask:'Bvunza mubvunzo kana kuti ndiudze zvaunoda…'},
 de:{home:'Startseite',services:'Dienste',companion:'KI-Begleiter',government:'Behördendienste',wallet:'Finanzen & N1 Wallet',discover:'Entdecken',help:'Hilfe & Informationen',language:'Sprache',welcome:'Menschen. Chancen.',tomorrow:'Eine bessere Zukunft.',ask:'Stellen Sie eine Frage oder sagen Sie, was Sie brauchen…',intro:'Ihre Plattform für ein besseres Namibia.'}
};
const select=document.querySelector('#site-language');
const getLocale=()=>{try{return localStorage.getItem('namibone.locale')}catch{return null}};
const saveLocale=v=>{try{localStorage.setItem('namibone.locale',v)}catch{}};
const preferred=(navigator.languages||[navigator.language||'en']).map(x=>x.toLowerCase().split('-')[0]).find(x=>Object.hasOwn(catalogs,x));
function applyLocale(locale){
 const lang=Object.hasOwn(catalogs,locale)?locale:'en',strings={...catalogs.en,...catalogs[lang]};
 document.documentElement.lang=lang;select.value=lang;
 for(const el of document.querySelectorAll('[data-i18n]')){const key=el.dataset.i18n;if(strings[key]){const label=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(label)label.textContent=strings[key];else el.textContent=strings[key]}}
 for(const el of document.querySelectorAll('[data-i18n-placeholder]')){const key=el.dataset.i18nPlaceholder;if(strings[key])el.setAttribute('placeholder',strings[key])}
 document.dispatchEvent(new CustomEvent('namibone:localechange',{detail:{locale:lang}}));
}
if(select){select.addEventListener('change',()=>{saveLocale(select.value);applyLocale(select.value)});applyLocale(getLocale()||preferred||'en')}
