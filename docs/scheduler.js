// FSRS-6 via the pinned official ts-fsrs distribution.
const memoryScheduler = FSRS.fsrs({
 request_retention:0.9, maximum_interval:36500, enable_fuzz:false,
 enable_short_term:true, learning_steps:['1m','10m'], relearning_steps:['10m']
});
const schedulerIdentity = {schemaVersion:2,scheduler:'fsrs-6',schedulerLibrary:'ts-fsrs@5.4.2'};
function isFSRSCard(card){
 if(!card||!Number.isFinite(card.due)||!Number.isFinite(card.interval)||card.interval<0)return false;
 if(![0,1,2,3].includes(card.state))return false;
 if(!['stability','difficulty','elapsed_days','scheduled_days'].every(k=>Number.isFinite(card[k])&&card[k]>=0))return false;
 if(card.difficulty>10||card.state!==0&&(card.stability<=0||card.difficulty<1))return false;
 if(!['reps','lapses','learning_steps'].every(k=>Number.isInteger(card[k])&&card[k]>=0))return false;
 return card.state===0?card.last_review==null:Number.isFinite(card.last_review);
}
function runtimeCard(card, now=new Date()){
 if(!card)return FSRS.createEmptyCard(now);
 if(!isFSRSCard(card))throw Error('Invalid FSRS card');
 return {...card,due:new Date(card.due),last_review:card.last_review==null?undefined:new Date(card.last_review)};
}
function storedCard(card){
 const last=card.last_review?.getTime();
 return {...card,due:card.due.getTime(),last_review:last??null,interval:Math.max(0,(card.due.getTime()-(last??card.due.getTime()))/86400000)};
}
function storedReviewLog(log){return {...log,due:log.due.getTime(),review:log.review.getTime()};}
function migrateProgress(input, now=new Date()){
 const cards={};
 for(const [word,old] of Object.entries(input.cards)){
  if(isFSRSCard(old)){cards[word]={...old};continue;}
  if(input.scheduler==='fsrs-6')throw Error('Incomplete FSRS backup');
  if(!old||!Number.isFinite(old.due)||!Number.isFinite(old.interval)||old.interval<0)throw Error('Invalid legacy card');
  const history=input.logs.filter(log=>log.word===word);
  const grade=history.at(-1)?.rating||FSRS.Rating.Good;
  // The old scheduler stored due = last review + interval. Infer that instant;
  // estimate the memory state rather than fabricate timed historical reviews.
  const last=Math.min(old.due-old.interval*86400000,now.getTime());
  const seed=memoryScheduler.next(FSRS.createEmptyCard(new Date(last)),new Date(last),grade).card;
  const card={...seed,due:new Date(old.due),last_review:new Date(last),reps:Math.max(1,history.length),
   lapses:history.slice(1).filter(log=>log.rating===1).length};
  if(old.interval>=1){card.state=FSRS.State.Review;card.stability=old.interval;card.scheduled_days=Math.round(old.interval);card.learning_steps=0;}
  cards[word]={...storedCard(card),interval:old.interval,migratedFromLegacy:true};
 }
 if(input.excluded!==undefined&&(!Array.isArray(input.excluded)||!input.excluded.every(word=>typeof word==='string'&&words.some(w=>w.word===word))))throw Error('Invalid excluded words');
 return {...input,...schedulerIdentity,cards,excluded:[...new Set(input.excluded||[])]};
}
const fixedReviewDays={2:1,3:5,4:30};
function schedulePreview(card, now=new Date()){
 const results=memoryScheduler.repeat(runtimeCard(card,now),now);
 return [1,2,3,4].map(r=>fixedReviewDays[r]??Math.max(1/86400,(results[r].card.due.getTime()-now.getTime())/86400000));
}
function scheduleReview(card,rating,now=new Date()){
 const result=memoryScheduler.next(runtimeCard(card,now),now,rating);
 const days=fixedReviewDays[rating];
 if(days){
  result.card.due=new Date(now.getTime()+days*86400000);
  result.card.scheduled_days=days;
  result.card.state=FSRS.State.Review;
  result.card.learning_steps=0;
 }
 return {card:storedCard(result.card),log:{...storedReviewLog(result.log),...(days?{scheduleOverride:'fixed',scheduled_days:days}:{})}};
}
function validateBackup(s){
 if(!s||![1,2].includes(s.version)||!s.cards||typeof s.cards!=='object'||Array.isArray(s.cards)||!Array.isArray(s.logs)||![5,10,20].includes(s.limit))throw Error('Invalid backup');
 if(s.version===2&&s.scheduler!=='fsrs-6')throw Error('Unknown scheduler');
 for(const [word,c]of Object.entries(s.cards)){
  if(!words.some(w=>w.word===word)||!c||!Number.isFinite(c.due)||!Number.isFinite(c.interval)||c.interval<0)throw Error('Invalid card');
  if(s.version===2&&!isFSRSCard(c))throw Error('Invalid FSRS state');
 }
 for(const l of s.logs){
  if(!l||!words.some(w=>w.word===l.word)||![1,2,3,4].includes(l.rating)||!/^\d{4}-\d{2}-\d{2}$/.test(l.day)||!Number.isFinite(Date.parse(l.day+'T00:00:00Z')))throw Error('Invalid review log');
  if(new Date(l.day+'T00:00:00Z').toISOString().slice(0,10)!==l.day)throw Error('Invalid calendar date');
  if(l.first!==undefined&&typeof l.first!=='boolean')throw Error('Invalid first-review flag');
  if(l.review!==undefined&&!Number.isFinite(l.review))throw Error('Invalid review time');
 }
 return migrateProgress({cards:s.cards,logs:s.logs,limit:s.limit,excluded:s.excluded??[],...(s.version===2?schedulerIdentity:{})});
}
