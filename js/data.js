/* ==========================================================================
   DATA
   --------------------------------------------------------------------------
   Edit this file to change site content without touching any HTML.
   Everything here is a plain array — add, remove, or reorder freely.
   ========================================================================== */

// Words that cycle in the homepage hero, under your name. Keep them short.
var ROLES = [
  'Designer.',
  'Developer.',
  'Systems thinker.',
  'Still compiling.'
];

// Short lines for the homepage terminal widget ("thoughts.log"). Add as many as you like.
var THOUGHTS = [
  'identity is a rough draft that never stops compiling',
  'most bugs are just decisions nobody revisited',
  'the interesting part of any system is where it breaks',
  'clean code and a clean conscience are maintained the same way: often',
  'a glitch is just the truth, rendered slightly out of sync',
  'still iterating. always will be.'
];

// Projects shown on the Projects page carousel and the homepage "Selected Work" grid.
// To add a project: copy one of the objects below, edit every field, and give it a
// unique "id" (used in the URL, e.g. projects.html#your-id). No HTML required.
var PROJECTS = [
  {
    id: 'signal',
    title: 'Signal',
    tagline: 'A real-time dashboard for reading noisy data clearly.',
    year: '2025',
    role: 'Frontend Developer',
    tags: ['JavaScript', 'D3.js', 'WebSockets'],
    description: 'Replace this with a real paragraph about the project: the problem it solved, the constraints you were working under, the decisions you made, and what you would do differently now.',
    liveUrl: 'http://127.0.0.1:3004/Stopwar.html?vscode-livepreview=true',
    codeUrl: 'https://github.com/KylerNexTech/StopWarProject.git'
  },
  {
    id: 'fragments',
    title: 'Fragments',
    tagline: 'A component library built around intentional inconsistency.',
    year: '2025',
    role: 'Design & Engineering',
    tags: ['Design Systems', 'CSS', 'Storybook'],
    description: 'Replace this with a real paragraph about the project. What made it interesting, technically or conceptually? What did you learn?',
    liveUrl: 'http://127.0.0.1:3006/index.html?vscode-livepreview=true',
    codeUrl: 'https://github.com/KylerNexTech/Rock-Paper-Scissors.git'
  },
  {
    id: 'lowfi',
    title: 'Lowfi',
    tagline: 'A generative ambient player with a hand-built audio engine.',
    year: '2024',
    role: 'Creative Developer',
    tags: ['Web Audio API', 'JavaScript', 'Canvas'],
    description: 'Replace this with a real paragraph about the project. This is a great spot to talk through a technical challenge you solved.',
    liveUrl: '#',
    codeUrl: '#'
  },
  {
    id: 'nullpointer',
    title: 'Null Pointer',
    tagline: 'A short narrative game about debugging your own memories.',
    year: '2024',
    role: 'Solo Developer',
    tags: ['Game Design', 'JavaScript', 'Writing'],
    description: 'Replace this with a real paragraph about the project. If it was a personal or experimental piece, say so — those are often the most memorable entries.',
    liveUrl: '#',
    codeUrl: '#'
  },
  {
    id: 'fieldnotes',
    title: 'Field Notes',
    tagline: 'An open-source CLI for turning terminal history into a journal.',
    year: '2023',
    role: 'Open Source Maintainer',
    tags: ['Node.js', 'CLI', 'Open Source'],
    description: 'Replace this with a real paragraph about the project. Mention adoption, contributors, or interesting feedback if relevant.',
    liveUrl: '#',
    codeUrl: '#'
  },
  {
    id: 'afterimage',
    title: 'Afterimage',
    tagline: 'A photo gallery that degrades each image slightly on every view.',
    year: '2023',
    role: 'Creative Developer',
    tags: ['Canvas', 'Design', 'JavaScript'],
    description: 'Replace this with a real paragraph about the project — a good place to talk about why you built something just because it was interesting.',
    liveUrl: '#',
    codeUrl: '#'
  }
];
