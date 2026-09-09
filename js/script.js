/* =========================================================
   WEB LEARN HUB — script.js
   Shared JavaScript for every page. Defensive checks are used
   throughout so this file can safely load on any page without
   throwing errors for elements that don't exist there.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initActiveNav();
  initScrollReveal();
  initBackToTop();
  initSmoothScroll();
  initAnimatedStats();
  initAuthPage();
  initLessonsPage();
  initQuizPage();
  initContactForm();
});

/* ---------------------------------------------------------
   1. MOBILE NAVIGATION
--------------------------------------------------------- */
function initMobileMenu() {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      menuButton.classList.toggle('open');
      mobilePanel.classList.toggle('open');
    });

    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.classList.remove('open');
        mobilePanel.classList.remove('open');
      });
    });
  }
}

/* ---------------------------------------------------------
   2. ACTIVE NAVIGATION INDICATOR
--------------------------------------------------------- */
function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-panel a, .sidebar-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('#')[0];
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ---------------------------------------------------------
   3. SCROLL REVEAL
--------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   4. BACK TO TOP BUTTON
--------------------------------------------------------- */
function initBackToTop() {
  const backButton = document.querySelector('.back-to-top');
  if (!backButton) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 480) {
      backButton.classList.add('show');
    } else {
      backButton.classList.remove('show');
    }
  });

  backButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   5. SMOOTH SCROLL FOR ANCHOR LINKS
--------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    const [page, hash] = href.split('#');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (hash && (page === '' || page === currentPage)) {
      link.addEventListener('click', (e) => {
        const target = document.getElementById(hash);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });
}

/* ---------------------------------------------------------
   6. ANIMATED STATISTICS COUNTER
--------------------------------------------------------- */
function initAnimatedStats() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. DEMO AUTH SYSTEM (LOGIN / SIGN UP) — localStorage only
--------------------------------------------------------- */
function initAuthPage() {
  const authTabs = document.querySelectorAll('.auth-tabs button');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (authTabs.length) {
    authTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        authTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-target');

        document.querySelectorAll('.auth-form').forEach((f) => f.classList.remove('active'));
        const targetForm = document.getElementById(target);
        if (targetForm) targetForm.classList.add('active');
      });
    });
  }

  // Links inside the card that switch tabs ("Sign Up" / "Login")
  document.querySelectorAll('[data-switch-tab]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-switch-tab');
      const targetTab = document.querySelector(`.auth-tabs button[data-target="${targetId}"]`);
      if (targetTab) targetTab.click();
    });
  });

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name');
      const email = document.getElementById('signup-email');
      const password = document.getElementById('signup-password');
      const confirm = document.getElementById('signup-confirm');
      const terms = document.getElementById('signup-terms');
      const msg = document.getElementById('signup-msg');

      let valid = true;
      valid = validateField(name, name.value.trim().length >= 2, 'Please enter your full name.') && valid;
      valid = validateField(email, isValidEmail(email.value), 'Please enter a valid email address.') && valid;
      valid = validateField(password, password.value.length >= 6, 'Password must be at least 6 characters.') && valid;
      valid = validateField(confirm, confirm.value === password.value && confirm.value.length > 0, 'Passwords do not match.') && valid;

      if (terms && !terms.checked) {
        valid = false;
        showFormMessage(msg, 'Please agree to the Terms & Conditions.', 'error');
      }

      if (!valid) return;

      const account = {
        name: name.value.trim(),
        email: email.value.trim().toLowerCase(),
        password: password.value
      };

      localStorage.setItem('wlh_demo_account', JSON.stringify(account));
      showFormMessage(msg, 'Account created! You can now log in.', 'success');
      signupForm.reset();

      setTimeout(() => {
        const loginTab = document.querySelector('.auth-tabs button[data-target="login-form"]');
        if (loginTab) loginTab.click();
      }, 1200);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');
      const msg = document.getElementById('login-msg');

      let valid = true;
      valid = validateField(email, isValidEmail(email.value), 'Please enter a valid email address.') && valid;
      valid = validateField(password, password.value.length > 0, 'Please enter your password.') && valid;

      if (!valid) return;

      const stored = localStorage.getItem('wlh_demo_account');
      const account = stored ? JSON.parse(stored) : null;

      if (account && account.email === email.value.trim().toLowerCase() && account.password === password.value) {
        showFormMessage(msg, 'Login successful!', 'success');
        localStorage.setItem('wlh_logged_in', 'true');
      } else {
        showFormMessage(msg, 'Incorrect email or password. Try signing up first.', 'error');
      }
    });
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateField(input, condition, message) {
  if (!input) return true;
  const errorEl = input.parentElement.querySelector('.field-error');
  if (!condition) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    input.style.borderColor = '#C4342A';
    return false;
  }
  if (errorEl) errorEl.classList.remove('show');
  input.style.borderColor = '';
  return true;
}

function showFormMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = 'form-msg ' + type;
}

/* ---------------------------------------------------------
   8. LESSONS PAGE — data, filter, search, modal, progress
--------------------------------------------------------- */
const LESSON_DATA = [
  { id: 'html-1', category: 'html', num: 1, title: 'Introduction to HTML', desc: 'Understand what HTML is and why every web page starts here.', time: '15 min', objectives: ['Explain what HTML does on the web', 'Recognize the basic HTML document shape'], code: '<!DOCTYPE html>\n<html>\n  <head><title>My Page</title></head>\n  <body>\n    <h1>Hello, Web!</h1>\n  </body>\n</html>', output: 'A page showing the heading "Hello, Web!"', task: 'Create a page with a heading and one paragraph about yourself.' },
  { id: 'html-2', category: 'html', num: 2, title: 'HTML Document Structure', desc: 'Learn how head, body, and metadata fit together.', time: '18 min', objectives: ['Identify the role of <head> and <body>', 'Add metadata with <meta> tags'], code: '<head>\n  <meta charset="UTF-8">\n  <title>Page Title</title>\n</head>', output: 'A correctly structured, valid HTML document.', task: 'Add a charset and title to a blank HTML file.' },
  { id: 'html-3', category: 'html', num: 3, title: 'Headings and Paragraphs', desc: 'Structure text content with headings and paragraphs.', time: '12 min', objectives: ['Use heading levels h1–h6 correctly', 'Write readable paragraph content'], code: '<h1>Main Title</h1>\n<p>This is a paragraph of text.</p>', output: 'A page with a clear text hierarchy.', task: 'Write a short article with one h1 and three paragraphs.' },
  { id: 'html-4', category: 'html', num: 4, title: 'Links and Images', desc: 'Connect pages and add visuals with anchors and images.', time: '16 min', objectives: ['Create links with <a>', 'Embed images with <img> and alt text'], code: '<a href="about.html">About</a>\n<img src="photo.jpg" alt="A description">', output: 'A page with a working link and a displayed image.', task: 'Add a link to another page and an image with alt text.' },
  { id: 'html-5', category: 'html', num: 5, title: 'Lists and Tables', desc: 'Organize information with lists and tables.', time: '20 min', objectives: ['Build ordered and unordered lists', 'Structure data using <table>'], code: '<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>', output: 'A bulleted list and a simple data table.', task: 'Create a table showing three lessons and their difficulty.' },
  { id: 'html-6', category: 'html', num: 6, title: 'Forms', desc: 'Collect user input with HTML form elements.', time: '22 min', objectives: ['Use inputs, labels, and buttons', 'Understand form submission basics'], code: '<form>\n  <label>Name</label>\n  <input type="text" name="name">\n  <button>Submit</button>\n</form>', output: 'A working form with a text field and a submit button.', task: 'Build a small contact form with name and email fields.' },

  { id: 'css-1', category: 'css', num: 1, title: 'Introduction to CSS', desc: 'Learn how CSS styles HTML elements.', time: '15 min', objectives: ['Link a stylesheet to HTML', 'Understand selectors and declarations'], code: 'h1 {\n  color: #6D5DFB;\n  font-size: 2rem;\n}', output: 'A styled heading in purple.', task: 'Style a heading and a paragraph with custom colors.' },
  { id: 'css-2', category: 'css', num: 2, title: 'Selectors', desc: 'Target elements precisely using CSS selectors.', time: '18 min', objectives: ['Use class and ID selectors', 'Combine selectors for precision'], code: '.card { padding: 20px; }\n#main-title { font-weight: 800; }', output: 'Different elements styled independently.', task: 'Style three elements using class selectors only.' },
  { id: 'css-3', category: 'css', num: 3, title: 'Colors and Typography', desc: 'Set up a readable, attractive text system.', time: '16 min', objectives: ['Apply font-family and font-weight', 'Choose accessible color contrast'], code: 'body {\n  font-family: sans-serif;\n  color: #171717;\n}', output: 'Clean, readable page typography.', task: 'Create a simple type scale for headings and body text.' },
  { id: 'css-4', category: 'css', num: 4, title: 'Box Model', desc: 'Master margin, border, padding, and content.', time: '20 min', objectives: ['Explain the CSS box model', 'Control spacing with margin and padding'], code: '.box {\n  padding: 16px;\n  margin: 24px;\n  border: 1px solid #ccc;\n}', output: 'A neatly spaced box on the page.', task: 'Create a card with padding, margin, and a border.' },
  { id: 'css-5', category: 'css', num: 5, title: 'Flexbox', desc: 'Build flexible one-dimensional layouts.', time: '25 min', objectives: ['Use display: flex', 'Align and distribute items with flexbox'], code: '.row {\n  display: flex;\n  justify-content: space-between;\n}', output: 'Items evenly spaced in a row.', task: 'Lay out a navbar using flexbox.' },
  { id: 'css-6', category: 'css', num: 6, title: 'CSS Grid', desc: 'Build two-dimensional layouts with CSS Grid.', time: '25 min', objectives: ['Define grid columns and rows', 'Place items inside a grid'], code: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}', output: 'A responsive three-column card layout.', task: 'Create a 3-column grid of cards.' },
  { id: 'css-7', category: 'css', num: 7, title: 'Responsive Design', desc: 'Adapt layouts to any screen size.', time: '22 min', objectives: ['Write mobile-friendly media queries', 'Design mobile-first layouts'], code: '@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n}', output: 'A layout that adapts cleanly on mobile.', task: 'Make an existing layout collapse to one column on mobile.' },

  { id: 'js-1', category: 'javascript', num: 1, title: 'Introduction to JavaScript', desc: 'Understand what JavaScript adds to a webpage.', time: '15 min', objectives: ['Explain what JavaScript does in the browser', 'Add a script to an HTML page'], code: 'console.log("Hello, JavaScript!");', output: 'A message printed to the browser console.', task: 'Print your name to the console.' },
  { id: 'js-2', category: 'javascript', num: 2, title: 'Variables', desc: 'Store and reuse values with let and const.', time: '14 min', objectives: ['Declare variables with let and const', 'Understand variable scope basics'], code: 'let score = 0;\nconst name = "Setha";', output: 'Two variables ready to use in your program.', task: 'Declare variables for your name, age, and favorite language.' },
  { id: 'js-3', category: 'javascript', num: 3, title: 'Data Types', desc: 'Work with strings, numbers, booleans, and arrays.', time: '16 min', objectives: ['Identify JavaScript data types', 'Convert between types safely'], code: 'let count = 5;\nlet isDone = true;\nlet skills = ["HTML", "CSS"];', output: 'Variables of different types working together.', task: 'Create one variable of each basic data type.' },
  { id: 'js-4', category: 'javascript', num: 4, title: 'Conditions', desc: 'Control program flow using if/else statements.', time: '18 min', objectives: ['Write if, else if, and else statements', 'Combine conditions with logical operators'], code: 'if (score > 50) {\n  console.log("Pass");\n} else {\n  console.log("Try again");\n}', output: 'Different output depending on the condition.', task: 'Write a condition that checks if a number is even or odd.' },
  { id: 'js-5', category: 'javascript', num: 5, title: 'Loops', desc: 'Repeat actions using for and while loops.', time: '18 min', objectives: ['Write a for loop', 'Understand when to use while loops'], code: 'for (let i = 0; i < 5; i++) {\n  console.log(i);\n}', output: 'Numbers 0 through 4 printed in sequence.', task: 'Use a loop to print the numbers 1 to 10.' },
  { id: 'js-6', category: 'javascript', num: 6, title: 'Functions', desc: 'Package reusable logic into functions.', time: '20 min', objectives: ['Declare and call a function', 'Return values from a function'], code: 'function greet(name) {\n  return "Hello, " + name;\n}', output: 'A reusable greeting function.', task: 'Write a function that adds two numbers and returns the result.' },
  { id: 'js-7', category: 'javascript', num: 7, title: 'DOM Basics', desc: 'Select and update elements on the page.', time: '24 min', objectives: ['Select elements with querySelector', 'Update content and styles with JavaScript'], code: 'const title = document.querySelector("h1");\ntitle.textContent = "Updated!";', output: 'A heading whose text changes when the script runs.', task: 'Use JavaScript to change a button\'s text when clicked.' },

  { id: 'cb-1', category: 'computer', num: 1, title: 'What is a Computer?', desc: 'Learn the core purpose and parts of a computer.', time: '12 min', objectives: ['Define what a computer does', 'List the main components of a computer'], code: '', output: 'A clear mental model of input, processing, and output.', task: 'List five devices around you that are computers.' },
  { id: 'cb-2', category: 'computer', num: 2, title: 'Hardware', desc: 'Explore the physical parts of a computer system.', time: '15 min', objectives: ['Identify CPU, RAM, and storage', 'Explain the role of each hardware part'], code: '', output: 'An understanding of how hardware pieces work together.', task: 'Draw a diagram labeling four hardware components.' },
  { id: 'cb-3', category: 'computer', num: 3, title: 'Software', desc: 'Understand the difference between apps and systems.', time: '14 min', objectives: ['Differentiate system and application software', 'Give examples of each software type'], code: '', output: 'A list of software examples sorted by type.', task: 'List three apps you use and classify them.' },
  { id: 'cb-4', category: 'computer', num: 4, title: 'Operating Systems', desc: 'Learn what an OS does for a computer.', time: '16 min', objectives: ['Explain the role of an operating system', 'Compare common operating systems'], code: '', output: 'A comparison of two operating systems.', task: 'Write two sentences comparing Windows and macOS.' },
  { id: 'cb-5', category: 'computer', num: 5, title: 'File Management', desc: 'Organize files and folders efficiently.', time: '13 min', objectives: ['Create and organize folders', 'Understand file types and extensions'], code: '', output: 'A tidy example folder structure.', task: 'Organize five files into two labeled folders.' },
  { id: 'cb-6', category: 'computer', num: 6, title: 'Internet Basics', desc: 'Understand how the internet connects devices.', time: '17 min', objectives: ['Explain what the internet is', 'Describe how a webpage reaches your browser'], code: '', output: 'A simple explanation of a web request.', task: 'Describe, in your own words, what happens when you open a website.' }
];

function initLessonsPage() {
  const grid = document.getElementById('lesson-grid-dynamic');
  if (!grid) return;

  const searchInput = document.getElementById('lesson-search');
  const filterPills = document.querySelectorAll('.filter-pill');
  const noResults = document.getElementById('no-results');
  const modalOverlay = document.getElementById('lesson-modal');

  let activeCategory = 'all';

  function getProgress(id) {
    const data = JSON.parse(localStorage.getItem('wlh_progress') || '{}');
    return data[id] || 0;
  }

  function setProgress(id, value) {
    const data = JSON.parse(localStorage.getItem('wlh_progress') || '{}');
    data[id] = value;
    localStorage.setItem('wlh_progress', JSON.stringify(data));
  }

  function renderLessons() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filtered = LESSON_DATA.filter((lesson) => {
      const matchesCategory = activeCategory === 'all' || lesson.category === activeCategory;
      const matchesQuery = !query ||
        lesson.title.toLowerCase().includes(query) ||
        lesson.desc.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    grid.innerHTML = '';

    if (!filtered.length) {
      if (noResults) noResults.classList.add('show');
      return;
    }
    if (noResults) noResults.classList.remove('show');

    filtered.forEach((lesson) => {
      const progress = getProgress(lesson.id);
      const card = document.createElement('div');
      card.className = 'lesson-card reveal visible';
      card.innerHTML = `
        <div class="lesson-icon" aria-hidden="true"><i class="fa-solid ${categoryIcon(lesson.category)}"></i></div>
        <span class="lesson-num">Lesson ${lesson.num}</span>
        <h3>${lesson.title}</h3>
        <p class="desc">${lesson.desc}</p>
        <div class="lesson-meta">
          <span class="badge-level">Beginner</span>
          <span>${lesson.time}</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="card-footer">
          <span style="font-size:0.8rem;color:var(--muted);">${progress}% complete</span>
          <button class="btn btn-primary btn-sm" data-lesson-id="${lesson.id}">Start Lesson</button>
        </div>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('[data-lesson-id]').forEach((btn) => {
      btn.addEventListener('click', () => openLessonModal(btn.getAttribute('data-lesson-id')));
    });
  }

  function categoryIcon(category) {
    switch (category) {
      case 'html': return 'fa-code';
      case 'css': return 'fa-palette';
      case 'javascript': return 'fa-bolt';
      case 'computer': return 'fa-desktop';
      default: return 'fa-book';
    }
  }

  function openLessonModal(id) {
    const lesson = LESSON_DATA.find((l) => l.id === id);
    if (!lesson || !modalOverlay) return;

    const progress = getProgress(id);

    modalOverlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" aria-label="Close lesson">&times;</button>
        <h3 id="modal-title">${lesson.title}</h3>
        <p class="modal-level">Beginner &bull; ${lesson.time}</p>
        <h4>Learning Objectives</h4>
        <ul>${lesson.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
        <h4>Explanation</h4>
        <p>${lesson.desc}</p>
        ${lesson.code ? `<h4>Code Example</h4><div class="code-block">${escapeHtml(lesson.code)}</div>` : ''}
        <h4>Example Output</h4>
        <p>${lesson.output}</p>
        <h4>Practice Task</h4>
        <p>${lesson.task}</p>
        <div class="modal-progress">
          <div class="lesson-meta"><span>Your progress</span><span>${progress}%</span></div>
          <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-accent" id="mark-complete-btn">Mark as Complete</button>
          <button class="btn btn-outline" id="modal-close-btn">Close</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('open');

    const closeModal = () => modalOverlay.classList.remove('open');
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); }, { once: true });

    modalOverlay.querySelector('#mark-complete-btn').addEventListener('click', () => {
      setProgress(id, 100);
      closeModal();
      renderLessons();
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  if (filterPills.length) {
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.getAttribute('data-category');
        renderLessons();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderLessons);
  }

  renderLessons();

  // Also render a short "popular lessons" preview on the homepage if present
  const homePreview = document.getElementById('home-lesson-preview');
  if (homePreview) {
    const previewIds = ['html-1', 'css-1', 'js-1', 'cb-1'];
    homePreview.innerHTML = '';
    previewIds.forEach((id) => {
      const lesson = LESSON_DATA.find((l) => l.id === id);
      if (!lesson) return;
      const card = document.createElement('div');
      card.className = 'lesson-card reveal';
      card.innerHTML = `
        <div class="lesson-icon"><i class="fa-solid ${categoryIcon(lesson.category)}"></i></div>
        <h3>${lesson.title}</h3>
        <p class="desc">${lesson.desc}</p>
        <div class="lesson-meta"><span class="badge-level">Beginner</span><span>${lesson.time}</span></div>
        <div class="card-footer">
          <span></span>
          <a href="lessons.html" class="btn btn-primary btn-sm">Start Lesson</a>
        </div>
      `;
      homePreview.appendChild(card);
    });
    initScrollReveal();
  }
}

/* ---------------------------------------------------------
   9. QUIZ SYSTEM
--------------------------------------------------------- */
const QUIZ_DATA = {
  html: [
    { q: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Tool Multi Language', 'Home Text Management Language'], answer: 0 },
    { q: 'Which tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<head>'], answer: 2 },
    { q: 'Which tag creates a hyperlink?', options: ['<link>', '<a>', '<href>', '<nav>'], answer: 1 },
    { q: 'Which attribute provides alternate text for an image?', options: ['title', 'src', 'alt', 'desc'], answer: 2 },
    { q: 'Which tag is used to create an unordered list?', options: ['<ol>', '<ul>', '<list>', '<li>'], answer: 1 }
  ],
  css: [
    { q: 'What does CSS stand for?', options: ['Creative Style System', 'Cascading Style Sheets', 'Computer Style Syntax', 'Colorful Style Sheets'], answer: 1 },
    { q: 'Which property changes text color?', options: ['font-color', 'text-color', 'color', 'background-color'], answer: 2 },
    { q: 'Which value makes an element a flex container?', options: ['display: block', 'display: flex', 'display: inline', 'display: grid-flex'], answer: 1 },
    { q: 'Which property controls space inside an element\'s border?', options: ['margin', 'padding', 'spacing', 'gap'], answer: 1 },
    { q: 'Which selector targets an element with class "card"?', options: ['#card', '.card', 'card', '*card'], answer: 1 }
  ],
  javascript: [
    { q: 'Which keyword declares a variable that cannot be reassigned?', options: ['let', 'var', 'const', 'static'], answer: 2 },
    { q: 'Which method selects a single element by CSS selector?', options: ['getElementById', 'querySelector', 'getElementsByClass', 'selectElement'], answer: 1 },
    { q: 'What does `===` check in JavaScript?', options: ['Value only', 'Value and type', 'Type only', 'Nothing'], answer: 1 },
    { q: 'Which loop repeats while a condition is true?', options: ['for', 'while', 'if', 'switch'], answer: 1 },
    { q: 'How do you write a function in JavaScript?', options: ['function myFunc() {}', 'func myFunc() {}', 'def myFunc():', 'method myFunc() {}'], answer: 0 }
  ],
  computer: [
    { q: 'Which part of a computer performs calculations?', options: ['RAM', 'CPU', 'HDD', 'Monitor'], answer: 1 },
    { q: 'Which of these is an operating system?', options: ['Photoshop', 'Windows', 'Chrome', 'Word'], answer: 1 },
    { q: 'What does RAM stand for?', options: ['Random Access Memory', 'Read Access Method', 'Rapid Application Model', 'Run Active Memory'], answer: 0 },
    { q: 'Which device is used for permanent storage?', options: ['RAM', 'Cache', 'Hard Drive', 'CPU'], answer: 2 },
    { q: 'What is required to access the internet?', options: ['A monitor only', 'An internet connection', 'A printer', 'A keyboard only'], answer: 1 }
  ]
};

function initQuizPage() {
  const categoryButtons = document.querySelectorAll('[data-quiz-category]');
  const quizPanel = document.getElementById('quiz-panel');
  const resultCard = document.getElementById('result-card');
  const categorySection = document.getElementById('quiz-categories');
  if (!categoryButtons.length || !quizPanel) return;

  let currentCategory = null;
  let currentIndex = 0;
  let answers = [];

  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-quiz-category');
      answers = new Array(QUIZ_DATA[currentCategory].length).fill(null);
      currentIndex = 0;
      categorySection.style.display = 'none';
      quizPanel.classList.add('active');
      resultCard.classList.remove('active');
      renderQuestion();
    });
  });

  function renderQuestion() {
    const questions = QUIZ_DATA[currentCategory];
    const question = questions[currentIndex];
    const progressPercent = Math.round(((currentIndex) / questions.length) * 100);

    quizPanel.innerHTML = `
      <div class="quiz-header">
        <span style="font-weight:700;">Question ${currentIndex + 1} of ${questions.length}</span>
        <div class="progress-track" style="width:200px;"><div class="progress-fill" style="width:${progressPercent}%"></div></div>
      </div>
      <div class="quiz-card">
        <p class="quiz-question">${question.q}</p>
        <div class="quiz-options">
          ${question.options.map((opt, i) => `
            <button class="quiz-option ${answers[currentIndex] === i ? 'selected' : ''}" data-opt="${i}">
              <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-outline" id="prev-btn" ${currentIndex === 0 ? 'disabled' : ''}>Previous</button>
          ${currentIndex === questions.length - 1
            ? '<button class="btn btn-accent" id="submit-btn">Submit Test</button>'
            : '<button class="btn btn-primary" id="next-btn">Next</button>'}
        </div>
      </div>
    `;

    quizPanel.querySelectorAll('.quiz-option').forEach((optBtn) => {
      optBtn.addEventListener('click', () => {
        answers[currentIndex] = parseInt(optBtn.getAttribute('data-opt'), 10);
        renderQuestion();
      });
    });

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) prevBtn.addEventListener('click', () => { currentIndex--; renderQuestion(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentIndex++; renderQuestion(); });
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
  }

  function submitQuiz() {
    const questions = QUIZ_DATA[currentCategory];
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const percent = Math.round((correct / questions.length) * 100);

    quizPanel.classList.remove('active');
    resultCard.classList.add('active');

    let message = 'Nice effort! Review the lessons and try again.';
    if (percent >= 90) message = "Excellent! You're doing great!";
    else if (percent >= 70) message = 'Good job! Keep practicing!';
    else if (percent >= 50) message = 'Nice effort! Review the lessons and try again.';
    else message = "Keep going! Revisit the lessons and try the test again.";

    resultCard.innerHTML = `
      <p class="eyebrow-badge">Your Score</p>
      <div class="result-score">${correct} / ${questions.length}</div>
      <div class="result-percent">${percent}%</div>
      <p class="result-message">${message}</p>
      <div class="result-breakdown">
        <div><div class="num">${correct}</div><div class="lbl">Correct</div></div>
        <div><div class="num">${questions.length - correct}</div><div class="lbl">Incorrect</div></div>
        <div><div class="num">${questions.length}</div><div class="lbl">Total</div></div>
      </div>
      <div class="result-actions">
        <button class="btn btn-primary" id="try-again-btn">Try Again</button>
        <a href="lessons.html" class="btn btn-outline">Review Lessons</a>
      </div>
    `;

    document.getElementById('try-again-btn').addEventListener('click', () => {
      answers = new Array(questions.length).fill(null);
      currentIndex = 0;
      resultCard.classList.remove('active');
      quizPanel.classList.add('active');
      renderQuestion();
    });
  }
}

/* ---------------------------------------------------------
   10. CONTACT FORM VALIDATION
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name');
    const email = document.getElementById('contact-email');
    const subject = document.getElementById('contact-subject');
    const message = document.getElementById('contact-message');
    const msg = document.getElementById('contact-msg');

    let valid = true;
    valid = validateField(name, name.value.trim().length >= 2, 'Please enter your full name.') && valid;
    valid = validateField(email, isValidEmail(email.value), 'Please enter a valid email address.') && valid;
    valid = validateField(subject, subject.value.trim().length >= 2, 'Please enter a subject.') && valid;
    valid = validateField(message, message.value.trim().length >= 10, 'Message should be at least 10 characters.') && valid;

    if (!valid) return;

    showFormMessage(msg, 'Thank you! Your message has been received.', 'success');
    form.reset();
  });
}
