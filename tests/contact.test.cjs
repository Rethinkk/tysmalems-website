const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/contact.js');
const originalFetch = global.fetch;
const originalValues = Object.fromEntries(['RESEND_API_KEY','CONTACT_FROM','CONTACT_TO'].map(key => [key, process.env[key]]));
const payload = { name: 'Test visitor', company: 'Test company', email: 'visitor@example.test', country: 'NL', message: 'A test message', privacy: 'on' };
let sends;
beforeEach(() => {
  process.env.RESEND_API_KEY = 'unit-test-only';
  process.env.CONTACT_FROM = 'site@example.test';
  process.env.CONTACT_TO = 'inbox@example.test';
  sends = [];
  global.fetch = async (...args) => { sends.push(args); return { ok: true }; };
});
afterEach(() => { global.fetch = originalFetch; for (const [key,value] of Object.entries(originalValues)) { if(value === undefined) delete process.env[key]; else process.env[key] = value; } });
async function invoke(body = payload, extra = {}) {
  const response = { headers: {}, setHeader(key,value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await handler({ method: 'POST', headers: { host: 'site.example', origin: 'https://site.example', 'content-type': 'application/json' }, body, ...extra }, response);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  return response;
}
test('valid request sends only through mocked mail provider', async () => {
  const response = await invoke({ ...payload, name: 'A <b>visitor</b>', message: '<img src=x onerror=alert(1)>\n\nNext paragraph' });
  assert.equal(response.code, 200); assert.equal(sends.length, 1);
  assert.equal(sends[0][0], 'https://api.resend.com/emails');
  const email = JSON.parse(sends[0][1].body);
  assert.equal(email.to, 'inbox@example.test'); assert.equal(email.reply_to, payload.email);
  assert(!email.html.includes('<img')); assert(email.html.includes('&lt;img')); assert(email.html.includes('A &lt;b&gt;visitor&lt;/b&gt;'));
  assert(sends[0][1].signal instanceof AbortSignal);
});
test('unsupported methods do not send', async () => { const r = await invoke(payload,{method:'GET'}); assert.equal(r.code,405); assert.equal(r.headers.Allow,'POST'); assert.equal(sends.length,0); });
for (const [name, body, code] of [
  ['null',null,400], ['array',[],400], ['bad JSON','{',400], ['number',123,400],
  ['object field',{...payload,name:{}},400], ['array field',{...payload,email:[]},400],
  ['too long name',{...payload,name:'a'.repeat(121)},400], ['too long message',{...payload,message:'a'.repeat(4001)},400],
  ['oversized body',JSON.stringify({...payload,extra:'x'.repeat(17000)}),413],
  ['invalid email',{...payload,email:'not-an-email'},400], ['header injection',{...payload,name:'A\r\nBcc: someone@example.test'},400],
  ['missing privacy',{...payload,privacy:false},400], ['empty required field',{...payload,message:'  '},400],
  ['honeypot',{website:'bot'},200],
]) test(`${name} is handled without delivery`,async()=>{assert.equal((await invoke(body)).code,code);assert.equal(sends.length,0);});
for (const [name,headers,code] of [
  ['wrong origin',{host:'site.example',origin:'https://evil.example','content-type':'application/json'},403],
  ['missing origin',{host:'site.example','content-type':'application/json'},403],
  ['insecure external origin',{host:'site.example',origin:'http://site.example','content-type':'application/json'},403],
  ['wrong content type',{host:'site.example',origin:'https://site.example','content-type':'text/plain'},415],
]) test(`${name} is rejected`,async()=>{assert.equal((await invoke(payload,{headers})).code,code);assert.equal(sends.length,0);});
test('local development origin is supported',async()=>{assert.equal((await invoke(payload,{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000','content-type':'application/json; charset=utf-8'}})).code,200);});
test('missing mail configuration fails closed',async()=>{delete process.env.RESEND_API_KEY;assert.equal((await invoke()).code,503);assert.equal(sends.length,0);});
test('provider rejection returns generic error',async()=>{global.fetch=async()=>({ok:false});const r=await invoke();assert.equal(r.code,502);assert(!JSON.stringify(r.data).includes('unit-test-only'));});
test('provider network failure does not leak its error',async()=>{global.fetch=async()=>{throw Error('private provider diagnostics')};const r=await invoke();assert.equal(r.code,502);assert(!JSON.stringify(r.data).includes('private'));});
