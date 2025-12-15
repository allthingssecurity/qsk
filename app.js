const API_DEFAULT = 'https://qsk.onrender.com/run';

const examples = [
  {
    id: 'reset-read',
    title: 'Reset + measure',
    level: 'basic',
    summary: 'Start clean on 1 qubit and measure.',
    detail: 'Shows the default computational basis measurement with no gates.',
    code: `# Python / Qiskit version
from qiskit import QuantumCircuit
qc = QuantumCircuit(1, 1)
qc.measure(0, 0)
print(qc)
`,
    explain: [
      { text: 'Allocate 1 qubit + 1 classical bit.' },
      { text: 'Measure immediately; expect |0> with 100% probability.', code: 'qc.measure(0,0)' },
    ],
    tags: ['gates', 'measure'],
  },
  {
    id: 'phase-rotate',
    title: 'Phase rotate',
    level: 'basic',
    summary: 'Apply a phase without changing probabilities.',
    detail: 'Phase shifts change interference but not measurement probabilities directly.',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(3, 3)
qc.x([0,1,2])
qc.p(1.57, 1)  # 90 degrees on qubit 1
qc.measure([0,1,2], [0,1,2])
print(qc)
`,
    explain: [
      { text: 'Initialize all three qubits to |1> so phases are visible.' },
      { text: 'Apply a 90° phase to qubit 1.', code: 'qc.p(1.57, 1)' },
      { text: 'Measure: probabilities stay the same; phase affects interference.' },
    ],
    tags: ['gates', 'phase'],
  },
  {
    id: 'had-superposition',
    title: 'Hadamard superposition',
    level: 'basic',
    summary: 'Reset 3 qubits, create uniform superposition, then read.',
    detail: 'Hadamard on all qubits gives equal probability on every basis state.',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(3, 3)
qc.h(range(3))
qc.measure(range(3), range(3))
print(qc)
`,
    explain: [
      { text: 'Allocate 3 qubits + 3 classical bits.' },
      { text: 'Apply Hadamard to all → uniform superposition of 0..7.', code: 'qc.h(range(3))' },
      { text: 'Measure: all 8 outcomes equally likely (ideal case).' },
    ],
    visual: {
      qubits: 3,
      cols: 4,
      frames: [
        { gates: [] },
        { gates: [{ type: 'h', qubit: 0, pos: 1 }, { type: 'h', qubit: 1, pos: 1 }, { type: 'h', qubit: 2, pos: 1 }] },
        { gates: [] },
      ],
    },
    tags: ['gates', 'hadamard', 'superposition'],
  },
  {
    id: 'bell',
    title: 'Bell pair with CNOT',
    level: 'basic',
    summary: 'Hadamard on the first qubit and CNOT into the second.',
    detail: 'Creates |00> + |11>, demonstrating entanglement.',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0,1], [0,1])
print(qc)
`,
    explain: [
      { text: 'Prepare two qubits in |00>.' },
      { text: 'Hadamard on qubit 0 → (|0>+|1>)/√2.', code: 'qc.h(0)' },
      { text: 'CNOT copies control to target → |00> + |11>.', code: 'qc.cx(0,1)' },
      { text: 'Measure both: only 00 or 11 outcomes appear.' },
    ],
    visual: {
      qubits: 2,
      cols: 5,
      frames: [
        { gates: [] },
        { gates: [{ type: 'h', qubit: 0, pos: 1 }] },
        { gates: [{ type: 'cx', control: 0, target: 1, pos: 2 }] },
        { gates: [] },
      ],
    },
    tags: ['gates', 'cnot', 'bell'],
  },
  {
    id: 'phase-rotate',
    title: 'Phase rotate',
    level: 'basic',
    summary: 'Apply a phase without changing probabilities.',
    detail: 'Phase shifts change interference but not measurement probabilities directly.',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(3, 3)
qc.x([0,1,2])
qc.p(1.57, 1)  # 90 degrees on qubit 1
qc.measure([0,1,2], [0,1,2])
print(qc)
`,
    tags: ['gates', 'phase'],
  },
  {
    id: 'ghz',
    title: 'GHZ state',
    level: 'intermediate',
    summary: 'Create |000> + |111> over 3 qubits.',
    detail: 'Shows multi-qubit entanglement: only all-0 or all-1 outcomes appear.',
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(0, 2)
qc.measure([0,1,2], [0,1,2])
print(qc)
`,
    explain: [
      { text: 'Start in |000>.' },
      { text: 'Hadamard on qubit 0 → (|0>+|1>)/√2.', code: 'qc.h(0)' },
      { text: 'CNOT from 0 to 1 entangles qubit 1.', code: 'qc.cx(0,1)' },
      { text: 'CNOT from 0 to 2 entangles qubit 2.', code: 'qc.cx(0,2)' },
      { text: 'Measure: outcomes are only 000 or 111.' },
    ],
    visual: {
      qubits: 3,
      cols: 6,
      frames: [
        { gates: [] },
        { gates: [{ type: 'h', qubit: 0, pos: 1 }] },
        { gates: [{ type: 'cx', control: 0, target: 1, pos: 2 }] },
        { gates: [{ type: 'cx', control: 0, target: 2, pos: 3 }] },
        { gates: [] },
      ],
    },
    tags: ['entanglement', 'ghz'],
  },
  {
    id: 'grover',
    title: 'Grover search (mark |101>)',
    level: 'advanced',
    summary: 'One Grover iteration marking |101>.',
    detail: 'Oracle marks |101>; diffuser amplifies it.',
    code: `from qiskit import QuantumCircuit

# Grover for |101> without subcircuits (Aer-friendly)
qc = QuantumCircuit(3, 3)

# 1) Initialize superposition
qc.h([0,1,2])

# 2) Oracle: phase flip on |101> (q2 q1 q0)
qc.x(1)
qc.h(2)
qc.ccx(0, 1, 2)
qc.h(2)
qc.x(1)

# 3) Diffuser
qc.h([0,1,2])
qc.x([0,1,2])
qc.h(2)
qc.ccx(0, 1, 2)
qc.h(2)
qc.x([0,1,2])
qc.h([0,1,2])

qc.measure([0,1,2], [0,1,2])
print(qc)
`,
    legend: [{ state: 5, label: '|101> target' }],
    impl: [
      'Hadamard layer creates uniform amplitudes.',
      'Oracle marks |101> with a phase flip.',
      'Diffuser reflects about the mean to amplify the marked state.'
    ],
    explain: [
      { text: 'Superpose all 8 states with H on 3 qubits.', code: 'qc.h([0,1,2])' },
      { text: 'Oracle: flip phase only on |101> by X on q1, CCX, undo.', code: 'qc.x(1); qc.ccx(0,1,2); qc.x(1)' },
      { text: 'Diffuser: Grover reflection about the mean.', code: 'H, X, CCX, X, H on all' },
      { text: 'Measure: |101> gets boosted probability.' },
    ],
    visual: {
      qubits: 3,
      cols: 6,
      frames: [
        { gates: [] },
        { gates: [{ type: 'h', qubit: 0, pos: 1 }, { type: 'h', qubit: 1, pos: 1 }, { type: 'h', qubit: 2, pos: 1 }] },
        { gates: [{ type: 'x', qubit: 1, pos: 2 }, { type: 'cx', control: 0, target: 2, pos: 3 }] },
        { gates: [{ type: 'cx', control: 0, target: 2, pos: 4 }] },
        { gates: [] },
      ],
    },
    tags: ['algorithm', 'grover'],
  },
  {
    id: 'deutsch',
    title: 'Deutsch–Jozsa (balanced oracle)',
    level: 'intermediate',
    summary: 'Detect a balanced oracle with one query.',
    detail: 'Balanced oracle flips phase on one output; post-Hadamard readout shows non-constant.',
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(3, 2)
# work qubit in |->
qc.x(2)
qc.h(2)
# superpose inputs
qc.h([0,1])

# Balanced oracle: f(x) = x0 XOR x1
qc.cx(0,2)
qc.cx(1,2)

# Hadamard to detect balance
qc.h([0,1])
qc.measure([0,1], [0,1])
print(qc)
`,
    explain: [
      { text: 'Prepare |000> then put qubits 0,1 in superposition.', code: 'qc.h([0,1])' },
      { text: 'Work qubit in |-⟩ to capture phase.', code: 'qc.x(2); qc.h(2)' },
      { text: 'Balanced oracle flips phase when x0 XOR x1 = 1.', code: 'qc.cx(0,2); qc.cx(1,2)' },
      { text: 'Hadamard on inputs reveals balance (non-constant).', code: 'qc.h([0,1])' },
      { text: 'Measure inputs; non-00 indicates balanced.' },
    ],
    tags: ['algorithm', 'deutsch-jozsa'],
  },
  {
    id: 'shor',
    title: 'Shor (toy period peaks for 15)',
    level: 'advanced',
    summary: 'Toy period-finding distribution for N=15.',
    detail: 'Peaks at multiples of the period hint at factors. Here: period ~4 → factors 3,5.',
    code: `from qiskit import QuantumCircuit

qc = QuantumCircuit(6, 6)
qc.h(range(6))
# placeholder for modular exp f(x)=2^x mod 15
# ...
# inverse QFT placeholder
# ...
qc.measure(range(6), range(6))
print(qc)
`,
    legend: [
      { state: 0, label: '0 (reference)' },
      { state: 16, label: 'period peak ~16' },
      { state: 32, label: 'period peak ~32' },
      { state: 48, label: 'period peak ~48' },
    ],
    impl: [
      'Prepare counting register in superposition.',
      'Apply modular exponentiation f(x)=a^x mod N (skipped here).',
      'Inverse QFT maps periodicity to peaks.',
      'Measure peaks to infer the period (hence factors).',
    ],
    explain: [
      { text: 'Superpose all counts in the 6-qubit register.', code: 'qc.h(range(6))' },
      { text: 'Apply modular exponentiation f(x)=2^x mod 15 (omitted in toy).' },
      { text: 'Inverse QFT would convert periodicity to peaks.' },
      { text: 'Measure to see peaks ~16 apart → period ~4 → factors 3,5.' },
    ],
    tags: ['algorithm', 'shor'],
  },
  {
    id: 'tsp',
    title: 'TSP (4 cities, phase oracle)',
    level: 'advanced',
    summary: 'Encode toy costs as phases and sample routes.',
    detail: 'Oracle applies phase proportional to route cost; diffuser amplifies cheaper routes. For teaching only.',
    code: `from qiskit import QuantumCircuit
from qiskit.circuit.library import MCXGate

D = [
    [0,3,4,2],
    [3,0,1,5],
    [4,1,0,6],
    [2,5,6,0],
]

qc = QuantumCircuit(4, 4)
qc.h(range(4))

# Phase kicks (toy: map bitstring to route cost proxy)
qc.p(-0.8, 2)  # bit2 dominant => pretend cheaper
qc.p(-0.5, 1)
qc.p(-0.3, 0)
qc.p(-0.2, 3)

# Simple diffuser
qc.h(range(4))
qc.x(range(4))
qc.h(3)
qc.mcx([0,1,2], 3)
qc.h(3)
qc.x(range(4))
qc.h(range(4))

qc.measure(range(4), range(4))
print(qc)
`,
    explain: [
      { text: 'Superpose 16 possible 4-bit routes.', code: 'qc.h(range(4))' },
      { text: 'Apply phase kicks to proxy route costs (toy).', code: 'qc.p(-0.8, 2); qc.p(-0.5,1); ...' },
      { text: 'Diffuser to amplify lower-phase (cheaper) routes.', code: 'Grover-style diffuser on 4 qubits' },
      { text: 'Measure routes with bias toward cheaper ones.' },
    ],
    visual: {
      qubits: 4,
      cols: 6,
      frames: [
        { gates: [] },
        { gates: [{ type: 'h', qubit: 0, pos: 1 }, { type: 'h', qubit: 1, pos: 1 }, { type: 'h', qubit: 2, pos: 1 }, { type: 'h', qubit: 3, pos: 1 }] },
        { gates: [{ type: 'p', qubit: 2, pos: 2 }, { type: 'p', qubit: 1, pos: 2 }] },
        { gates: [{ type: 'cx', control: 0, target: 3, pos: 3 }] },
        { gates: [] },
      ],
    },
    tags: ['algorithm', 'optimization'],
  },
];

const editor = document.getElementById('editor');
const exampleList = document.getElementById('exampleList');
const consoleEl = document.getElementById('console');
const viz = document.getElementById('viz');
const summaryEl = document.getElementById('summary');
const search = document.getElementById('search');
const levelFilter = document.getElementById('levelFilter');
const apiUrlInput = document.getElementById('apiUrl');
const runApiBtn = document.getElementById('runApi');
const explainBtn = document.getElementById('explain');
const explainList = document.getElementById('explainList');
const explainerStatus = document.getElementById('explainerStatus');
const explainText = document.getElementById('explainText');
const explainCode = document.getElementById('explainCode');
const explainProgress = document.getElementById('explainerProgress');
const visualGrid = document.getElementById('visualGrid');
let activeExample = null;
let explainTimer = null;

function renderCards(list) {
  exampleList.innerHTML = '';
  list.forEach((ex) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <p class="eyebrow">${ex.level.toUpperCase()}</p>
        <h3>${ex.title}</h3>
        <p>${ex.summary}</p>
      </div>
      <div class="actions">
        <button aria-label="Load ${ex.title}">Load</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', () => loadExample(ex));
    exampleList.appendChild(card);
  });

  if (!list.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No matches yet. Adjust filters or search.';
    exampleList.appendChild(empty);
  }
}

function applyFilters() {
  const term = search.value.toLowerCase();
  const level = levelFilter.value;
  const filtered = examples.filter((ex) => {
    const matchesTerm =
      ex.title.toLowerCase().includes(term) ||
      ex.summary.toLowerCase().includes(term) ||
      ex.tags.some((t) => t.toLowerCase().includes(term));
    const matchesLevel = level === 'all' || ex.level === level;
    return matchesTerm && matchesLevel;
  });
  renderCards(filtered);
}

function loadExample(ex) {
  activeExample = ex;
  editor.value = ex.code;
  summaryEl.textContent = `${ex.summary} (Level: ${ex.level}). ${ex.detail || ''}`.trim();
  consoleEl.textContent = `Loaded "${ex.title}". Use Run (preview) or Run via API.`;
  viz.innerHTML = '';
  renderExplainer(ex);
}

function maskToBits(maskStr, qubits) {
  if (maskStr === undefined || maskStr.trim() === '') return (1 << qubits) - 1;
  let mask = 0;
  try {
    if (maskStr.startsWith('0b')) mask = parseInt(maskStr, 2);
    else mask = parseInt(maskStr, 10);
    if (Number.isNaN(mask)) mask = 0;
  } catch {
    mask = 0;
  }
  return mask;
}

function bitPositions(mask) {
  const pos = [];
  let idx = 0;
  let m = mask;
  while (idx < 32) {
    if (m & 1) pos.push(idx);
    m >>= 1;
    if (m === 0) break;
    idx += 1;
  }
  return pos;
}

function applyHad(dist, mask, qubits) {
  const positions = bitPositions(mask || (1 << qubits) - 1);
  const newDist = new Map();
  const combos = 1 << positions.length;
  dist.forEach((prob, state) => {
    for (let combo = 0; combo < combos; combo++) {
      let newState = state;
      positions.forEach((pos, i) => {
        const bit = (combo >> i) & 1;
        if (bit) newState |= 1 << pos;
        else newState &= ~(1 << pos);
      });
      const add = prob / combos;
      newDist.set(newState, (newDist.get(newState) || 0) + add);
    }
  });
  return newDist;
}

function applyCNOT(dist, targetMask, controlMask) {
  const newDist = new Map();
  dist.forEach((prob, state) => {
    let newState = state;
    if ((state & controlMask) === controlMask) {
      newState = state ^ targetMask;
    }
    newDist.set(newState, (newDist.get(newState) || 0) + prob);
  });
  return newDist;
}

function normalize(dist) {
  let total = 0;
  dist.forEach((v) => (total += v));
  if (!total) return dist;
  dist.forEach((v, k) => dist.set(k, v / total));
  return dist;
}

function simulateWithContext(codeRaw, context) {
  const lines = codeRaw
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//') && !l.startsWith('#'));

  let qubits = 4;
  let dist = new Map([[0, 1]]);
  const notes = [];
  let weights = null; // used for TSP-style custom weighting

  for (const line of lines) {
    let m;
    if ((m = line.match(/qc\.reset\((\d+)\)/i))) {
      qubits = parseInt(m[1], 10) || qubits;
      dist = new Map([[0, 1]]);
      notes.push(`Reset to ${qubits} qubits.`);
      if (context.exampleId === 'tsp') {
        weights = null;
      }
    } else if ((m = line.match(/qc\.write\(([^)]+)\)/i))) {
      const val = parseInt(m[1], m[1].includes('0b') ? 2 : 10) || 0;
      dist = new Map([[val, 1]]);
      notes.push(`Wrote classical value ${val}.`);
    } else if ((m = line.match(/qc\.had\(([^)]*)\)/i))) {
      const mask = maskToBits(m[1], qubits);
      dist = applyHad(dist, mask, qubits);
      notes.push(mask ? `Hadamard on mask ${mask}.` : 'Hadamard on all qubits.');
      if (context.exampleId === 'tsp') {
        const totalStates = 1 << qubits;
        weights = Array(totalStates).fill(1);
      }
    } else if ((m = line.match(/qc\.phase\(([^,]+),([^)]+)\)/i))) {
      notes.push(`Phase ${m[1]}° on mask ${m[2].trim()} (probability unchanged).`);
      if (context.exampleId === 'tsp' && weights) {
        const angle = parseFloat(m[1]);
        const target = maskToBits(m[2], qubits);
        const boost = 1 + Math.abs(angle || 0) / 1.0; // toy weight proxy
        if (weights[target] !== undefined) {
          weights[target] *= boost;
        }
      }
    } else if ((m = line.match(/qc\.cnot\(([^,]+),([^)]+)\)/i))) {
      const target = maskToBits(m[1], qubits);
      const control = maskToBits(m[2], qubits);
      dist = applyCNOT(dist, target, control);
      notes.push(`CNOT target ${target}, control ${control}.`);
    } else if (/oracle_mark/i.test(line) || /diffuser/i.test(line)) {
      const totalStates = 1 << qubits;
      dist = new Map([[5, 0.62]]);
      const remaining = (1 - 0.62) / (totalStates - 1);
      for (let s = 0; s < totalStates; s++) {
        if (s === 5) continue;
        dist.set(s, remaining);
      }
      notes.push('Grover: mark |101> then diffuse to boost it (preview).');
    } else if (/shor/i.test(line)) {
      dist = new Map([
        [0, 0.18],
        [16, 0.22],
        [32, 0.22],
        [48, 0.18],
      ]);
      const other = 1 - 0.8;
      dist.set(8, other / 2);
      dist.set(56, other / 2);
      notes.push('Shor: period peaks (~16 apart) in preview.');
    } else if (/diffusion\(/i.test(line) && context.exampleId === 'tsp' && weights) {
      const newDist = new Map();
      const totalStates = weights.length;
      let sum = 0;
      for (let s = 0; s < totalStates; s++) sum += weights[s];
      for (let s = 0; s < totalStates; s++) {
        newDist.set(s, sum ? weights[s] / sum : 0);
      }
      dist = newDist;
      notes.push('TSP: phase-weighted routes converted to probabilities (preview).');
    } else if (/qc\.read\(/i.test(line)) {
      notes.push('Measurement sampled from histogram below.');
    }
  }

  if (!notes.length) notes.push('No recognizable QCengine steps parsed.');

  return { qubits, dist: normalize(dist), notes };
}

function renderHistogram(dist, qubits) {
  viz.innerHTML = '';
  const entries = [...dist.entries()].sort((a, b) => b[1] - a[1]);

  const maxBars = 24;
  let toRender = entries;
  if (entries.length > maxBars) {
    const head = entries.slice(0, maxBars - 1);
    const tailProb = entries.slice(maxBars - 1).reduce((s, [, p]) => s + p, 0);
    head.push([NaN, tailProb]);
    toRender = head;
  }

  toRender.forEach(([state, prob]) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${Math.max(8, prob * 260)}px`;
    const pct = `${(prob * 100).toFixed(1)}%`;
    bar.innerHTML = `<span>${pct}</span>`;

    const wrap = document.createElement('div');
    wrap.appendChild(bar);
    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = Number.isNaN(state) ? 'other' : state.toString(2).padStart(qubits, '0');
    wrap.appendChild(label);
    viz.appendChild(wrap);
  });
}

function runPreview() {
  const code = editor.value || '';
  const { qubits, dist, notes } = simulateWithContext(code, { exampleId: activeExample?.id });
  renderHistogram(dist, qubits);
  const lines = [];
  lines.push(`▶ Preview with ${qubits} qubits`);
  if (activeExample?.detail) {
    lines.push(`• ${activeExample.detail}`);
  }
  notes.forEach((n) => lines.push(`• ${n}`));
  lines.push('Top states:');
  const top = [...dist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  top.forEach(([state, p]) => {
    lines.push(`  |${state.toString(2).padStart(qubits, '0')}>  ${(p * 100).toFixed(2)}%`);
  });
  if (activeExample?.legend?.length) {
    lines.push('Legend (state → meaning):');
    activeExample.legend.forEach((item) => {
      lines.push(`  |${item.state.toString(2).padStart(qubits, '0')}>  ${item.label}`);
    });
  }
  if (activeExample?.impl?.length) {
    lines.push('Algorithm sketch:');
    activeExample.impl.forEach((step, idx) => {
      lines.push(`  ${idx + 1}. ${step}`);
    });
  }
  consoleEl.textContent = lines.join('\n');
}

function renderExplainer(ex) {
  explainList.innerHTML = '';
  explainerStatus.textContent = 'Walkthrough ready.';
  if (explainTimer) {
    clearInterval(explainTimer);
    explainTimer = null;
  }
  explainProgress.style.width = '0%';
  explainText.textContent = 'No step loaded.';
  explainCode.textContent = 'Code will appear here.';
  renderVisual(ex, 0);

  // Fallback text if no explainer content
  if (!ex.explain || !ex.explain.length) {
    const item = document.createElement('li');
    item.textContent = 'No explainer steps yet.';
    explainList.appendChild(item);
    return;
  }

  ex.explain.forEach((step) => {
    const li = document.createElement('li');
    li.innerHTML = `${step.text}${step.code ? `<span class="code">${step.code}</span>` : ''}`;
    explainList.appendChild(li);
  });
}

async function runApi() {
  const code = editor.value || '';
  if (!code.trim()) {
    consoleEl.textContent = 'Add some Python/Qiskit code first.';
    return;
  }
  const endpoint = (apiUrlInput.value || API_DEFAULT).trim();
  consoleEl.textContent = `Calling ${endpoint} ...`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, shots: 256 }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`API error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    const lines = [];
    if (data.error) lines.push(`Error: ${data.error}`);
    if (data.stdout) lines.push(data.stdout.trim());
    if (data.counts) {
      lines.push('Counts:');
      Object.entries(data.counts).forEach(([state, count]) => {
        lines.push(`  ${state}: ${count}`);
      });
      const total = Object.values(data.counts).reduce((s, v) => s + v, 0);
      const dist = new Map();
      Object.entries(data.counts).forEach(([state, cnt]) => {
        const val = parseInt(state, 0);
        const key = Number.isNaN(val) ? parseInt(state, 2) : val;
        dist.set(key, cnt / total);
      });
      renderHistogram(dist, activeExample?.qubits || 8);
    }
    consoleEl.textContent = lines.filter(Boolean).join('\n') || 'No output.';
  } catch (err) {
    consoleEl.textContent = `Run via API failed: ${err.message}`;
  }
}

function copyCode() {
  if (!editor.value) return;
  navigator.clipboard
    .writeText(editor.value)
    .then(() => (consoleEl.textContent = 'Copied code.'))
    .catch(() => (consoleEl.textContent = 'Clipboard blocked.'));
}

function clearEditor() {
  editor.value = '';
  viz.innerHTML = '';
  consoleEl.textContent = 'Workspace cleared.';
  summaryEl.textContent = 'Load an example to see details.';
}

function randomExample() {
  const pick = examples[Math.floor(Math.random() * examples.length)];
  loadExample(pick);
}

function playExplainer() {
  if (!activeExample) {
    consoleEl.textContent = 'Load an example first.';
    return;
  }
  // Highlight explainer steps one by one
  const items = [...explainList.querySelectorAll('li')];
  if (!items.length || items[0].textContent === 'No explainer steps yet.') {
    consoleEl.textContent = 'No explainer steps for this example.';
    return;
  }
  items.forEach((item) => item.classList.remove('active'));
  let idx = 0;
  if (explainTimer) clearInterval(explainTimer);
  explainerStatus.textContent = `Step 1 of ${items.length}`;
  items[0].classList.add('active');
  explainText.textContent = items[0].querySelector('.code') ? items[0].childNodes[0].textContent.trim() : items[0].textContent;
  explainCode.textContent = items[0].querySelector('.code') ? items[0].querySelector('.code').textContent : '';
  explainProgress.style.width = `${(1 / items.length) * 100}%`;
  renderVisual(activeExample, 0);
  idx = 1;
  explainTimer = setInterval(() => {
    items.forEach((item) => item.classList.remove('active'));
    if (idx >= items.length) {
      clearInterval(explainTimer);
      explainTimer = null;
      explainerStatus.textContent = 'Explainer finished.';
      explainProgress.style.width = '100%';
      renderVisual(activeExample, items.length - 1);
      return;
    }
    items[idx].classList.add('active');
    explainerStatus.textContent = `Step ${idx + 1} of ${items.length}`;
    explainText.textContent = items[idx].querySelector('.code') ? items[idx].childNodes[0].textContent.trim() : items[idx].textContent;
    explainCode.textContent = items[idx].querySelector('.code') ? items[idx].querySelector('.code').textContent : '';
    explainProgress.style.width = `${((idx + 1) / items.length) * 100}%`;
    renderVisual(activeExample, idx);
    idx += 1;
  }, 1200);
}

function renderVisual(ex, stepIdx) {
  visualGrid.innerHTML = '';
  if (!ex.visual || !ex.visual.frames || !ex.visual.frames.length) {
    const msg = document.createElement('p');
    msg.className = 'muted';
    msg.textContent = 'No visual for this example yet.';
    visualGrid.appendChild(msg);
    return;
  }
  const frame = ex.visual.frames[Math.min(stepIdx, ex.visual.frames.length - 1)];
  const qubits = ex.visual.qubits || 3;
  const cols = ex.visual.cols || 6;

  for (let q = 0; q < qubits; q++) {
    const wire = document.createElement('div');
    wire.className = 'wire';
    wire.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const gate = (frame.gates || []).find((g) => g.pos === c && (g.qubit === q || g.control === q || g.target === q));
      if (gate) {
        const g = document.createElement('div');
        const type = gate.type || '';
        g.className = 'gate';
        if (type === 'cx') g.classList.add('cx');
        g.textContent = type.toUpperCase();
        // mark control dots
        if (gate.control === q) g.classList.add('ctrl');
        cell.appendChild(g);
      }
      wire.appendChild(cell);
    }
    visualGrid.appendChild(wire);
  }
}

search.addEventListener('input', applyFilters);
levelFilter.addEventListener('change', applyFilters);
document.getElementById('run').addEventListener('click', runPreview);
document.getElementById('copy').addEventListener('click', copyCode);
document.getElementById('clear').addEventListener('click', clearEditor);
document.getElementById('random').addEventListener('click', randomExample);
runApiBtn.addEventListener('click', runApi);
explainBtn.addEventListener('click', playExplainer);

document.addEventListener('DOMContentLoaded', () => {
  apiUrlInput.value = API_DEFAULT;
  renderCards(examples);
  loadExample(examples[0]);
});
