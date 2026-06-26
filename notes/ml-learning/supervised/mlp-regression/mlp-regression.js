const featureNames = ["Audience–title affinity", "Title awareness", "Tone preference match", "Release timing", "Runtime fit", "Social buzz"];
const initialFeatures = [0.76, 0.62, 0.7, 0.58, 0.66, 0.54];
const interactionTarget = (x) => Math.max(.08, Math.min(.94,
  .12 + .46 * x[0] * x[1] + .14 * x[2] + .08 * x[3] + .1 * x[4] + .12 * x[5]));
const trainingInputs = [
  [.9,.9,.72,.62,.64,.78], [.88,.22,.7,.58,.72,.34], [.2,.9,.54,.76,.58,.74], [.18,.2,.48,.3,.62,.18],
  [.72,.74,.8,.46,.82,.56], [.65,.34,.72,.82,.68,.4], [.38,.76,.4,.7,.48,.82], [.54,.56,.82,.36,.86,.3],
  [.82,.48,.62,.72,.7,.64], [.44,.86,.68,.64,.52,.88], [.76,.68,.32,.84,.46,.7], [.28,.42,.76,.44,.9,.24],
  [.94,.78,.58,.52,.34,.92], [.58,.26,.9,.68,.78,.28], [.32,.64,.46,.88,.56,.62], [.68,.82,.74,.3,.66,.76],
];
const trainingNoise = [.07,-.055,.06,-.045,.05,-.06,.065,-.05,.055,-.065,.05,-.055,.07,-.06,.045,-.05];
const trainingData = trainingInputs.map((x, i) => [x, Math.max(.04, Math.min(.97, interactionTarget(x) + trainingNoise[i]))]);
const heldoutInputs = [
  [.84,.84,.66,.68,.72,.72], [.82,.25,.68,.54,.76,.32], [.24,.86,.5,.8,.52,.78],
  [.48,.52,.76,.6,.82,.38], [.7,.64,.36,.76,.5,.66], [.36,.34,.62,.42,.7,.22],
];
const heldoutData = heldoutInputs.map((x) => [x, interactionTarget(x)]);
const presets = {
  broad: { label:"Broad appeal", x:[.84,.82,.78,.76,.74,.8], trust:"familiar", copy:"Strong, mutually reinforcing signals resemble successful training examples." },
  niche: { label:"Devoted niche", x:[.92,.28,.86,.4,.84,.3], trust:"familiar", copy:"High affinity and fit meet low awareness: a plausible niche pattern." },
  campaign: { label:"Big campaign, poor fit", x:[.24,.96,.34,.82,.28,.9], trust:"caution", copy:"Awareness is loud, but the audience and title signals disagree." },
  sleeper: { label:"Quiet sleeper", x:[.78,.22,.84,.54,.86,.26], trust:"familiar", copy:"Low awareness is offset by strong affinity, tone, and runtime fit." },
  contradictory: { label:"Contradictory signals", x:[.9,.12,.18,.94,.2,.92], trust:"caution", copy:"The inputs pull in opposing directions; inspect which learned pattern wins." },
  extreme: { label:"Out-of-distribution extreme", x:[1,1,0,1,0,1], trust:"unknown", copy:"This all-or-nothing combination lies far from the balanced examples used in training. Treat the precise output skeptically." },
};
const mission = {
  neither:{label:"Both low",x:[.18,.18,.5,.5,.5,.35]},
  affinity:{label:"High affinity only",x:[.92,.18,.5,.5,.5,.35]},
  awareness:{label:"High awareness only",x:[.18,.92,.5,.5,.5,.35]},
  together:{label:"Both high",x:[.92,.92,.5,.5,.5,.35]},
};
const state = {
  features:[...initialFeatures], target:interactionTarget(initialFeatures), activation:"relu", hidden:4, rate:.03,
  epoch:0, selected:0, pulse:"", history:[], trainingStage:0, draft:null, challenge:null, mission:null,
};
let w1, b1, w2, b2;
const ui = {
  svg:document.querySelector("#mlp-network"), features:document.querySelector("#mlp-features"),
  prediction:document.querySelector("#mlp-prediction"), target:document.querySelector("#mlp-target"),
  residual:document.querySelector("#mlp-residual"), loss:document.querySelector("#mlp-loss"), epoch:document.querySelector("#mlp-epoch"),
  parameters:document.querySelector("#mlp-parameters"), heldout:document.querySelector("#mlp-heldout"),
  neuronTitle:document.querySelector("#mlp-neuron-title"), z:document.querySelector("#mlp-z"), a:document.querySelector("#mlp-a"),
  bias:document.querySelector("#mlp-bias"), outputWeight:document.querySelector("#mlp-output-weight"),
  outputContribution:document.querySelector("#mlp-output-contribution"), contributions:document.querySelector("#mlp-contributions"),
  chart:document.querySelector("#mlp-loss-chart"), hidden:document.querySelector("#mlp-hidden-count"),
  hiddenOutput:document.querySelector("#mlp-hidden-output"), rate:document.querySelector("#mlp-rate"),
  rateOutput:document.querySelector("#mlp-rate-output"), step:document.querySelector("#mlp-step"),
  updateMath:document.querySelector("#mlp-update-math"), updateCopy:document.querySelector("#mlp-update-copy"),
  missionState:document.querySelector("#mlp-mission-state"), missionCopy:document.querySelector("#mlp-mission-copy"),
  challengeLabel:document.querySelector("#mlp-challenge-label"), trustState:document.querySelector("#mlp-trust-state"),
  trustCopy:document.querySelector("#mlp-trust-copy"), coachTitle:document.querySelector("#mlp-coach-title"),
  coachCopy:document.querySelector("#mlp-coach-copy"), capacityState:document.querySelector("#mlp-capacity-state"),
  gapState:document.querySelector("#mlp-gap-state"), focusState:document.querySelector("#mlp-focus-state"),
};

function seededWeight(i,j){ return Math.sin((i+1)*7.31+(j+1)*3.17)*.42; }
function resetWeights(){
  w1=Array.from({length:6},()=>Array(6).fill(0));
  b1=Array(6).fill(0);
  w2=Array(6).fill(0);
  w1[0][0]=1; w1[1][0]=1; b1[0]=-1.15; w2[0]=.55;
  w1[2][1]=1; w2[1]=.14;
  w1[3][2]=.5; w1[4][2]=.5; w2[2]=.18;
  w1[5][3]=1; w2[3]=.12;
  for(let j=4;j<6;j+=1){
    for(let i=0;i<6;i+=1) w1[i][j]=seededWeight(i,j)*.35;
    b1[j]=.08; w2[j]=seededWeight(j,1)*.35;
  }
  b2=.12;
}
function activate(z){ return state.activation==="relu"?Math.max(0,z):z; }
function derivative(z){ return state.activation==="relu"?(z>0?1:0):1; }
function forward(features=state.features){
  const z=Array.from({length:state.hidden},(_,j)=>features.reduce((sum,x,i)=>sum+x*w1[i][j],b1[j]));
  const a=z.map(activate);
  const raw=a.reduce((sum,value,j)=>sum+value*w2[j],b2);
  return {z,a,prediction:Math.max(.02,Math.min(.98,raw))};
}
function mse(data){ return data.reduce((sum,[x,y])=>sum+(forward(x).prediction-y)**2,0)/data.length; }
function gradients(features,target){
  const before=forward(features), error=before.prediction-target, outputGrad=2*error;
  const gw2=Array(6).fill(0), gb1=Array(6).fill(0), gw1=Array.from({length:6},()=>Array(6).fill(0));
  for(let j=0;j<state.hidden;j+=1){
    gw2[j]=outputGrad*before.a[j];
    const hiddenGrad=outputGrad*w2[j]*derivative(before.z[j]);
    gb1[j]=hiddenGrad;
    for(let i=0;i<6;i+=1) gw1[i][j]=hiddenGrad*features[i];
  }
  return {before,error,loss:error**2,outputGrad,gw2,gb2:outputGrad,gw1,gb1};
}
function applyGradients(draft){
  for(let j=0;j<state.hidden;j+=1){
    w2[j]-=state.rate*draft.gw2[j];
    for(let i=0;i<6;i+=1) w1[i][j]-=state.rate*draft.gw1[i][j];
    b1[j]-=state.rate*draft.gb1[j];
  }
  b2-=state.rate*draft.gb2;
}
function trainExample(features,target){ const draft=gradients(features,target); applyGradients(draft); return draft; }
function currentMetrics(){ const result=forward(); const residual=state.target-result.prediction; return {...result,residual,loss:residual**2}; }
function setFeatures(values){
  state.features=[...values]; state.target=interactionTarget(values);
  ui.features.querySelectorAll("[data-feature]").forEach((input,i)=>{input.value=Math.round(values[i]*100);});
}
function buildFeatureControls(){
  ui.features.innerHTML=featureNames.map((name,i)=>`<label><span>${name}</span><strong id="feature-value-${i}">${Math.round(state.features[i]*100)}</strong><input type="range" min="0" max="100" value="${Math.round(state.features[i]*100)}" data-feature="${i}" /></label>`).join("");
}
function renderNetwork(result){
  const inputX=105, hiddenX=405, outputX=675, inputYs=[62,140,218,296,374,452];
  const hiddenYs=Array.from({length:state.hidden},(_,i)=>70+i*(380/Math.max(1,state.hidden-1)));
  let edges="";
  for(let i=0;i<6;i++) for(let j=0;j<state.hidden;j++){
    const weight=w1[i][j], selected=j===state.selected;
    edges+=`<line class="mlp-edge ${weight>=0?"positive":"negative"} ${state.pulse==="forward"?"is-pulsing":""} ${state.pulse==="backward"?"is-backward":""} ${selected?"is-inspected":""}" x1="${inputX}" y1="${inputYs[i]}" x2="${hiddenX}" y2="${hiddenYs[j]}" style="--edge-delay:${(i+j)*22}ms;stroke-width:${1+Math.abs(weight)*6}" />`;
  }
  for(let j=0;j<state.hidden;j++){
    const weight=w2[j], selected=j===state.selected;
    edges+=`<line class="mlp-edge ${weight>=0?"positive":"negative"} ${state.pulse==="forward"?"is-pulsing":""} ${state.pulse==="backward"?"is-backward":""} ${selected?"is-inspected":""}" x1="${hiddenX}" y1="${hiddenYs[j]}" x2="${outputX}" y2="256" style="--edge-delay:${160+j*35}ms;stroke-width:${1+Math.abs(weight)*7}" />`;
  }
  const inputs=inputYs.map((y,i)=>`<g class="mlp-node input"><circle cx="${inputX}" cy="${y}" r="25"/><text x="${inputX}" y="${y+4}">${Math.round(state.features[i]*100)}</text><text class="node-label" x="12" y="${y+4}">${featureNames[i]}</text></g>`).join("");
  const hidden=hiddenYs.map((y,j)=>`<g class="mlp-node hidden ${j===state.selected?"is-selected":""}" data-neuron="${j}" role="button" tabindex="0"><circle cx="${hiddenX}" cy="${y}" r="31"/><text x="${hiddenX}" y="${y+4}">${result.a[j].toFixed(2)}</text><text class="node-label" x="${hiddenX}" y="${y+51}">H${j+1}</text></g>`).join("");
  ui.svg.innerHTML=`<text class="layer-label" x="${inputX}" y="20">INPUT FEATURES</text><text class="layer-label" x="${hiddenX}" y="20">HIDDEN · ${state.activation.toUpperCase()}</text><text class="layer-label" x="${outputX}" y="20">OUTPUT</text>${edges}${inputs}${hidden}<g class="mlp-node output"><circle cx="${outputX}" cy="256" r="42"/><text x="${outputX}" y="252">${Math.round(result.prediction*100)}%</text><text class="node-label" x="${outputX}" y="276">ŷ</text></g>`;
}
function renderChart(){
  const ctx=ui.chart.getContext("2d"), width=ui.chart.width, height=ui.chart.height;
  ctx.clearRect(0,0,width,height); ctx.fillStyle="#fbfaf6";ctx.fillRect(0,0,width,height);
  ctx.strokeStyle="rgba(18,24,43,.18)";ctx.beginPath();ctx.moveTo(36,18);ctx.lineTo(36,140);ctx.lineTo(414,140);ctx.stroke();
  const history=state.history.length?state.history:[{train:mse(trainingData),held:mse(heldoutData)}];
  const max=Math.max(.02,...history.flatMap(d=>[d.train,d.held]));
  [["train","#3155f5"],["held","#ff755f"]].forEach(([key,color])=>{
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();
    history.forEach((d,i)=>{const x=36+(i/Math.max(1,history.length-1))*378,y=132-(d[key]/max)*102;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
    ctx.stroke(); if(history.length===1){const y=132-(history[0][key]/max)*102;ctx.beginPath();ctx.arc(36,y,4,0,Math.PI*2);ctx.fill();}
  });
  ctx.font="600 12px DM Sans";ctx.fillStyle="#3155f5";ctx.fillText("Training",42,16);ctx.fillStyle="#ff755f";ctx.fillText("Held-out",124,16);
}
function renderInspector(result){
  const j=state.selected;
  ui.neuronTitle.textContent=`H${j+1}`; ui.bias.textContent=b1[j].toFixed(3); ui.z.textContent=result.z[j].toFixed(3);
  ui.a.textContent=result.a[j].toFixed(3); ui.outputWeight.textContent=w2[j].toFixed(3);
  ui.outputContribution.textContent=(result.a[j]*w2[j]).toFixed(3);
  const rows=featureNames.map((name,i)=>({name,value:state.features[i],weight:w1[i][j],contribution:state.features[i]*w1[i][j]}))
    .sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution));
  ui.contributions.innerHTML=rows.map(row=>`<div><span>${row.name}</span><code>${row.value.toFixed(2)} × ${row.weight.toFixed(2)}</code><strong>${row.contribution>=0?"+":""}${row.contribution.toFixed(3)}</strong></div>`).join("");
}
function renderTrace(){
  const ids=["forward","loss","backward","apply"];
  ids.forEach((id,index)=>document.querySelector(`#mlp-trace-${id}`).classList.toggle("is-active",state.trainingStage===index+1));
  const labels=["Start one-example training","Next: measure loss","Next: backpropagate","Next: apply update"];
  ui.step.textContent=labels[state.trainingStage]||"Train another example";
  if(!state.draft){ui.updateMath.textContent="Choose “Start one-example training.”";ui.updateCopy.textContent="The selected equation will show old weight − η (eta) × gradient = new weight.";return;}
  const i=0,j=state.selected,old=state.draft.oldWeight,gradient=state.draft.gw1[i][j],next=old-state.rate*gradient;
  if(state.trainingStage<3){ui.updateMath.textContent=`Current selected weight: ${old.toFixed(4)}`;ui.updateCopy.textContent=state.trainingStage===1?"The forward pass used this weight to produce the prediction.":"Loss measures how far that prediction is from the target.";}
  else {ui.updateMath.textContent=`${old.toFixed(4)} − ${state.rate.toFixed(2)} × (${gradient.toFixed(4)}) = ${next.toFixed(4)}`;ui.updateCopy.textContent=state.trainingStage===3?"The gradient assigns this connection its share of responsibility.":"The new value replaces the old weight.";}
}
function renderTrust(){
  if(!state.challenge){ui.challengeLabel.textContent="No preset selected";ui.trustState.textContent="Inside the familiar range";ui.trustCopy.textContent="The current feature mix resembles the examples used to train this teaching model.";return;}
  const preset=presets[state.challenge]; ui.challengeLabel.textContent=preset.label;
  ui.trustState.textContent=preset.trust==="unknown"?"Outside the training neighborhood":preset.trust==="caution"?"Conflicting evidence":"Familiar pattern";
  ui.trustCopy.textContent=preset.copy;
}
function renderMission(){
  if(!state.mission){ui.missionState.textContent="Start with a prediction.";ui.missionCopy.textContent="Try all four examples in Linear mode, then repeat with ReLU.";return;}
  const result=forward(), label=mission[state.mission].label;
  ui.missionState.textContent=`${label}: ${Math.round(result.prediction*100)}% predicted`;
  ui.missionCopy.textContent=state.mission==="together"
    ? `When both inputs are high, ${state.activation==="relu"?"hidden neurons can create an interaction":"the linear stack can only add their effects"}.`
    : "One promising signal is present while the other is deliberately weak.";
}
function renderCoach(){
  const trainLoss=mse(trainingData), heldLoss=mse(heldoutData), gap=heldLoss-trainLoss;
  const capacity=state.hidden<=2?"Low capacity":state.hidden>=5?"High capacity":"Balanced capacity";
  const gapText=`${gap>=0?"+":""}${gap.toFixed(4)}`;
  ui.capacityState.textContent=capacity;
  ui.gapState.textContent=gapText;

  if(state.challenge){
    const preset=presets[state.challenge];
    ui.focusState.textContent=preset.trust==="unknown"?"Trust boundary":"Challenge preset";
    ui.coachTitle.textContent=preset.trust==="unknown"?"Treat the exact number carefully.":"Inspect the evidence mix.";
    ui.coachCopy.textContent=preset.trust==="unknown"
      ? "This profile is outside the balanced examples used for training. The model still outputs a number, but the lesson is about uncertainty."
      : "Use the neuron inspector to see which hidden pattern dominates this profile before trusting the prediction.";
    return;
  }

  if(state.mission){
    ui.focusState.textContent="Nonlinear interaction";
    ui.coachTitle.textContent=state.activation==="relu"?"ReLU can form a combined signal.":"Linear mode can only add evidence.";
    ui.coachCopy.textContent="Run the four mission buttons in both modes. The applied question is whether two weak signals become strong together.";
    return;
  }

  if(state.epoch===0 && state.trainingStage===0){
    ui.focusState.textContent="Prediction";
    ui.coachTitle.textContent="Start by perturbing the inputs.";
    ui.coachCopy.textContent="Move a feature or load a preset, then inspect which hidden neuron contributes most to the output.";
    return;
  }

  if(state.trainingStage>0 && state.trainingStage<4){
    ui.focusState.textContent="Training step";
    ui.coachTitle.textContent="You are inside one update.";
    ui.coachCopy.textContent="The trace is slowing down forward pass, loss, backpropagation, and the parameter update.";
    return;
  }

  if(state.hidden>=5 && gap>.018){
    ui.focusState.textContent="Overfitting watch";
    ui.coachTitle.textContent="Capacity is helping practice more than held-out examples.";
    ui.coachCopy.textContent="A wider network can memorize details. Compare the blue and red loss lines before adding more neurons.";
    return;
  }

  ui.focusState.textContent=state.activation==="relu"?"Applied MLP":"Linear comparison";
  ui.coachTitle.textContent=state.activation==="relu"?"Use capacity to learn interactions.":"This is the baseline comparison.";
  ui.coachCopy.textContent=state.activation==="relu"
    ? "Train an epoch, then check whether held-out loss moves with training loss. Good applied work watches both."
    : "Linear mode is useful as a control: if ReLU does better, the hidden layer is learning nonlinear structure.";
}
function render(){
  state.selected=Math.min(state.selected,state.hidden-1);
  const result=currentMetrics();
  ui.prediction.textContent=`${Math.round(result.prediction*100)}%`; ui.target.textContent=`${Math.round(state.target*100)}%`;
  ui.residual.textContent=`${result.residual>=0?"+":""}${(result.residual*100).toFixed(1)} pts`; ui.loss.textContent=result.loss.toFixed(4);
  ui.epoch.textContent=state.epoch; ui.parameters.textContent=8*state.hidden+1; ui.heldout.textContent=mse(heldoutData).toFixed(4);
  ui.hiddenOutput.textContent=state.hidden; ui.rateOutput.textContent=state.rate.toFixed(2);
  ui.features.querySelectorAll("[data-feature]").forEach(input=>{document.querySelector(`#feature-value-${input.dataset.feature}`).textContent=input.value;});
  renderNetwork(result); renderInspector(result); renderChart(); renderTrace(); renderTrust(); renderMission(); renderCoach();
}
function pulse(kind){state.pulse=kind;render();setTimeout(()=>{state.pulse="";render();},900);}
function resetTrainingStage(){state.trainingStage=0;state.draft=null;}

ui.features.addEventListener("input",e=>{const input=e.target.closest("[data-feature]");if(!input)return;state.features[Number(input.dataset.feature)]=Number(input.value)/100;state.target=interactionTarget(state.features);state.challenge=null;state.mission=null;resetTrainingStage();render();});
ui.svg.addEventListener("click",e=>{const node=e.target.closest("[data-neuron]");if(!node)return;state.selected=Number(node.dataset.neuron);render();});
document.querySelectorAll("[data-activation]").forEach(button=>button.addEventListener("click",()=>{state.activation=button.dataset.activation;document.querySelectorAll("[data-activation]").forEach(item=>item.classList.toggle("is-selected",item===button));resetTrainingStage();render();}));
ui.hidden.addEventListener("input",()=>{state.hidden=Number(ui.hidden.value);resetTrainingStage();render();});
ui.rate.addEventListener("input",()=>{state.rate=Number(ui.rate.value)/100;resetTrainingStage();render();});
document.querySelector("#mlp-forward").addEventListener("click",()=>pulse("forward"));
document.querySelectorAll("[data-mission]").forEach(button=>button.addEventListener("click",()=>{state.mission=button.dataset.mission;state.challenge=null;setFeatures(mission[state.mission].x);resetTrainingStage();render();}));
document.querySelectorAll("[data-preset]").forEach(button=>button.addEventListener("click",()=>{state.challenge=button.dataset.preset;state.mission=null;setFeatures(presets[state.challenge].x);resetTrainingStage();render();}));
ui.step.addEventListener("click",()=>{
  if(state.trainingStage===0||state.trainingStage===4){
    state.draft=gradients(state.features,state.target);state.draft.oldWeight=w1[0][state.selected];state.trainingStage=1;pulse("forward");return;
  }
  if(state.trainingStage===1){state.trainingStage=2;render();return;}
  if(state.trainingStage===2){state.trainingStage=3;pulse("backward");return;}
  applyGradients(state.draft);state.trainingStage=4;state.history.push({train:mse(trainingData),held:mse(heldoutData)});render();
});
document.querySelector("#mlp-epoch-button").addEventListener("click",()=>{trainingData.forEach(([x,y])=>trainExample(x,y));state.epoch+=1;state.history.push({train:mse(trainingData),held:mse(heldoutData)});resetTrainingStage();render();});
document.querySelector("#mlp-reset").addEventListener("click",()=>{
  state.features=[...initialFeatures];state.target=interactionTarget(initialFeatures);state.activation="relu";state.hidden=4;state.rate=.03;state.epoch=0;state.selected=0;state.history=[];state.challenge=null;state.mission=null;resetTrainingStage();
  ui.hidden.value=4;ui.rate.value=3;document.querySelectorAll("[data-activation]").forEach(item=>item.classList.toggle("is-selected",item.dataset.activation==="relu"));
  resetWeights();buildFeatureControls();render();
});
resetWeights();buildFeatureControls();render();
