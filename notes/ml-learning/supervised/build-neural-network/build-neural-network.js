const featureNames = ["Audience affinity", "Awareness", "Tone match"];
const state = {
  stage: 1,
  features: [.78, .64, .56],
  weights: [.6, -.35, .42],
  bias: -.55,
  activation: "relu",
  width: 3,
  pulse: false,
};
const hiddenProfiles = [
  { weights:[.6,-.35,.42], bias:-.55 },
  { weights:[-.25,.72,.3], bias:-.28 },
  { weights:[.38,.24,-.58], bias:-.12 },
  { weights:[.18,-.42,.76], bias:-.3 },
];
const outputWeights = [.62, .46, -.3, .38];
const ui = {
  svg:document.querySelector("#builder-network"), title:document.querySelector("#builder-stage-title"),
  number:document.querySelector("#builder-stage-number"), copy:document.querySelector("#builder-stage-copy"),
  scalar:document.querySelector("#builder-scalar"), scalarCopy:document.querySelector("#builder-scalar-copy"),
  matrix:document.querySelector("#builder-matrix"), matrixCopy:document.querySelector("#builder-matrix-copy"),
  output:document.querySelector("#builder-output"), outputCopy:document.querySelector("#builder-output-copy"),
  features:document.querySelector("#builder-features"), weights:document.querySelector("#builder-weights"),
  bias:document.querySelector("#builder-bias"), biasValue:document.querySelector("#builder-bias-value"),
  activationCopy:document.querySelector("#builder-activation-copy"), width:document.querySelector("#builder-width"),
  widthValue:document.querySelector("#builder-width-value"),
};
const stageContent = {
  1:["Features become a vector.","A model cannot read concepts directly. Each title property becomes a consistently ordered number."],
  2:["One neuron weighs the evidence.","Every edge multiplies an input by a weight. The neuron adds those contributions."],
  3:["Bias shifts the starting point.","Bias is a learned offset added after the weighted inputs. It changes how readily the neuron responds."],
  4:["Activation shapes the signal.","The activation function transforms the weighted sum into the neuron’s outgoing signal."],
  5:["One calculation becomes a layer.","A hidden layer repeats the neuron operation with different weights and biases, creating several intermediate signals."],
  6:["The network feeds forward.","The output neuron combines hidden activations into one prediction. The entire diagram is now one nested function."],
};
function format(n){ return `${n<0?"−":""}${Math.abs(n).toFixed(2)}`; }
function activate(z){
  if(state.activation==="relu") return Math.max(0,z);
  if(state.activation==="sigmoid") return 1/(1+Math.exp(-z));
  return z;
}
function neuron(profile=hiddenProfiles[0]){
  const contributions=state.features.map((x,i)=>x*profile.weights[i]);
  const z=contributions.reduce((a,b)=>a+b,profile.bias);
  return {contributions,z,a:activate(z)};
}
function firstNeuronProfile(){ return {weights:state.weights,bias:state.stage>=3?state.bias:0}; }
function network(){
  const hidden=hiddenProfiles.slice(0,state.width).map(neuron);
  const raw=hidden.reduce((sum,n,j)=>sum+n.a*outputWeights[j],-.08);
  return {hidden,raw,prediction:1/(1+Math.exp(-raw))};
}
function buildControls(){
  ui.features.innerHTML=featureNames.map((name,i)=>`<label><span>${name}</span><strong id="builder-feature-value-${i}">${state.features[i].toFixed(2)}</strong><input type="range" min="0" max="100" value="${state.features[i]*100}" data-builder-feature="${i}" /></label>`).join("");
  ui.weights.innerHTML=featureNames.map((name,i)=>`<label><span>${name} weight</span><strong id="builder-weight-value-${i}">${format(state.weights[i])}</strong><input type="range" min="-100" max="100" value="${state.weights[i]*100}" data-builder-weight="${i}" /></label>`).join("");
}
function renderMath(){
  const one=neuron(firstNeuronProfile()), net=network();
  const products=state.features.map((x,i)=>`${x.toFixed(2)} × (${state.weights[i].toFixed(2)})`);
  if(state.stage===1){
    ui.scalar.textContent=`x₁ = ${state.features[0].toFixed(2)}`;
    ui.scalarCopy.textContent=`“Audience affinity” has become the numeric feature x₁ (“x sub one”).`;
    ui.matrix.textContent=`x = [${state.features.map(v=>v.toFixed(2)).join(", ")}]`;
    ui.matrixCopy.textContent="x is the feature vector: an ordered list describing one title.";
    ui.output.textContent="—"; ui.outputCopy.textContent="No neuron exists yet.";
  } else if(state.stage<=4){
    const biasTerm=state.stage>=3?` + (${state.bias.toFixed(2)})`:"";
    ui.scalar.textContent=`z = ${products.join(" + ")}${biasTerm} = ${one.z.toFixed(3)}`;
    ui.scalarCopy.textContent=state.stage>=3?"Each feature is multiplied by its weight; bias is added after the contributions.":"Each feature is multiplied by its weight, then the three contributions are added.";
    ui.matrix.textContent=state.stage>=3?`z = w · x + b`:`z = w · x`;
    ui.matrixCopy.textContent=`w = [${state.weights.map(v=>v.toFixed(2)).join(", ")}], x = [${state.features.map(v=>v.toFixed(2)).join(", ")}]${state.stage>=3?`, b = ${state.bias.toFixed(2)}`:""}`;
    ui.output.textContent=state.stage<4?one.z.toFixed(3):one.a.toFixed(3);
    ui.outputCopy.textContent=state.stage<4?"The neuron currently exposes its pre-activation value z.":`${state.activation} transforms z into activation a.`;
  } else {
    const matrixRows=hiddenProfiles.slice(0,state.width).map(p=>`[${p.weights.map(v=>v.toFixed(2)).join(", ")}]`).join(" ");
    ui.scalar.textContent=`a₁ = f(${net.hidden[0].z.toFixed(3)}) = ${net.hidden[0].a.toFixed(3)}`;
    ui.scalarCopy.textContent="Each hidden neuron performs the same scalar operation with its own parameters.";
    ui.matrix.textContent=`a = f(Wx + b)`;
    ui.matrixCopy.textContent=`W has ${state.width} rows: ${matrixRows}`;
    ui.output.textContent=state.stage===6?`${Math.round(net.prediction*100)}%`:`[${net.hidden.map(n=>n.a.toFixed(2)).join(", ")}]`;
    ui.outputCopy.textContent=state.stage===6?"The output neuron converts hidden signals into a completion prediction.":"The hidden-layer output is itself a vector of activations.";
  }
}
function renderNetwork(){
  const net=network(), inputX=145, hiddenX=475, outputX=735, ys=[135,265,395];
  const hiddenYs=Array.from({length:state.width},(_,i)=>95+i*(340/Math.max(1,state.width-1)));
  const showNeuron=state.stage>=2, showLayer=state.stage>=5, showOutput=state.stage>=6;
  let edges="", nodes="";
  ys.forEach((y,i)=>{
    nodes+=`<g class="builder-node input"><circle cx="${inputX}" cy="${y}" r="35"/><text x="${inputX}" y="${y+5}">${state.features[i].toFixed(2)}</text><text class="builder-node-label" x="18" y="${y+5}">${featureNames[i]}</text></g>`;
  });
  if(showNeuron){
    const count=showLayer?state.width:1;
    for(let j=0;j<count;j++){
      const profile=j===0?firstNeuronProfile():hiddenProfiles[j];
      const result=j===0?neuron(profile):net.hidden[j];
      const hy=showLayer?hiddenYs[j]:265;
      for(let i=0;i<3;i++){
        const weight=profile.weights[i];
        edges+=`<line class="builder-edge ${weight>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${inputX+35}" y1="${ys[i]}" x2="${hiddenX-38}" y2="${hy}" style="stroke-width:${1+Math.abs(weight)*7};--edge-delay:${(i+j)*50}ms"/>`;
      }
      nodes+=`<g class="builder-node hidden"><circle cx="${hiddenX}" cy="${hy}" r="38"/><text x="${hiddenX}" y="${hy+5}">${(state.stage>=4?result.a:result.z).toFixed(2)}</text><text class="builder-node-label center" x="${hiddenX}" y="${hy+58}">H${j+1}</text></g>`;
      if(showOutput){
        const ow=outputWeights[j];
        edges+=`<line class="builder-edge ${ow>=0?"positive":"negative"} ${state.pulse?"is-pulsing":""}" x1="${hiddenX+38}" y1="${hy}" x2="${outputX-48}" y2="265" style="stroke-width:${1+Math.abs(ow)*7};--edge-delay:${260+j*60}ms"/>`;
      }
    }
  }
  if(showOutput) nodes+=`<g class="builder-node output"><circle cx="${outputX}" cy="265" r="48"/><text x="${outputX}" y="260">${Math.round(net.prediction*100)}%</text><text class="builder-node-label center" x="${outputX}" y="283">prediction</text></g>`;
  const vectorBracket=state.stage===1?`<path class="builder-bracket" d="M205 92h18v346h-18M258 92h-18v346h18"/><text class="builder-vector-label" x="232" y="470">x</text>`:"";
  ui.svg.innerHTML=`<text class="builder-layer-label" x="${inputX}" y="45">FEATURE VALUES</text>${showNeuron?`<text class="builder-layer-label" x="${hiddenX}" y="45">${showLayer?"HIDDEN LAYER":"ONE NEURON"}</text>`:""}${showOutput?`<text class="builder-layer-label" x="${outputX}" y="45">OUTPUT</text>`:""}${edges}${nodes}${vectorBracket}`;
}
function renderVisibility(){
  document.querySelector("#builder-weights-panel").hidden=state.stage<2;
  document.querySelector("#builder-bias-panel").hidden=state.stage<3;
  document.querySelector("#builder-activation-panel").hidden=state.stage<4;
  document.querySelector("#builder-width-panel").hidden=state.stage<5;
  document.querySelector("#builder-forward-panel").hidden=state.stage<6;
}
function render(){
  const content=stageContent[state.stage];
  ui.title.textContent=content[0];ui.copy.textContent=content[1];ui.number.textContent=`0${state.stage} / 06`;
  ui.biasValue.textContent=format(state.bias);ui.widthValue.textContent=state.width;
  ui.activationCopy.textContent=state.activation==="relu"?"ReLU keeps positive signals and suppresses negative ones.":state.activation==="sigmoid"?"Sigmoid squeezes any value into the range from 0 to 1.":"Linear passes the weighted sum through unchanged.";
  ui.features.querySelectorAll("[data-builder-feature]").forEach((input,i)=>document.querySelector(`#builder-feature-value-${i}`).textContent=state.features[i].toFixed(2));
  ui.weights.querySelectorAll("[data-builder-weight]").forEach((input,i)=>document.querySelector(`#builder-weight-value-${i}`).textContent=format(state.weights[i]));
  renderVisibility();renderNetwork();renderMath();
}
document.querySelectorAll("[data-build-stage]").forEach(button=>button.addEventListener("click",()=>{state.stage=Number(button.dataset.buildStage);document.querySelectorAll("[data-build-stage]").forEach(item=>item.classList.toggle("is-selected",item===button));render();}));
ui.features.addEventListener("input",e=>{const input=e.target.closest("[data-builder-feature]");if(!input)return;state.features[Number(input.dataset.builderFeature)]=Number(input.value)/100;render();});
ui.weights.addEventListener("input",e=>{const input=e.target.closest("[data-builder-weight]");if(!input)return;state.weights[Number(input.dataset.builderWeight)]=Number(input.value)/100;hiddenProfiles[0].weights=[...state.weights];render();});
ui.bias.addEventListener("input",()=>{state.bias=Number(ui.bias.value)/100;hiddenProfiles[0].bias=state.bias;render();});
document.querySelectorAll("[data-builder-activation]").forEach(button=>button.addEventListener("click",()=>{state.activation=button.dataset.builderActivation;document.querySelectorAll("[data-builder-activation]").forEach(item=>item.classList.toggle("is-selected",item===button));render();}));
ui.width.addEventListener("input",()=>{state.width=Number(ui.width.value);render();});
document.querySelector("#builder-forward").addEventListener("click",()=>{state.pulse=true;render();setTimeout(()=>{state.pulse=false;render();},1100);});
buildControls();render();
