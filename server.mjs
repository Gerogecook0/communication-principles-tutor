import { createServer } from 'node:http';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MODEL_PROVIDER = process.env.MODEL_PROVIDER || 'openrouter';
const AI_MODEL = process.env.AI_MODEL || 'openrouter/free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

const CHAPTERS = ['通信系统基本概念','确知信号分析','随机过程','信道与噪声','模拟调制','幅度调制 AM、DSB、SSB、VSB','角度调制 FM、PM','抽样定理','脉冲编码调制 PCM','数字基带传输','码间串扰','眼图','数字带通传输','ASK、FSK、PSK、DPSK','信息论基础','信道容量','差错控制编码','线性分组码','循环码','卷积码'];

const KNOWLEDGE = `
通信系统的基本任务是在发送端把消息变换为适合信道传输的信号，在接收端尽可能准确地恢复消息。典型通信系统由信源、发送设备、信道、接收设备和信宿组成。更完整的数字通信模型还包括信源编码、信道编码、调制、解调、信道译码和信源译码。通信的目的是传输消息中所包含的信息。消息是信息的物理表现形式，信息是消息的有效内容，信号是消息的传输载体。
通信系统常用性能指标包括有效性和可靠性。有效性通常用带宽、传输速率、频带利用率衡量。可靠性通常用信噪比、误码率、误符号率、输出信噪比衡量。
信源编码的主要作用是去除冗余、提高有效性；信道编码通过引入受控冗余提高可靠性；调制把基带信号变换为适合信道传输的带通信号；解调完成相反变换。
抽样定理：低通信号最高频率为 fm 时，若抽样频率 fs >= 2fm，理论上可由抽样值无失真恢复原信号；fs < 2fm 会发生频谱混叠。PCM 包括抽样、量化和编码。均匀量化噪声功率约为 Delta^2/12。非均匀量化通过 A 律或 mu 律压扩改善小信号量化信噪比。
AM 含载波和上下边带，带宽为 2W，可用包络检波但功率效率低。DSB-SC 抑制载波，功率效率高，带宽仍为 2W，需要相干解调。SSB 只传一个边带，带宽为 W，频带利用率高。VSB 传一个完整边带和另一边带的一部分。
FM 的瞬时频率随调制信号变化，包络近似恒定，抗幅度噪声能力强。单音调频指数 beta=Delta f/fm。Carson 公式：B≈2(Delta f+fm)=2fm(beta+1)。FM 存在门限效应。
数字基带传输直接在低通信道上传输码元波形。码间串扰 ISI 是相邻码元波形在抽样判决时相互干扰造成的失真。无码间串扰条件：系统总冲激响应在抽样时刻除主抽样点外其他码元间隔处为零。奈奎斯特第一准则的频域表述是等效传输函数按码元速率平移后的和为常数。升余弦系统带宽 B=(1+alpha)Rs/2。
匹配滤波器是在加性白噪声中最大化指定抽样时刻输出信噪比的线性滤波器。眼图张开越大，噪声容限和定时容限越高；眼图闭合说明码间串扰、噪声或定时抖动严重。
ASK 通过改变载波幅度表示符号；FSK 通过改变载波频率表示符号；PSK 通过改变载波相位表示符号；DPSK 用相邻码元相位差承载信息；QAM 同时改变同相和正交分量，频带利用率高。BPSK 相干检测误码率 Pb=Q(sqrt(2Eb/N0))。
信息量 I(x)=-log2 p(x)。信源熵 H(X) 是平均自信息，表示离散无记忆信源的平均不确定性。AWGN 信道容量 C=B log2(1+S/N)。香农第二定理指出传输速率低于信道容量时存在编码使误码率任意小。
差错控制编码通过引入受控冗余提升抗差错能力。分组码参数 (n,k)，码率 R=k/n。线性分组码可用生成矩阵 G 编码，用校验矩阵 H 检验。最小码距 dmin 决定检错纠错能力：可检测 e 个错误需要 dmin >= e+1；可纠正 t 个错误需要 dmin >= 2t+1。循环码可用生成多项式实现，CRC 常用于检错。卷积码有记忆，Viterbi 算法是常用译码方法。
`;

const HTML = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>通信原理智能出题与答疑系统</title><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;margin:0;background:#f6f8fb;color:#17202a}.wrap{max-width:1120px;margin:0 auto;padding:24px}h1{font-size:26px;margin:0 0 18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media(max-width:800px){.grid{grid-template-columns:1fr}}section{background:white;border:1px solid #d8e1ea;border-radius:8px;padding:18px}select,input,textarea,button{font:inherit}select,input,textarea{width:100%;box-sizing:border-box;border:1px solid #cfd9e3;border-radius:6px;padding:10px;margin:6px 0 12px}textarea{min-height:90px}button{background:#218697;color:white;border:0;border-radius:6px;padding:10px 16px;font-weight:700;cursor:pointer}pre{white-space:pre-wrap;background:#f9fbfd;border:1px solid #d8e1ea;border-radius:8px;padding:14px;line-height:1.7}</style></head><body><div class="wrap"><h1>通信原理智能出题与答疑系统</h1><div class="grid"><section><h2>出题</h2><label>章节</label><select id="chapter"></select><label>题型</label><select id="type"><option>单选题</option><option>多选题</option><option>判断题</option><option>填空题</option><option>简答题</option><option>计算题</option><option>综合题</option></select><label>难度</label><select id="difficulty"><option>基础</option><option>期末复习</option><option>考研难度</option><option>拔高难度</option></select><label>数量</label><input id="count" type="number" min="1" max="10" value="1"><button id="gen">生成题目</button><pre id="qout"></pre><textarea id="follow" placeholder="围绕当前题目追问，例如：为什么不选B？"></textarea><button id="fbtn">追问</button><pre id="fout"></pre></section><section><h2>答疑</h2><textarea id="ask" placeholder="输入通信原理问题，例如：奈奎斯特第一准则是什么意思？"></textarea><button id="abtn">提交问题</button><pre id="aout"></pre></section></div></div><script>const chapters=${JSON.stringify(CHAPTERS)};let current='';const $=s=>document.querySelector(s);chapters.forEach(c=>{let o=document.createElement('option');o.textContent=c;$('#chapter').appendChild(o)});async function post(u,b){const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json();if(!r.ok)throw new Error(j.error||'请求失败');return j}$('#gen').onclick=async()=>{qout.textContent='生成中...';let j=await post('/api/generate-questions',{chapter:chapter.value,questionType:type.value,difficulty:difficulty.value,count:Number(count.value)});current=j.result;qout.textContent=j.result};$('#abtn').onclick=async()=>{aout.textContent='回答中...';let j=await post('/api/ask',{question:ask.value});aout.textContent=j.result};$('#fbtn').onclick=async()=>{fout.textContent='追问中...';let j=await post('/api/follow-up',{question:follow.value,currentQuestion:current});fout.textContent=j.result};</script></body></html>`;

function sentences() {
  return KNOWLEDGE.split(/(?<=[。！？；.!?])\s*/).map(s => s.trim()).filter(s => s.length > 8);
}

function retrieve(query, limit = 8) {
  const q = String(query || '');
  const rawTerms = q.match(/[\u4e00-\u9fff]{2,}|[a-zA-Z0-9]+/g) || [];
  const terms = new Set(rawTerms);
  if (q.includes('通信系统') || q.includes('组成') || q.includes('部分')) ['信源','发送设备','信道','接收设备','信宿','基本任务'].forEach(t => terms.add(t));
  if (q.includes('抽样') || q.includes('采样')) ['抽样定理','fs','2fm','混叠'].forEach(t => terms.add(t));
  if (q.includes('码间串扰') || q.includes('ISI')) ['ISI','奈奎斯特','升余弦'].forEach(t => terms.add(t));
  return sentences().map(s => ({ text: s, score: [...terms].reduce((n, t) => n + (s.includes(t) ? 1 : 0), 0) })).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map(x => x.text).join('\n');
}

function deterministicAsk(input) {
  const q = String(input || '');
  if (/通信系统.*(组成|部分|环节)|由哪些/.test(q)) return '通信系统的基本组成可以概括为：信源、发送设备、信道、接收设备和信宿。\n\n信源产生要传输的消息；发送设备把消息变换成适合信道传输的信号；信道负责传输信号并可能引入噪声和失真；接收设备完成解调、译码等处理，尽可能恢复原消息；信宿是消息最终到达的对象。\n\n在数字通信系统中，还常进一步细分为信源编码、信道编码、调制、解调、信道译码和信源译码等模块。';
  if (/通信.*(是什么|定义|目的)|什么是通信/.test(q)) return '通信就是把消息中包含的信息从一方传送到另一方。通信原理中通常把消息变换成适合信道传输的信号，在接收端再尽可能准确地恢复消息。\n\n信息是消息中的有效内容，消息是信息的物理表现形式，信号是消息在通信系统中传输的载体。';
  if (/性能|有效性|可靠性/.test(q)) return '通信系统的主要性能指标包括有效性和可靠性。\n\n有效性反映传输资源利用得是否充分，常用传输速率、带宽和频带利用率衡量。可靠性反映接收端恢复消息的准确程度，常用信噪比、误码率、误符号率等衡量。';
  if (/抽样|采样/.test(q)) return '抽样定理说明：若低通信号最高频率为 fm，只要抽样频率 fs >= 2fm，理论上就可以由抽样值无失真恢复原信号。若 fs < 2fm，会发生频谱混叠。';
  if (/码间串扰|ISI/.test(q)) return '码间串扰 ISI 是指相邻码元波形在抽样判决时相互重叠干扰，导致当前码元判决受到前后码元影响。无码间串扰的关键条件是：系统总冲激响应在抽样时刻，除当前码元对应的主抽样点外，其他码元间隔处应为零。';
  if (/PCM|脉冲编码/.test(q)) return 'PCM 即脉冲编码调制，基本过程包括抽样、量化和编码。抽样把连续时间信号变成离散时间样值；量化把连续幅度样值映射到有限个量化电平；编码再把量化后的电平表示成二进制码组。';
  if (/香农|信道容量/.test(q)) return 'AWGN 信道容量公式为 C = B log2(1 + S/N)。其中 C 是信道容量，B 是信道带宽，S/N 是信噪比。它表示在给定带宽和信噪比条件下，理论上能够可靠传输的最高信息速率。';
  return '';
}

function localQuestion(input) {
  const text = String(input || '');
  const chapter = /章节：(.+)/.exec(text)?.[1]?.split('\n')[0] || '通信系统基本概念';
  const type = /题型：(.+)/.exec(text)?.[1]?.split('\n')[0] || '单选题';
  const difficulty = /难度：(.+)/.exec(text)?.[1]?.split('\n')[0] || '基础';
  return `题目 1：\n题型：${type}\n难度：${difficulty}\n知识点：${chapter}\n\n题干：\n通信系统的基本任务是什么？\n\nA. 在发送端把消息变换为适合信道传输的信号，在接收端尽可能准确地恢复消息。\nB. 只提高发送功率，不考虑接收端恢复。\nC. 只完成信道编码，与信号传输无关。\nD. 只研究设备成本，不关注可靠性。\n\n答案：\nA\n\n解析：\n通信系统的任务是完成消息到信号的发送变换，并在接收端尽可能准确地恢复消息。\n\n相关公式：无\n常见错误提醒：不要把通信系统简化为只有发送设备和接收设备，信道和接收恢复同样重要。`;
}

function answerFollow(text) {
  const m = String(text || '').toUpperCase().match(/选([A-D])|为什么是([A-D])|不选([A-D])/);
  const opt = (m && m.slice(1).find(Boolean)) || '';
  if (opt && opt !== 'A') return `这题不是选 ${opt}，而是选 A。\n\n${opt} 的问题通常是混淆了通信系统的组成、作用或评价指标。正确选项 A 表述了通信系统的基本任务：发送端把消息变换为适合信道传输的信号，接收端尽可能准确地恢复消息。`;
  return '本题答案是 A。A 直接对应通信系统的基本任务：发送端把消息变换为适合信道传输的信号，接收端尽可能准确地恢复消息。';
}

function isBadModelAnswer(text) {
  const s = String(text || '').trim();
  return !s || s.length < 45 || /请问您想了解|你想了解哪项|无法回答|不知道|没有提供|资料不足|知识库资料不足/.test(s);
}

async function callModel(task, input, fallback) {
  if (!OPENROUTER_API_KEY) return fallback;
  const context = retrieve(input, 8);
  const prompt = `你是通信原理课程智能助教。必须直接回答，不要反问用户。只基于给定资料回答或出题，不显示依据来源、文件名、页码、片段编号。\n\n资料：\n${context}\n\n任务：${task}\n\n用户要求：\n${input}`;
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + OPENROUTER_API_KEY, 'HTTP-Referer': 'https://render.com', 'X-Title': 'Communication Principles Tutor' }, body: JSON.stringify({ model: AI_MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.15 }) });
    if (!r.ok) throw new Error(await r.text());
    const j = await r.json();
    const answer = j.choices?.[0]?.message?.content?.trim() || '';
    return isBadModelAnswer(answer) ? fallback : answer;
  } catch { return fallback; }
}

async function modelAnswer(task, input) {
  if (task === 'ask') {
    const fixed = deterministicAsk(input);
    if (fixed) return fixed;
    const context = retrieve(input, 5);
    const fallback = context || '当前知识库资料不足，无法可靠回答。';
    return callModel(task, input, fallback);
  }
  if (task === 'follow') return callModel(task, input, answerFollow(input));
  return callModel(task, input, localQuestion(input));
}

async function readJson(req) { let s = ''; for await (const c of req) s += c; return s ? JSON.parse(s) : {}; }
function send(res, status, obj) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); }

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(HTML); return; }
    if (req.method === 'GET' && url.pathname === '/api/documents') { send(res, 200, { vectorChunks: sentences().length, model: `${MODEL_PROVIDER}:${AI_MODEL}`, hasApiKey: Boolean(OPENROUTER_API_KEY) }); return; }
    if (req.method === 'POST' && url.pathname === '/api/ask') { const b = await readJson(req); send(res, 200, { result: await modelAnswer('ask', b.question || '') }); return; }
    if (req.method === 'POST' && url.pathname === '/api/generate-questions') { const b = await readJson(req); send(res, 200, { result: await modelAnswer('generate', `章节：${b.chapter}\n题型：${b.questionType}\n难度：${b.difficulty}\n数量：${b.count}`) }); return; }
    if (req.method === 'POST' && url.pathname === '/api/follow-up') { const b = await readJson(req); send(res, 200, { result: await modelAnswer('follow', `当前题目：${b.currentQuestion || ''}\n追问：${b.question || ''}`) }); return; }
    send(res, 404, { error: 'Not found' });
  } catch (e) { send(res, 400, { error: e.message || String(e) }); }
}).listen(PORT, HOST, () => console.log(`Listening on ${HOST}:${PORT}`));
