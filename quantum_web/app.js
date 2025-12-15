const API_DEFAULT = 'http://localhost:8000/run';

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
    tags: ['gates', 'measure'],
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
    tags: ['gates', 'cnot', 'bell'],
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
    tags: ['entanglement', 'ghz'],
  },
  {
    id: 'grover',
    title: 'Grover search (mark |101>)',
    level: 'advanced',
    summary: 'One Grover iteration marking |101>.',
    detail: 'Oracle marks |101>; diffuser amplifies it.',
    code: `from qiskit import QuantumCircuit
from qiskit.circuit.library import MCXGate

def oracle_mark_101():
    qc = QuantumCircuit(3)
    qc.x(0)
    qc.x(2)
    qc.h(1)
    qc.mcx([0,1,2], 1)
    qc.h(1)
    qc.x(0)
    qc.x(2)
    return qc

def diffuser(n):
    qc = QuantumCircuit(n)
    qc.h(range(n))
    qc.x(range(n))
    qc.h(n-1)
    qc.mcx(list(range(n-1)), n-1)
    qc.h(n-1)
    qc.x(range(n))
    qc.h(range(n))
    return qc

qc = QuantumCircuit(3, 3)
qc.h(range(3))
qc.append(oracle_mark_101(), range(3))
qc.append(diffuser(3), range(3))
qc.measure(range(3), range(3))
print(qc)
`,
    legend: [{ state: 5, label: '|101> target' }],
    impl: [
      'Hadamard layer creates uniform amplitudes.',
      'Oracle marks |101> with a phase flip.',
      'Diffuser reflects about the mean to amplify the marked state.'
    ],
    tags: ['algorithm', 'grover'],
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
let activeExample = null;

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

search.addEventListener('input', applyFilters);
levelFilter.addEventListener('change', applyFilters);
document.getElementById('run').addEventListener('click', runPreview);
document.getElementById('copy').addEventListener('click', copyCode);
document.getElementById('clear').addEventListener('click', clearEditor);
document.getElementById('random').addEventListener('click', randomExample);
runApiBtn.addEventListener('click', runApi);

document.addEventListener('DOMContentLoaded', () => {
  apiUrlInput.value = API_DEFAULT;
  renderCards(examples);
  loadExample(examples[0]);
});
