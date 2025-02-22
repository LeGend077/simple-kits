import{world,system,ItemStack,Player}from '@minecraft/server';export class QIDB{constructor(namespace="",saveRate=2,QAMsize=100,logs=!1){this.#saveRate=saveRate
this.#settings={logs:logs||!1,namespace:namespace};this.#queuedKeys=[]
this.#queuedValues=[]
this.#quickAccess=new Map()
this.#validNamespace=/^[a-z0-9_]*$/.test(this.#settings.namespace)
this.#dimension=world.getDimension("overworld");let sl=world.scoreboard.getObjective('qidb')
this.#sL;const player=world.getPlayers()[0]
if(!this.#validNamespace)throw new Error(`§c[Item Database] ${namespace} isn't a valid namespace. accepted char: a-z 0-9 _`);if(player)
if(!sl||sl?.hasParticipant('x')===!1){if(!sl)sl=world.scoreboard.addObjective('qidb');sl.setScore('x',player.location.x)
sl.setScore('z',player.location.z)
this.#sL={x:sl.getScore('x'),y:318,z:sl.getScore('z')}
this.#dimension.runCommand(`/tickingarea add ${this.#sL.x} 319 ${this.#sL.z} ${this.#sL.x} 318 ${this.#sL.z} storagearea`);console.log(`§q[Item Database] is initialized successfully. namespace: ${this.#settings.namespace}`)}else{this.#sL={x:sl.getScore('x'),y:318,z:sl.getScore('z')}
console.log(`§q[Item Database] is initialized successfully. namespace: ${this.#settings.namespace}`)}
world.afterEvents.playerSpawn.subscribe(({player,initialSpawn})=>{if(!this.#validNamespace)throw new Error(`§c[Item Database] ${namespace} isn't a valid namespace. accepted char: a-z 0-9 _`);if(!initialSpawn)return;if(!sl||sl?.hasParticipant('x')===!1){if(!sl)sl=world.scoreboard.addObjective('qidb');sl.setScore('x',player.location.x)
sl.setScore('z',player.location.z)
this.#sL={x:sl.getScore('x'),y:318,z:sl.getScore('z')}
this.#dimension.runCommand(`/tickingarea add ${this.#sL.x} 319 ${this.#sL.z} ${this.#sL.x} 318 ${this.#sL.z} storagearea`);console.log(`§q[Item Database] is initialized successfully. namespace: ${this.#settings.namespace}`)}else{try{sl.getScore('x')}catch{console.log(`§c[Item Database] Initialization Error. namespace: ${this.#settings.namespace}`)}
this.#sL={x:sl.getScore('x'),y:318,z:sl.getScore('z')}
console.log(`§q[Item Database] is initialized successfully. namespace: ${this.#settings.namespace}`)}})
let show=!0
let runId
system.runInterval(()=>{const diff=this.#quickAccess.size-QAMsize;if(diff>0){for(let i=0;i<diff;i++){this.#quickAccess.delete(this.#quickAccess.keys().next().value)}}
if(this.#queuedKeys.length){show==!0&&console.log("§eSaving, Dont close the world.")
if(!runId)runId=system.runInterval(()=>{console.log("§eSaving, Dont close the world.")},120)
show=!1
const start=Date.now()
const k=Math.min(this.#saveRate,this.#queuedKeys.length)
for(let i=0;i<k;i++){this.#romSave(this.#queuedKeys[0],this.#queuedValues[0]);if(logs)this.#timeWarn(start,this.#queuedKeys[0],"saved");this.#queuedKeys.shift();this.#queuedValues.shift()}}else if(runId){system.clearRun(runId)
runId=undefined
show==!1&&console.log("§aSaved, You can now close the world safely.")
show=!0}})
world.beforeEvents.playerLeave.subscribe(()=>{if(this.#queuedKeys.length&&world.getPlayers().length<2){console.error(`\n\n\n\n§c[Item Database]-[Fatal Error] World closed too early, items not saved correctly. \n\n`+`Namespace: ${this.#settings.namespace}\n`+`Lost Keys amount: ${this.#queuedKeys.length}\n\n\n\n`)}})}
#saveRate;#validNamespace;#queuedKeys;#settings;#quickAccess;#queuedValues;#dimension;#sL;QAMusage(){return this.#quickAccess.size}
#load(key){if(key.length>30)throw new Error(`§c[Item Database] Out of range: <${key}> has more than 30 characters`)
let canStr=!1;try{world.structureManager.place(key,this.#dimension,this.#sL,{includeEntities:!0});canStr=!0}catch{this.#dimension.spawnEntity("qidb:storage",this.#sL)}
const entities=this.#dimension.getEntities({location:this.#sL,type:"qidb:storage"});if(entities.length>1)entities.forEach((e,index)=>entities[index+1]?.remove());const entity=entities[0];const inv=entity.getComponent("inventory").container;return{canStr,inv}}
async #save(key,canStr){if(canStr)world.structureManager.delete(key);world.structureManager.createFromWorld(key,this.#dimension,this.#sL,this.#sL,{saveMode:"World",includeEntities:!0});const entities=this.#dimension.getEntities({location:this.#sL,type:"qidb:storage"});entities.forEach(e=>e.remove())}
#timeWarn(time,key,action){console.warn(`[Item Database] ${Date.now() - time}ms => ${action} ${key} `)}
async #queueSaving(key,value){this.#queuedKeys.push(key)
this.#queuedValues.push(value)}
async #romSave(key,value){const{canStr,inv}=this.#load(key);if(!value)for(let i=0;i<256;i++)inv.setItem(i,undefined),world.setDynamicProperty(key,null);if(Array.isArray(value)){try{for(let i=0;i<256;i++)inv.setItem(i,value[i]||undefined)}catch
{throw new Error(`§c[Item Database] Invalid value type. supported: ItemStack | ItemStack[] | undefined`)}
world.setDynamicProperty(key,!0)}else{try{inv.setItem(0,value),world.setDynamicProperty(key,!1)}catch
{throw new Error(`§c[Item Database] Invalid value type. supported: ItemStack | ItemStack[] | undefined`)}}
this.#save(key,canStr)}
set(key,value){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);if(!/^[a-z0-9_]*$/.test(key))throw new Error(`§c[Item Database] Invalid name: <${key}>. accepted char: a-z 0-9 _`);const time=Date.now();key=this.#settings.namespace+":"+key;if(Array.isArray(value)){if(value.length>255)throw new Error(`§c[Item Database] Out of range: <${key}> has more than 255 ItemStacks`)
world.setDynamicProperty(key,!0)}else{world.setDynamicProperty(key,!1)}
this.#quickAccess.set(key,value)
if(this.#queuedKeys.includes(key)){const i=this.#queuedKeys.indexOf(key)
this.#queuedValues.splice(i,1)
this.#queuedKeys.splice(i,1)}
this.#queueSaving(key,value)
if(this.#settings.logs)this.#timeWarn(time,key,"set");}
get(key){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);if(!/^[a-z0-9_]*$/.test(key))throw new Error(`§c[Item Database] Invalid name: <${key}>. accepted char: a-z 0-9 _`);const time=Date.now();key=this.#settings.namespace+":"+key;if(this.#quickAccess.has(key)){if(this.#settings.logs)this.#timeWarn(time,key,"got");return this.#quickAccess.get(key)}
const structure=world.structureManager.get(key)
if(!structure)throw new Error(`§c[Item Database] The key <${key}> doesn't exist.`);const{canStr,inv}=this.#load(key);const items=[];for(let i=0;i<256;i++)items.push(inv.getItem(i));for(let i=255;i>=0;i--)if(!items[i])items.pop();else break;this.#save(key,canStr);if(this.#settings.logs)this.#timeWarn(time,key,"got");if(world.getDynamicProperty(key)){this.#quickAccess.set(key,items);return items}else{this.#quickAccess.set(key,items[0]);return items[0]}}
has(key){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);if(!/^[a-z0-9_]*$/.test(key))throw new Error(`§c[Item Database] Invalid name: <${key}>. accepted char: a-z 0-9 _`);const time=Date.now();key=this.#settings.namespace+":"+key;const exist=this.#quickAccess.has(key)||world.structureManager.get(key)
if(this.#settings.logs)this.#timeWarn(time,key,`has ${!!exist}`);if(exist)return!0;else return!1}
delete(key){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);if(!/^[a-z0-9_]*$/.test(key))throw new Error(`§c[Item Database] Invalid name: <${key}>. accepted char: a-z 0-9 _`);const time=Date.now();key=this.#settings.namespace+":"+key;if(this.#quickAccess.has(key))this.#quickAccess.delete(key)
const structure=world.structureManager.get(key)
if(structure)world.structureManager.delete(key),world.setDynamicProperty(key,null);else throw new Error(`§c[Item Database] The key <${key}> doesn't exist.`);if(this.#settings.logs)this.#timeWarn(time,key,"removed");}
keys(){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);const allIds=world.getDynamicPropertyIds()
const ids=[]
allIds.filter(id=>id.startsWith(this.#settings.namespace+":")).forEach(id=>ids.push(id.replace(this.#settings.namespace+":","")))
return ids}
values(){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);const time=Date.now();const allIds=world.getDynamicPropertyIds()
const values=[]
const filtered=allIds.filter(id=>id.startsWith(this.#settings.namespace+":")).map(id=>id.replace(this.#settings.namespace+":",""))
for(const key of filtered){values.push(this.get(key))}
if(this.#settings.logs)this.#timeWarn(time,`${JSON.stringify(values)}`,"values");return values}
clear(){if(!this.#validNamespace)throw new Error(`§c[Item Database] Invalid name: <${this.#settings.namespace}>. accepted char: a-z 0-9 _`);const time=Date.now();const allIds=world.getDynamicPropertyIds()
const filtered=allIds.filter(id=>id.startsWith(this.#settings.namespace+":")).map(id=>id.replace(this.#settings.namespace+":",""))
for(const key of filtered){this.delete(key)}
if(this.#settings.logs)this.#timeWarn(time,``,"clear");}}