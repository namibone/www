// Deterministic NamibOne pilot intent router. No model calls or collection of identity data.
// Matches explicit phrase patterns; low-confidence input receives a safe directory fallback.
const intents=[
 {id:'identity',patterns:[/\b(id|identity|passport|identification|national id)\b/i],reply:'I can help you explore the identity-document service preview. Official requirements must be confirmed with the responsible authority.',links:[['Identity document preview','/service-identity.html']]},
 {id:'vehicle',patterns:[/\b(vehicle|car|driving|licen[cs]e|renewal|registration)\b/i],reply:'You can explore the vehicle service preview. This is not a real licence renewal or payment.',links:[['Vehicle service preview','/service-vehicle.html']]},
 {id:'business',patterns:[/\b(business|company|entrepreneur|start.*shop|register.*business)\b/i],reply:'Here is the business service preview. It does not register a real business.',links:[['Business services','/department-business.html']]},
 {id:'learning',patterns:[/\b(learning|school|study|student|training|course|education|career|skills)\b/i],reply:'Explore learning and career support. These links demonstrate the pilot journey.',links:[['Learning and careers','/department-education.html']]},
 {id:'payments',patterns:[/\b(pay|payment|wallet|balance|money|transfer|finance)\b/i],reply:'You can explore sample payment and wallet experiences. No money is moved and no bank account is connected.',links:[['Sample payments','/payments.html'],['N1 Wallet concept','https://n1wallet.net/']]},
 {id:'status',patterns:[/\b(track|application|request status|my case|progress)\b/i],reply:'The citizen workspace demonstrates how an application could be tracked. I cannot retrieve a real application.',links:[['Sample applications','/citizen-applications.html']]},
 {id:'community',patterns:[/\b(help|community|support|family|local|council)\b/i],reply:'Explore community and local-service guidance. Please confirm urgent or official matters with an appropriate local service.',links:[['Community support','/service-support.html'],['Service directory','/services.html']]}
];
const fallback={intent:'fallback',confidence:0,reply:'I can guide you through the available service previews. Please choose a topic or ask about documents, education, business, payments, or applications. I cannot process real requests.',links:[{label:'Browse services',href:'/services.html'}],mode:'guided'};
export function guideIntent(message,{locale='en'}={}){
 const input=String(message??'').normalize('NFKC').trim().slice(0,1000);
 if(!input)return {...fallback};
 // The initial rules are English only; untranslated locales must not claim native-language understanding.
 if(locale!=='en')return {...fallback,reply:'Guided responses in this language are not yet verified. You can browse the service directory in English while translations are reviewed.'};
 const hits=intents.map(item=>({...item,score:item.patterns.reduce((n,re)=>n+(re.test(input)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 if(!hits.length)return {...fallback};
 const hit=hits[0];
 return {intent:hit.id,confidence:Math.min(.95,.7+hit.score*.1),reply:hit.reply,links:hit.links.map(([label,href])=>({label,href})),mode:'guided'};
}
export const guidedIntents=intents.map(({id})=>id);
