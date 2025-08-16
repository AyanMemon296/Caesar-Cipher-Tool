// === Matrix Rain Background (Self-contained) ===
(function () {
  const c = document.getElementById('matrix');
  const ctx = c.getContext('2d');
  let w, h, cols, y;
  const fontSize = 16;
  const glyphs = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function resize() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    cols = Math.floor(w / fontSize);
    y = Array(cols).fill(0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#39ff14';
    ctx.font = `${fontSize}px monospace`;
    for (let i = 0; i < cols; i++) {
      const text = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(text, i * fontSize, y[i] * fontSize);
      if (y[i] * fontSize > h && Math.random() > 0.975) {
        y[i] = 0;
      } else {
        y[i]++;
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ====================================
// Caesar Cipher Logic & UI Wiring
// ====================================

// Constants
const FIRST = 'A'.charCodeAt(0);
const RANGE = 26;
const el = id => document.getElementById(id);

// DOM Elements
const {
  message, shift, shiftNum, runBtn, copyBtn, clearBtn,
  btnEncrypt, btnDecrypt, cleaned: cleanedBox, removedMeta,
  lengthMeta, result, appliedShift, badgeEmoji, badgeText, shiftDir,
} = {
  message: el('message'),
  shift: el('shift'),
  shiftNum: el('shiftNum'),
  runBtn: el('runBtn'),
  copyBtn: el('copyBtn'),
  clearBtn: el('clearBtn'),
  btnEncrypt: el('btnEncrypt'),
  btnDecrypt: el('btnDecrypt'),
  cleaned: el('cleaned'),
  removedMeta: el('removedMeta'),
  lengthMeta: el('lengthMeta'),
  result: el('result'),
  appliedShift: el('appliedShift'),
  badgeEmoji: el('badgeEmoji'),
  badgeText: el('badgeText'),
  shiftDir: el('shiftDir'),
};

// Global state
let mode = 'E'; // 'E' for Encrypt, 'D' for Decrypt

/**
 * Sanitizes input message, keeping only letters (A-Z) and spaces.
 * @param {string} msg - The raw message string.
 * @returns {{cleaned: string, removed: string}} An object with the cleaned and removed characters.
 */
function cleanMessage(msg) {
  let cleaned = '';
  let removed = '';
  for (const ch of msg) {
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
      cleaned += ch.toUpperCase();
    } else if (ch === ' ') {
      cleaned += ' ';
    } else {
      removed += ch;
    }
  }
  return { cleaned, removed };
}

/**
 * Applies a Caesar cipher shift to a message.
 * @param {string} message - The message to shift.
 * @param {number} shift - The number of positions to shift.
 * @returns {string} The shifted message.
 */
function caesarShift(message, shift) {
  // Normalize shift to 0..25
  shift = ((shift % RANGE) + RANGE) % RANGE;
  let out = '';
  for (const ch of message) {
    if (ch >= 'A' && ch <= 'Z') {
      const code = ch.charCodeAt(0) - FIRST;
      const n = (code + shift) % RANGE;
      out += String.fromCharCode(FIRST + n);
    } else {
      out += ch; // Keep spaces
    }
  }
  return out;
}

/**
 * Updates the UI and performs encryption/decryption based on the current mode.
 */
function compute() {
  const { cleaned, removed } = cleanMessage(message.value || '');
  cleanedBox.textContent = cleaned;
  removedMeta.textContent = `Removed: ${removed.length}`;
  lengthMeta.textContent = `Length: ${cleaned.length}`;

  const s = parseInt(shift.value, 10) || 0;
  const applied = mode === 'E' ? s : -s;
  appliedShift.textContent = `${applied >= 0 ? '+' : ''}${applied}`;

  const output = mode === 'E' ? caesarShift(cleaned, s) : caesarShift(cleaned, -s);
  result.textContent = output;
}

/**
 * Handles mode changes (Encrypt/Decrypt).
 * @param {'E'|'D'} newMode - The new mode to switch to.
 */
function updateMode(newMode) {
  mode = newMode;
  const enc = mode === 'E';
  btnEncrypt.classList.toggle('active', enc);
  btnDecrypt.classList.toggle('active', !enc);
  badgeEmoji.textContent = enc ? '🔒' : '🔓';
  badgeText.textContent = enc ? 'Encrypted Message' : 'Decrypted Message';
  shiftDir.textContent = enc ? 'Right' : 'Left';
  compute();
}

/**
 * Syncs the shift value between the range slider and number input.
 * @param {'slider'|'number'} from - The source of the change.
 */
function syncShift(from) {
  if (from === 'slider') {
    shiftNum.value = shift.value;
  } else {
    let v = parseInt(shiftNum.value || 0, 10);
    if (Number.isNaN(v)) v = 0;
    v = Math.min(25, Math.max(0, v));
    shiftNum.value = v;
    shift.value = v;
  }
  compute();
}

// === Event Listeners ===
btnEncrypt.addEventListener('click', () => updateMode('E'));
btnDecrypt.addEventListener('click', () => updateMode('D'));
shift.addEventListener('input', () => syncShift('slider'));
shiftNum.addEventListener('input', () => syncShift('number'));
message.addEventListener('input', compute);
runBtn.addEventListener('click', compute);

clearBtn.addEventListener('click', () => {
  message.value = '';
  shift.value = 3;
  shiftNum.value = 3;
  updateMode('E');
  compute();
});

copyBtn.addEventListener('click', async () => {
  const text = result.textContent || '';
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Result', 900);
  } catch (e) {
    alert('Copy failed. You can select and copy manually.');
  }
});

// Initial state and demo text
message.value = 'Hello, World!';
compute();

// ====================================
// Brute Force Functionality
// ====================================

/**
 * Performs a brute-force decryption attack for all 25 possible shifts.
 */
function bruteForceDecrypt() {
  const bruteInput = el('bruteInput');
  const bruteResults = el('bruteResults');

  const raw = bruteInput.value || '';
  const { cleaned } = cleanMessage(raw);
  bruteResults.innerHTML = '';

  if (!cleaned.trim()) {
    bruteResults.textContent = 'Enter text containing letters (A–Z) to brute force.';
    return;
  }

  const ul = document.createElement('ul');

  for (let s = 1; s < 26; s++) {
    const out = caesarShift(cleaned, -s);
    const li = document.createElement('li');

    const label = document.createElement('strong');
    label.textContent = `Shift ${s}:`;

    const span = document.createElement('span');
    span.className = 'brute-text';
    span.textContent = out;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn ghost result-copy';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(out);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = prev, 900);
      } catch {
        alert('Copy failed — please select and copy manually.');
      }
    });

    li.append(label, span, copyBtn);
    ul.appendChild(li);
  }
  bruteResults.appendChild(ul);
}

// Wire the brute force button
el('runBruteBtn').addEventListener('click', bruteForceDecrypt);