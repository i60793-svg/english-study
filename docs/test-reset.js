// One-time reset explicitly requested by the owner for testing on 2026-10-04.
// Expiry prevents clearing a dormant device when it returns much later.
const requestedResetId='word-roots-test-reset-20261004-2043';
function applyRequestedTestReset(progress,storage,now=new Date()){
 if(now.getTime()>Date.parse('2026-10-04T16:00:00Z')||storage.getItem(requestedResetId))return progress;
 const backupKey='word-roots-v1-before-test-reset-20261004-2043';
 if(!storage.getItem(backupKey))storage.setItem(backupKey,JSON.stringify({...progress,version:2}));
 const cleared={cards:{},logs:[],excluded:[],limit:progress.limit,...schedulerIdentity};
 storage.setItem('word-roots-v1',JSON.stringify(cleared));
 storage.setItem(requestedResetId,'done');
 return cleared;
}
