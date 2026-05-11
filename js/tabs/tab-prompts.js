// ══════════════════════════════════════════════════════════
// PROMPT ENGINEERING — Role builder with personas
// ══════════════════════════════════════════════════════════

const PROMPT_ROLES = [
  {
    id:'engineer', label:'⚙️ Engineer', icon:'⚙️',
    role:'a Senior Electrical & Instrumentation Engineer with 20 years of offshore oil & gas experience',
    task:'Review the following technical specification and identify any gaps, non-conformances, or areas that need clarification',
    context:'This is for an ATEX Zone 1 installation on a floating production facility. Standards include IEC 60079-14, NORSOK E-001, and client-specific specifications.',
    format:'Numbered list of findings, each with: Issue, Standard Reference, Recommended Action. Add a summary table at the end.'
  },
  {
    id:'legal', label:'⚖️ Legal', icon:'⚖️',
    role:'a commercial contracts lawyer specialising in oil & gas EPC and EPIC contracts',
    task:'Review this contract clause and identify any risks, ambiguities, or one-sided provisions',
    context:'This is a subcontract clause for a major offshore project operating under LOGIC standard terms. The reviewing party is the subcontractor.',
    format:'Section-by-section analysis with: Risk Rating (High/Med/Low), Description, Suggested Alternative Wording.'
  },
  {
    id:'photographer', label:'📷 Photographer', icon:'📷',
    role:'a professional photographer and photo editor with expertise in composition, lighting, and post-processing',
    task:'Analyse this photograph and provide detailed feedback on composition, lighting, colour grading, and technical quality',
    context:'The photographer is intermediate level and uses a mirrorless camera. They are looking to improve their technical and creative skills.',
    format:'Structured feedback with sections: Composition, Lighting, Colour, Technical, Top 3 Improvements. Be specific and constructive.'
  },
  {
    id:'editor', label:'✏️ Editor', icon:'✏️',
    role:'a professional copy editor and technical writer with experience across engineering, business, and academic writing',
    task:'Review and improve the following text for clarity, conciseness, grammar, and professional tone',
    context:'The text will be included in a formal engineering report submitted to a client. The audience is technical but may not be specialists in this specific field.',
    format:'Return the revised text, followed by a bullet list of significant changes made and the reasoning behind each.'
  },
  {
    id:'marketing', label:'📣 Marketing', icon:'📣',
    role:'a strategic marketing consultant with expertise in B2B industrial and technical services',
    task:'Write compelling marketing copy for the following product or service',
    context:'The target audience is procurement managers and senior engineers at oil & gas operating companies. The tone should be professional, credible, and benefit-focused.',
    format:'Include: Headline, 3-sentence value proposition, 3 key benefits (bullet points), call to action. Max 250 words total.'
  },
  {
    id:'manager', label:'👔 Manager', icon:'👔',
    role:'an experienced project manager and team leader with a background in engineering and technical delivery',
    task:'Help me draft a clear, professional communication to my team regarding the following situation',
    context:'This is for an offshore project team under schedule pressure. The message needs to be direct, motivating, and actionable without causing unnecessary anxiety.',
    format:'Short email format: Subject line, opening, 3–4 key points, action items with owners and dates, closing.'
  },
  {
    id:'counsellor', label:'🧠 Counsellor', icon:'🧠',
    role:'a qualified workplace counsellor and occupational psychologist',
    task:'Help me think through this workplace situation and consider the perspectives of all parties involved',
    context:'The person seeking help is dealing with a stressful professional situation and wants to explore it constructively. Maintain a neutral, empathetic stance.',
    format:'Reflective response exploring: Different perspectives, Underlying needs, Constructive options, Suggested first step. Avoid prescriptive advice.'
  },
  {
    id:'hse', label:'🦺 HSE Advisor', icon:'🦺',
    role:'a Chartered Safety Professional (CSP) with extensive experience in offshore and industrial HSE management',
    task:'Review this work method statement / risk assessment and identify gaps or improvements',
    context:'This is for an offshore operation on a dynamically positioned vessel. Applicable standards include NORSOK S-001, OGP guidelines, and the vessel-specific SAFE management system.',
    format:'Findings table: Ref, Hazard/Gap, Risk Level (1–5), Recommended Control, Standard Reference. Add overall recommendation.'
  },
  {
    id:'instructor', label:'📚 Instructor', icon:'📚',
    role:'an experienced technical trainer and instructional designer specialising in engineering and vocational education',
    task:'Explain the following technical concept clearly for someone new to the subject',
    context:'The learner has a general technical background but no specialist knowledge in this area. Use analogies and real-world examples wherever possible.',
    format:'Structured explanation: Plain English definition → Why it matters → How it works (step by step) → Common mistakes → Quick-check question.'
  },
  {
    id:'analyst', label:'📊 Data Analyst', icon:'📊',
    role:'a senior data analyst with expertise in operational data, KPIs, and engineering performance metrics',
    task:'Analyse the following data and provide key insights, trends, and recommendations',
    context:'This data relates to operational performance on an offshore facility. Stakeholders include operations managers and project engineers.',
    format:'Executive summary (3 sentences), Key findings (5 bullet points), Trend analysis, Recommendations table with Priority and Effort columns.'
  },
  {
    id:'custom', label:'✨ Custom Role', icon:'✨',
    role:'', task:'', context:'', format:''
  },
];

function renderPromptRoles() {
  const container = document.getElementById('promptRoleGrid');
  if (!container) return;
  container.innerHTML = PROMPT_ROLES.map(r =>
    `<button class="btn" id="prole_${r.id}" onclick="selectPromptRole('${r.id}')">${r.label}</button>`
  ).join('');
}

function selectPromptRole(id) {
  const role = PROMPT_ROLES.find(r => r.id === id);
  if (!role) return;
  // Highlight selected
  PROMPT_ROLES.forEach(r => document.getElementById('prole_'+r.id)?.classList.remove('active'));
  document.getElementById('prole_'+id)?.classList.add('active');

  // Fill fields (don't overwrite if custom)
  if (id !== 'custom') {
    document.getElementById('pgRole').value = role.role;
    document.getElementById('pgTask').value = role.task;
    document.getElementById('pgContext').value = role.context;
    document.getElementById('pgFormat').value = role.format;
  } else {
    document.getElementById('pgRole').value = '';
    document.getElementById('pgTask').value = '';
    document.getElementById('pgContext').value = '';
    document.getElementById('pgFormat').value = '';
    document.getElementById('pgRole').focus();
  }
  generatePrompt();
}

// ── Prompt tips (built-in, no fetch needed) ──
const PROMPT_TIPS = [
  { title:'1. Assign a clear role', body:'Start with "You are a [role] with [experience/expertise]…" — this primes the model\'s tone, vocabulary, and frame of reference.' },
  { title:'2. Be specific about the task', body:'Vague prompts get vague answers. "Summarise this" is worse than "Summarise the 3 key risks in 2 sentences each."' },
  { title:'3. Provide context', body:'Background constraints, audience, standards, and project context dramatically improve relevance. Use <context> tags for complex prompts.' },
  { title:'4. Specify the output format', body:'Tables, numbered lists, markdown, JSON, email format — tell the model exactly what you need. Include word/length constraints if relevant.' },
  { title:'5. Use XML tags to structure complex prompts', body:'<role>, <task>, <context>, <examples>, <format>, <output> — tags help the model parse multi-part instructions cleanly.' },
  { title:'6. Few-shot examples', body:'Show 1–3 examples of the input/output you want. Example: "Here\'s an acceptable output: [example]. Now do the same for: [your input]."' },
  { title:'7. Chain-of-thought prompting', body:'For complex reasoning, add "Think step by step" or "Show your working". Ask the model to reason before concluding.' },
  { title:'8. Negative constraints work too', body:'"Do NOT include…", "Avoid…", "Do not pad the response with…" can be as useful as positive instructions.' },
  { title:'9. Iterate, don\'t start over', body:'Good prompts are developed, not written once. If the first output is 70% right, refine with "Redo just the [section] part with [specific change]."' },
  { title:'10. System prompt vs user prompt', body:'For multi-turn conversations, put the role + context in a system prompt and keep user turns focused on the task.' },
  { title:'11. Temperature / style control', body:'Ask for "creative / varied" for ideation or "precise / factual / no hedging" for technical outputs.' },
  { title:'12. Ask for alternatives', body:'"Give me 3 different approaches / versions / phrasings" is often more useful than asking for one answer.' },
];

function renderPromptTipsBuiltin() {
  const el = document.getElementById('promptTipsBox');
  if (!el) return;
  el.innerHTML = PROMPT_TIPS.map(t =>
    `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:0.85rem;font-weight:600;color:var(--text);margin-bottom:3px">${t.title}</div>
      <div style="font-size:0.82rem;color:var(--text2)">${t.body}</div>
    </div>`
  ).join('');
}
