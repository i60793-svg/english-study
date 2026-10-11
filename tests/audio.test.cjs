const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={app:{innerHTML:''},toast:{style:{}}},spoken=[],events=[];
const store=new Map([['word-roots-test-reset-20261004-2043','done']]);
const wordButton={dataset:{word:'occasionally'}};
const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},
 speechSynthesis:{cancel:()=>events.push('cancel'),speak:u=>{events.push('speak');spoken.push(u)}},
 SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},
 document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:selector=>selector==='[data-word]'?[wordButton]:[]}});
for(const f of ['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'])vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
assert.equal(spoken.length,0,'Home must not speak');
run('state.limit=5;start()');
assert.equal(spoken.length,1);assert.equal(spoken[0].text,run('active.word'));
assert.equal(spoken[0].lang,'en-US');assert.equal(spoken[0].rate,.85);
nodes.reveal.onclick();run('render()');assert.equal(spoken.length,1,'Reveal/re-render must not replay');
nodes.speak.onclick();assert.equal(spoken.length,2,'Manual replay remains available');
assert.equal(spoken[1].text,spoken[0].text);
run('rate(3)');assert.equal(spoken.length,3);assert.equal(spoken.at(-1).text,run('active.word'));
assert.notEqual(spoken.at(-1).text,spoken[0].text);
assert.equal(events.at(-2),'cancel','New card cancels pending speech');
run('state.excluded=words.filter(w=>w.word!==active.word).map(w=>w.word);queue=[];total=1;rate(1)');
assert.equal(spoken.length,4);assert.equal(spoken.at(-1).text,run('active.word'),'Immediate retry speaks again even for the same word');
nodes.back.onclick();assert.equal(events.at(-1),'cancel');assert.equal(spoken.length,4);
run('view="library";render()');wordButton.onclick();
assert.equal(spoken.length,5);assert.equal(spoken.at(-1).text,'occasionally');
// Unsupported or throwing browser speech APIs do not block the study queue.
run('delete globalThis.speechSynthesis;state.cards={};state.logs=[];state.excluded=[];start()');
assert(run('Boolean(active)'));nodes.speak.onclick();assert(nodes.toast.textContent.includes('不支援'));
run('globalThis.speechSynthesis={cancel(){throw Error("Unavailable")}};rate(3)');
assert(run('Boolean(active)'));
console.log('Passed: automatic first/next/retry/library pronunciation, manual replay, no repeat on reveal, cancellation on navigation, US voice settings and unavailable API fallback.');
