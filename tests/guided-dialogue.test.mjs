import test from 'node:test';
import assert from 'node:assert/strict';
import {guideIntent,guidedIntents} from '../assets/guided-dialogue.js';
test('pilot intent registry',()=>assert(guidedIntents.length>=7));
test('identity route is safe',()=>{const r=guideIntent('I need to renew my ID');assert.equal(r.intent,'identity');assert(r.links.some(x=>x.href==='/service-identity.html'));assert(!r.reply.includes('approved'));});
test('payments are explicitly non-operational',()=>{const r=guideIntent('How do I pay with my wallet?');assert.equal(r.intent,'payments');assert.match(r.reply,/No money is moved/);});
test('unknown prompts fall back without inventing a service',()=>assert.equal(guideIntent('something unrelated').intent,'fallback'));
test('unreviewed language safely falls back',()=>{const r=guideIntent('passport',{locale:'ng'});assert.equal(r.intent,'fallback');assert.match(r.reply,/not yet verified/);});
test('input is bounded and Unicode normalized',()=>assert.equal(guideIntent('ＩＤ').intent,'identity'));
