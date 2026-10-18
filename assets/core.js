(function(root){
'use strict';
const KEY='project-python-v1';
function blank(){return {version:1,student:'',lessons:{}};}
function lesson(state,id){return state.lessons[id]||(state.lessons[id]={answers:{},ai:{},job:{},code:null,runs:[],inputs:''});}
function answer(state,id,key,choice,correct){const l=lesson(state,id);const a=l.answers[key]||(l.answers[key]={tries:0,correct:false,choice:null,history:[]});a.tries++;a.choice=choice;a.correct=choice===correct;a.history.push({choice,correct:a.correct,at:new Date().toISOString()});return a;}
function complete(l){return !!l && ['predict','decision','gap'].every(k=>l.answers?.[k]?.correct)&&['prompt','response','verification','conclusion'].every(k=>(l.ai?.[k]||'').trim().length>=5)&&['plan','evidence','conclusion'].every(k=>(l.job?.[k]||'').trim().length>=5);}
function validate(s){return !!s&&s.version===1&&typeof s.student==='string'&&s.lessons&&typeof s.lessons==='object'&&!Array.isArray(s.lessons)&&Object.keys(s.lessons).every(k=>/^([1-9]|[12]\d|3[0-2])$/.test(k));}
function normalize(raw){
const s=blank();s.student=String(raw.student||'').slice(0,100);
for(const [id,value] of Object.entries(raw.lessons||{})){
 if(!/^([1-9]|[12]\d|3[0-2])$/.test(id)||!value||typeof value!=='object')continue;
 const l=lesson(s,id);l.code=typeof value.code==='string'?value.code.slice(0,100000):null;l.inputs=typeof value.inputs==='string'?value.inputs.slice(0,100000):'';
 for(const [group,keys] of [['ai',['prompt','response','verification','conclusion']],['job',['plan','evidence','conclusion']]])for(const key of keys){l[group][key]=typeof value[group]?.[key]==='string'?value[group][key].slice(0,100000):'';}
 for(const key of ['predict','decision','gap']){const a=value.answers?.[key];if(a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<3)l.answers[key]={choice:a.choice,correct:a.correct===true,tries:Math.max(1,Math.min(100000,Number(a.tries)||1)),history:Array.isArray(a.history)?a.history.slice(-1000):[]};}
 l.runs=Array.isArray(value.runs)?value.runs.filter(r=>r&&typeof r.text==='string'&&typeof r.at==='string').slice(-5).map(r=>({at:r.at.slice(0,100),text:r.text.slice(0,100000),ok:r.ok===true,code:typeof r.code==='string'?r.code.slice(0,100000):''})):[];
}return s;
}
function read(storage){try{const s=JSON.parse(storage.getItem(KEY));return validate(s)?normalize(s):blank();}catch{return blank();}}
const api={KEY,blank,lesson,answer,complete,validate,normalize,read};root.CourseCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
