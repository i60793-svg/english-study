const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const official=require('../dist/vendor/ts-fsrs-5.4.2.js');
const files=['data.js','encouragement.js','vendor/ts-fsrs-5.4.2.js','scheduler.js','test-reset.js','app.js'];
function setup(saved){
 const nodes={app:{innerHTML:''},toast:{style:{}}};const store=new Map(saved?[['word-roots-v1',JSON.stringify(saved)]]:[]);
 store.set('word-roots-test-reset-20261004-2043','done');
 const ctx=vm.createContext({Date,Intl,console,setTimeout:()=>{},setInterval:()=>{},navigator:{},confirm:()=>true,
 localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{getElementById:id=>nodes[id]??={style:{}},querySelectorAll:()=>[]}});
 for(const f of files)vm.runInContext(fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),ctx);
 return {ctx,nodes,store,run:s=>vm.runInContext(s,ctx),json:s=>JSON.parse(vm.runInContext(`JSON.stringify(${s})`,ctx))};
}
const app=setup(),reference=official.fsrs({request_retention:.9,maximum_interval:36500,enable_fuzz:false,enable_short_term:true,learning_steps:['1m','10m'],relearning_steps:['10m']});
assert.equal(app.json('state').scheduler,'fsrs-6');
for(const grade of [1,2,3,4]){
 const now=new Date('2026-10-04T02:00:00Z');
 const expected=reference.next(official.createEmptyCard(now),now,grade);
 const actual=app.json(`scheduleReview(undefined,${grade},new Date('${now.toISOString()}'))`);
 assert.equal(actual.card.due,grade===1?expected.card.due.getTime():now.getTime()+({2:1,3:5,4:30}[grade])*86400000);assert.equal(actual.card.stability,expected.card.stability);assert.equal(actual.card.difficulty,expected.card.difficulty);assert.equal(actual.card.state,grade===1?expected.card.state:official.State.Review);
 const next=new Date('2026-10-16T02:00:00Z');
 const again=app.json(`scheduleReview(${JSON.stringify(actual.card)},${grade},new Date('${next.toISOString()}'))`);
 const expectedAgain=reference.next({...actual.card,due:new Date(actual.card.due),last_review:new Date(actual.card.last_review)},next,grade);
 assert.equal(again.card.due,grade===1?expectedAgain.card.due.getTime():next.getTime()+({2:1,3:5,4:30}[grade])*86400000);assert.equal(again.card.stability,expectedAgain.card.stability);assert.equal(again.log.review,next.getTime());
 assert(app.run(`isFSRSCard(${JSON.stringify(again.card)})`));
 const preview=app.json(`schedulePreview(${JSON.stringify(actual.card)},new Date('${next.toISOString()}'))`);
 const officialPreview=reference.repeat({...actual.card,due:new Date(actual.card.due),last_review:new Date(actual.card.last_review)},next);
 for(let g=1;g<=4;g++)assert.equal(preview[g-1],g===1?(officialPreview[g].card.due.getTime()-next.getTime())/86400000:({2:1,3:5,4:30}[g]));
}
assert.equal(app.run('label(10/1440)'),'10 分鐘');assert.equal(app.run('label(6/24)'),'6 小時');assert.equal(app.run('label(8)'),'8 天');assert.equal(app.run('label(30)'),'1 個月');
const word=app.run('words[0].word'),legacyDue=Date.parse('2026-10-06T10:00:00Z');
const legacy={cards:{[word]:{due:legacyDue,interval:3}},logs:[{word,rating:3,day:'2026-10-03',first:true}],limit:10};
const migrated=setup(legacy);assert.equal(migrated.json('state').cards[word].due,legacyDue);assert.equal(migrated.json('state').cards[word].stability,3);assert.equal(migrated.json('state').logs.length,1);assert.equal(migrated.json('learningTotals()').days,1);assert.equal(migrated.json('learningTotals()').learned,1);assert(migrated.store.has('word-roots-v1-before-fsrs'));
const reloaded=setup(migrated.json('state'));assert.deepEqual(reloaded.json('state'),migrated.json('state'));
const oldBackup=migrated.json(`validateBackup(${JSON.stringify({...legacy,version:1})})`);assert.equal(oldBackup.cards[word].due,legacyDue);
const backup=migrated.json('({...state,version:2})');assert.deepEqual(migrated.json(`validateBackup(${JSON.stringify(backup)})`),migrated.json('state'));
for(const corrupt of [{...backup,version:9},{...backup,scheduler:'other'},{...backup,cards:{[word]:{...backup.cards[word],stability:-1}}},{...backup,cards:{[word]:{...backup.cards[word],last_review:null}}}])assert.throws(()=>migrated.run(`validateBackup(${JSON.stringify(corrupt)})`));
// Browser interaction: scoring persists full FSRS state and a timed review log.
app.run('start();revealed=true;render()');assert(app.nodes.app.innerHTML.includes('data-rate="3"'));app.run('rate(3)');const stored=JSON.parse(app.store.get('word-roots-v1'));assert.equal(stored.scheduler,'fsrs-6');assert.equal(stored.logs.length,1);assert(Number.isFinite(stored.logs[0].review));assert(Number.isFinite(stored.logs[0].fsrs.review));assert(app.run(`isFSRSCard(${JSON.stringify(Object.values(stored.cards)[0])})`));
// Exclusion is independent of FSRS ratings, survives backup/reload, and is reversible.
const skipped=setup();skipped.run('start();revealed=true;render()');assert(skipped.nodes.app.innerHTML.includes('id="exclude-word"'));const skipWord=skipped.run('active.word');skipped.nodes['exclude-word'].onclick();assert(skipped.json('state').excluded.includes(skipWord));assert.equal(skipped.json('state').logs.length,0);assert.equal(skipped.json('state').cards[skipWord],undefined);assert(!skipped.json('fresh().map(w=>w.word)').includes(skipWord));
const skipReload=setup(skipped.json('state'));assert(skipReload.json('state').excluded.includes(skipWord));const skipBackup=skipped.json('({...state,version:2})');assert(skipped.json(`validateBackup(${JSON.stringify(skipBackup)})`).excluded.includes(skipWord));assert.throws(()=>skipped.run(`validateBackup(${JSON.stringify({...skipBackup,excluded:['not-a-real-word']})})`));
skipped.run(`active=words.find(w=>w.word===${JSON.stringify(skipWord)});browse=true;revealed=true;view='study';render()`);assert(skipped.nodes.app.innerHTML.includes('id="restore-word"'));skipped.nodes['restore-word'].onclick();assert(!skipped.json('state').excluded.includes(skipWord));assert(skipped.json('fresh().map(w=>w.word)').includes(skipWord));
// Previously reviewed words keep their memory model and due date when excluded/restored.
const learnedSkip=setup(stored);const learnedWord=Object.keys(stored.cards)[0],savedCard=stored.cards[learnedWord];learnedSkip.run(`active=words.find(w=>w.word===${JSON.stringify(learnedWord)});browse=false;view='study';excludeActiveWord()`);assert.deepEqual(learnedSkip.json('state').cards[learnedWord],savedCard);assert(!learnedSkip.json('due().map(w=>w.word)').includes(learnedWord));learnedSkip.run(`active=words.find(w=>w.word===${JSON.stringify(learnedWord)});browse=true;revealed=true;render()`);learnedSkip.nodes['restore-word'].onclick();assert.deepEqual(learnedSkip.json('state').cards[learnedWord],savedCard);
// Requested reset clears all learning fields once, preserves the daily limit,
// creates a recoverable backup, and expires for dormant browsers.
const resetStore=new Map([['word-roots-test-reset-20261004-0222','done']]),resetStorage={getItem:k=>resetStore.get(k)||null,setItem:(k,v)=>resetStore.set(k,v)};
app.ctx.testResetStorage=resetStorage;
const beforeReset={...stored,excluded:[word],limit:20};
app.ctx.beforeReset=beforeReset;
const cleared=app.json("applyRequestedTestReset(beforeReset,testResetStorage,new Date('2026-10-04T12:43:00Z'))");assert.deepEqual(cleared.cards,{});assert.deepEqual(cleared.logs,[]);assert.deepEqual(cleared.excluded,[]);assert.equal(cleared.limit,20);assert.deepEqual(JSON.parse(resetStore.get('word-roots-v1-before-test-reset-20261004-2043')).cards,stored.cards);
assert.deepEqual(app.json("applyRequestedTestReset(beforeReset,testResetStorage,new Date('2026-10-04T12:44:00Z'))"),beforeReset);
resetStore.clear();assert.deepEqual(app.json("applyRequestedTestReset(beforeReset,testResetStorage,new Date('2026-10-05T00:00:00Z'))"),beforeReset);assert.equal(resetStore.size,0);
// Import through the actual UI callback, including version-1 migration.
(async()=>{
 app.run("view='record';render()");let chosen=false;app.nodes.import.click=()=>{chosen=true};app.nodes['choose-import'].onclick();assert(chosen);
 await app.nodes.import.onchange({target:{files:[{name:'old.json',text:async()=>JSON.stringify({...legacy,version:1})}]}});
 assert.equal(app.json('state').cards[word].due,legacyDue);assert.equal(app.json('state').scheduler,'fsrs-6');assert.equal(app.json('state').logs.length,1);
 console.log('Passed: FSRS memory updates and requested fixed review intervals, learning/review previews, serialization, legacy migration, reload, backups, validation, scoring, reversible exclusion and file-picker import.');
})().catch(e=>{console.error(e);process.exitCode=1});
