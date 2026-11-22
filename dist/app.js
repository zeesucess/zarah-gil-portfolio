import { personal, projects, experience, skills, tools, zeeTracks } from './data.js?v=course-capabilities';

const byId = (id) => document.getElementById(id);

function el(tag, value, attrs = {}) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  for (const [key, val] of Object.entries(attrs)) node.setAttribute(key, val);
  return node;
}

function external(label, url, className = '') {
  return el('a', label, { href: url, target: '_blank', rel: 'noopener noreferrer', class: className });
}

function list(items) {
  const ul = el('ul');
  for (const item of items) ul.append(el('li', item));
  return ul;
}

function projectCard(project) {
  const card = el('article', '', { class: 'project', id: project.id });
  const preview = el('figure', '', { class: 'preview' });
  if (project.image) {
    preview.append(el('img', '', { src: project.image, alt: project.imageAlt || `Screenshot of ${project.title}`, loading: 'lazy' }));
  } else {
    const placeholder = el('div', project.title, { class: 'placeholder' });
    placeholder.append(el('span', 'Project screenshot pending'));
    preview.append(placeholder);
  }
  if (project.externalUrl) {
    preview.append(el('span', 'View Project', { class: 'preview-label', 'aria-hidden': 'true' }));
  }
  const body = el('div', '', { class: 'project-body' });
  const meta = [project.category, project.platform].filter(Boolean).join(' · ');
  body.append(el('p', meta, { class: 'project-meta' }), el('h3', project.title), el('p', project.description));
  const actions = el('div', '', { class: 'project-links' });
  if (project.externalUrl) {
    const link = external(project.cta || 'View Project', project.externalUrl);
    link.setAttribute('aria-label', `${project.cta || 'View Project'} for ${project.title} (opens in a new tab)`);
    if (project.id === 'haus-quiz') {
      card.classList.add('project-clickable');
      link.classList.add('project-card-link');
    }
    link.append(el('span', '↗', { class: 'project-link-arrow', 'aria-hidden': 'true' }));
    actions.append(link);
  }
  if (project.designUrl) {
    const link = external('View Figma Design', project.designUrl);
    link.setAttribute('aria-label', `View Figma Design for ${project.title} (opens in a new tab)`);
    actions.append(link);
  }
  if (project.designUrl) actions.classList.add('project-links-multiple');
  const details = el('details');
  details.append(el('summary', 'View Case Study'), el('p', project.role));
  if (project.scope?.length) details.append(list(project.scope));
  if (project.highlights?.length) {
    details.append(el('h4', 'Website Highlights'), list(project.highlights));
  }
  if (project.detailedDescription) details.append(el('p', project.detailedDescription));
  for (const image of project.additionalImages || []) details.append(el('img', '', { src: image.src, alt: image.alt, loading: 'lazy', style: 'max-width:100%;height:auto' }));
  actions.append(details);
  body.append(actions);
  if (project.previewOpensCaseStudy) {
    const trigger = el('button', '', {
      type: 'button', class: 'project-preview-link project-case-trigger',
      'aria-label': `View case study for ${project.title}`,
      'aria-controls': `${project.id}-case-study`, 'aria-expanded': 'false'
    });
    details.id = `${project.id}-case-study`;
    trigger.append(...preview.childNodes);
    trigger.classList.add('preview');
    trigger.addEventListener('click', () => {
      details.open = true;
      details.querySelector('summary').focus();
    });
    details.addEventListener('toggle', () => trigger.setAttribute('aria-expanded', String(details.open)));
    card.append(trigger, body);
  } else if (project.externalUrl && project.id !== 'haus-quiz') {
    const previewLink = external('', project.externalUrl, 'project-preview-link');
    previewLink.setAttribute('aria-label', `Open ${project.title} (opens in a new tab)`);
    previewLink.append(preview);
    card.append(previewLink, body);
  } else {
    card.append(preview, body);
  }
  return card;
}

for (const project of projects.filter(({ featured }) => featured)) byId('projects').append(projectCard(project));

let expandedExperience;
for (const [index, item] of experience.entries()) {
  const entry = el('article', '', { class: 'timeline-entry' });
  const id = `experience-panel-${index + 1}`;
  const trigger = el('button', '', {
    type: 'button',
    class: 'timeline-trigger',
    'aria-controls': id,
    'aria-expanded': 'false'
  });
  const heading = el('h3');
  const summary = el('span', '', { class: 'timeline-summary' });
  summary.append(
    el('span', item.company, { class: 'timeline-company' }),
    el('span', item.position, { class: 'timeline-position' }),
    el('span', item.dates, { class: 'timeline-dates' })
  );
  trigger.append(summary, el('span', '', { class: 'timeline-indicator', 'aria-hidden': 'true' }));
  heading.append(trigger);

  const panel = el('div', '', { class: 'timeline-panel', id, inert: '' });
  const body = el('div', '', { class: 'timeline-panel-body' });
  const details = el('div', '', { class: 'timeline-details' });
  if (item.description) details.append(el('p', item.description));
  if (item.responsibilities.length) {
    if (item.description) details.append(el('h4', 'Responsibilities'));
    details.append(list(item.responsibilities));
  }
  if (item.highlights) details.append(el('h4', 'Professional highlights'), list(item.highlights));
  for (const assignment of item.assignments || []) {
    details.append(el('h4', assignment.title), el('p', assignment.position), list(assignment.responsibilities));
  }
  body.append(details);
  panel.append(body);
  entry.append(heading, panel);
  byId('timeline').append(entry);

  function setExpanded(open) {
    trigger.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
    if (open) expandedExperience = setExpanded;
  }

  if (index === 0) setExpanded(true);
  trigger.addEventListener('click', () => {
    const wasOpen = expandedExperience === setExpanded;
    expandedExperience?.(false);
    expandedExperience = undefined;
    if (!wasOpen) setExpanded(true);
  });
}
const education = el('article');
education.append(el('h3', 'Education'), el('p', personal.education.title), el('p', `${personal.education.school} · ${personal.education.dates}`));
if (personal.certification.title) education.append(el('p', `${personal.certification.title} · ${personal.certification.provider}`));
byId('timeline').append(education);

for (const [label, items] of Object.entries(skills)) {
  const group = el('div');
  group.append(el('h3', label), list(items));
  byId('skill-groups').append(group);
}
for (const [label, items] of Object.entries(tools)) {
  const group = el('div');
  const grid = el('ul', '', { class: 'tool-grid' });
  for (const [name, file] of items) {
    const item = el('li');
    item.append(el('img', '', {
      src: `/images/tools/${file}`, alt: '', width: '22', height: '22', loading: 'lazy'
    }), el('span', name));
    grid.append(item);
  }
  group.append(el('h4', label), grid);
  byId('tool-groups').append(group);
}

const contact = byId('contact-links');
const icons = {
  Email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  LinkedIn: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v1m5 9v-7m0 3a3 3 0 0 1 6 0v4"/>',
  Facebook: '<path d="M14 21v-8h3l1-4h-4V7c0-1 1-2 2-2h2V2h-3a5 5 0 0 0-5 5v2H7v4h3v8"/>',
  Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01" stroke-linecap="round"/>'
};
const profiles = { LinkedIn: personal.linkedin, Facebook: personal.facebook, Instagram: personal.instagram, Email: personal.email && `mailto:${personal.email}` };
const socials = el('div', '', { class: 'socials' });
for (const [label, url] of Object.entries(profiles)) {
  if (!url) continue;
  const link = label === 'Email' ? el('a', '', { href: url }) : external('', url);
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.innerHTML = icons[label];
  link.append(icon, document.createTextNode(label));
  socials.append(link);
}
byId('footer-social').append(socials);

const contactMethods = [
  { label: 'Email', text: personal.email, url: profiles.Email, icon: icons.Email },
  { label: 'LinkedIn', text: 'Connect on LinkedIn', url: profiles.LinkedIn, icon: icons.LinkedIn, newTab: true },
  { label: 'Phone', text: personal.phone.display, url: `tel:${personal.phone.dial}`, icon: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A18 18 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.6 3a2 2 0 0 1-.5 2L8 10a14 14 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2-.5l3 .6a2 2 0 0 1 1.7 2Z"/>' },
  { label: 'WhatsApp', text: 'Chat on WhatsApp', url: personal.messaging.WhatsApp, icon: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.8 7.3L3 20l1.2-4.4A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="m9 8-1 1c0 3 3 6 6 6l1-1-2-1-1 1-2-2 1-1-2-3Z"/>', newTab: true },
];
for (const { label, text, url, icon, newTab } of contactMethods) {
  if (!url) continue;
  const link = newTab ? external('', url) : el('a', '', { href: url });
  link.classList.add('contact-method');
  const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  symbol.setAttribute('viewBox', '0 0 24 24');
  symbol.setAttribute('aria-hidden', 'true');
  symbol.innerHTML = icon;
  const copy = el('span', '', { class: 'contact-method-copy' });
  copy.append(el('strong', label), el('span', text));
  link.append(symbol, copy);
  contact.append(link);
}

const contactForm = byId('contact-form');
const contactStatus = contactForm.querySelector('.contact-status');
const submitContact = contactForm.querySelector('button[type="submit"]');
let previousContactPayload;
let contactSubmissionId;

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submitContact.disabled) return;
  const payload = new URLSearchParams(new FormData(contactForm));
  const serialized = payload.toString();
  if (serialized !== previousContactPayload) {
    previousContactPayload = serialized;
    contactSubmissionId = crypto.randomUUID();
  }
  payload.set('id', contactSubmissionId);
  submitContact.disabled = true;
  contactStatus.textContent = 'Sending your message…';
  try {
    const response = await fetch(contactForm.action, { method: 'POST', body: payload });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    contactForm.reset();
    previousContactPayload = undefined;
    contactStatus.textContent = result.message;
  } catch (error) {
    contactStatus.textContent = error.message && error.message.startsWith('Check your')
      ? error.message
      : 'Your message could not be sent. Please try again or use the email link.';
  } finally {
    submitContact.disabled = false;
  }
});

const resume = byId('resume-actions');
if (personal.resume) {
  byId('resume').hidden = false;
  const actions = el('div', '', { class: 'actions' });
  actions.append(external('View Resume', personal.resume, 'button solid'));
  actions.append(el('a', 'Download My CV', { class: 'button', href: personal.resume, download: 'zarah-gil-resume.pdf' }));
  resume.append(actions);
  for (const link of document.querySelectorAll('[data-resume]')) {
    link.href = personal.resume;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
} else {
  for (const link of document.querySelectorAll('a[href="#resume"]')) link.hidden = true;
}

const menu = document.querySelector('.menu');
const nav = byId('nav-links');
const mobileMenu = window.matchMedia('(max-width: 820px)');
function setMenu(open) {
  nav.toggleAttribute('data-open', open);
  menu.setAttribute('aria-expanded', String(open));
  nav.inert = mobileMenu.matches && !open;
}
setMenu(false);
mobileMenu.addEventListener('change', () => setMenu(false));
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !mobileMenu.matches) return;
  const target = byId(link.hash.slice(1));
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.hasAttribute('data-open')) {
    setMenu(false);
    menu.focus();
  }
});

const sectionLinks = [...nav.querySelectorAll('a:not(.nav-cv)')];
const navSections = sectionLinks.map((link) => byId(link.hash.slice(1)));
function markCurrentSection() {
  let active = navSections[0];
  for (const section of navSections) {
    if (section.getBoundingClientRect().top <= 140) active = section;
  }
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = navSections.at(-1);
  for (const link of sectionLinks) {
    if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', markCurrentSection, { passive: true });
window.addEventListener('resize', markCurrentSection);
markCurrentSection();

const motionPreference = window.matchMedia('(prefers-reduced-motion: no-preference)');
if (motionPreference.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (motionPreference.matches && !entry.target.matches(':focus-within')) {
        entry.target.classList.add(entry.target.matches('.tool-grid li') ? 'motion-pop' : 'motion-arrive');
      }
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06 });

  const pieces = document.querySelectorAll(
    '#about .about-image, #about .copy, .section-head, .project, .client-project-experience, ' +
    '#experience > div:first-child, .timeline article, #skills h2, #skill-groups > div, ' +
    '.tool-grid li, .recognition-feature, .certificate-grid article, .testimonial-feature, .testimonial-grid a, ' +
    '#contact .contact-info, .contact-form, .resume, .footer > .editorial-sparkles'
  );
  function observeReveals() {
    for (const piece of pieces) {
      const index = Array.prototype.indexOf.call(piece.parentElement.children, piece);
      piece.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
      reveal.observe(piece);
    }
  }

  const root = document.documentElement;
  if (root.dataset.welcome === 'open') {
    const welcomeState = new MutationObserver(() => {
      if (root.dataset.welcome === 'open') return;
      welcomeState.disconnect();
      observeReveals();
    });
    welcomeState.observe(root, { attributes: true, attributeFilter: ['data-welcome'] });
  } else {
    observeReveals();
  }
}

const welcomeChime = byId('welcome-chime');
const zeeHero = document.querySelector('.hero-avatar');
const zeeDock = document.querySelector('.zee-dock');
const portfolioFooter = document.querySelector('footer');
const zeeHeroButton = zeeHero.querySelector('.zee-trigger');
const zeeDockButton = zeeDock.querySelector('.zee-trigger');
const zeeChat = byId('zee-chat');
const zeeMessage = zeeChat.querySelector('.zee-message');
const zeeAction = zeeChat.querySelector('.zee-action');
const zeeClose = zeeChat.querySelector('.zee-close');
const zeeFact = zeeChat.querySelector('.zee-fact');
const zeePlayActions = zeeChat.querySelector('.zee-play-actions');
const zeeMusic = zeeChat.querySelector('.zee-music');
const zeeMusicStatus = zeeMusic.querySelector('.zee-music-status');
let zeeAudio;

function stopZeeBreak() {
  const audio = zeeAudio;
  zeeAudio = undefined;
  if (audio) {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
  if (!zeeMusic.hidden) setZeeActivity(zeeRestModes[zeeSection] ?? 'hello');
  zeeMusic.hidden = true;
}

window.addEventListener('pagehide', stopZeeBreak);


const zeeNotes = {
  home: ["Hi there! Welcome to my little corner of the internet. I'm glad you're here!", 'Explore my work', '#work'],
  about: ["Want to know a little more about me? I'm a digital marketer who loves creativity, strategy, and building things!", 'See what I do', '#skills'],
  work: ["Now this is my favorite part! Come see what I've been working on.", 'Explore featured projects', '#projects'],
  experience: ["Here's a little look at my professional journey!", 'See what I do', '#skills'],
  skills: ['Fun fact: I genuinely enjoy turning complicated marketing processes into simple, effective systems.', 'Work with me', '#contact'],
  contact: ["Have a project in mind? I'd love to hear about it. Let's work together!", 'Let’s connect!', profiles.Email || profiles.LinkedIn || profiles.Instagram || profiles.Facebook || ''],
};
const zeeFacts = [
  'Funnel design and marketing automation are two things I can happily nerd out about.',
  'I love singing and music.',
  'Iced coffee makes creative work even better.',
  'I love finding where creativity and technology meet.',
  'Learning a new tool is even better when it makes a workflow simpler.',
  'Finding a smarter way to do something is my kind of puzzle.',
];
const zeeSections = Object.keys(zeeNotes).map(byId);
let zeeSection = zeeSections[0].id;
let zeeTrigger = null;
let zeeFactIndex = 0;
let zeeLastScroll;
let zeeStopTimer;
let zeeActivityTimer;
let zeeActivitySection;
const zeeSurprises = new Set();
const zeeRestModes = { about: 'coffee', work: 'tablet', experience: 'tablet', skills: 'tablet', contact: 'hello' };

function setZeeActivity(activity) {
  clearTimeout(zeeActivityTimer);
  zeeDock.dataset.activity = activity;
}

function performZeeActivity(activity, duration) {
  if (zeeDock.hidden) return;
  setZeeActivity(activity);
  zeeActivityTimer = setTimeout(() => setZeeActivity(zeeRestModes[zeeSection] ?? 'hello'), duration);
}

function settleZeeAtStop(section) {
  if (zeeDock.hidden || section !== zeeSection) return;
  setZeeActivity(zeeRestModes[section] ?? 'hello');
  if (!motionPreference.matches || zeeTrigger) return;
  if (!zeeSurprises.has(portfolioFooter) && portfolioFooter.getBoundingClientRect().top < window.innerHeight - 40) {
    zeeSurprises.add(portfolioFooter);
    performZeeActivity('goodbye', 2550);
    return;
  }
  if (zeeSurprises.has(section)) return;
  if (section !== 'about' && section !== 'work') return;
  zeeActivityTimer = setTimeout(() => {
    if (zeeTrigger || zeeDock.hidden || section !== zeeSection) return;
    zeeSurprises.add(section);
    if (section === 'about') performZeeActivity('sip', 1530);
    else performZeeActivity('dance', 1480);
  }, section === 'about' ? 1650 : 1900);
}


function showZeeNote() {
  const [message, label, href] = zeeNotes[zeeSection];
  zeeMessage.textContent = message;
  zeeAction.textContent = label;
  zeeAction.hidden = !href;
  if (href) zeeAction.href = href;
}

function updateZeeDock() {
  zeeDock.hidden = false;
  const scroll = Math.max(0, window.scrollY);
  const previousScroll = zeeLastScroll;
  const moving = previousScroll !== undefined && Math.abs(scroll - previousScroll) > 0.5;
  zeeLastScroll = scroll;

  // Keep the walk inside the reserved side gutter at every scroll position.
  const sway = Math.sin(scroll / 370);
  const lift = 10 + 22 * (1 - Math.cos(scroll / 430)) / 2;
  if (motionPreference.matches && zeeTrigger !== zeeDockButton) {
    zeeDock.style.setProperty('--zee-position', `${5 * sway}px`);
    zeeDock.style.setProperty('--zee-lift', `${-lift}px`);
  }
  if (moving && !zeeTrigger && motionPreference.matches) {
    const previousSway = Math.sin(previousScroll / 370);
    zeeDock.toggleAttribute('data-facing-left', sway < previousSway);
    if (!zeeDock.classList.contains('is-walking')) {
      zeeDock.classList.add('is-walking');
      setZeeActivity('');
    }
    clearTimeout(zeeStopTimer);
    zeeStopTimer = setTimeout(() => {
      zeeDock.classList.remove('is-walking');
      settleZeeAtStop(zeeSection);
    }, 240);
  } else if (!zeeDock.classList.contains('is-walking') &&
      zeeActivitySection !== zeeSection && zeeMusic.hidden) {
    settleZeeAtStop(zeeSection);
  }
  zeeActivitySection = zeeSection;
}

function closeZeeChat(restoreFocus = false) {
  if (!zeeTrigger) return;
  const previousTrigger = zeeTrigger;
  previousTrigger.setAttribute('aria-expanded', 'false');
  stopZeeBreak();
  zeeChat.hidden = true;
  zeeTrigger = null;
  if (restoreFocus) previousTrigger.focus({ preventScroll: true });
  updateZeeDock();
}

for (const [trigger, host] of [[zeeHeroButton, zeeHero], [zeeDockButton, zeeDock]]) {
  trigger.addEventListener('click', () => {
    if (zeeTrigger === trigger) {
      closeZeeChat();
      return;
    }
    closeZeeChat();
    zeeTrigger = trigger;
    clearTimeout(zeeStopTimer);
    zeeDock.classList.remove('is-walking');
    setZeeActivity(zeeRestModes[zeeSection] ?? 'hello');
    const contextLine = window.innerHeight * .43;
    refreshZeeContext(contextLine);
    if (trigger === zeeHeroButton) zeeSection = 'home';
    zeePlayActions.hidden = trigger !== zeeDockButton;
    host.append(zeeChat);
    showZeeNote();
    zeeChat.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    updateZeeDock();
  });
}

zeeClose.addEventListener('click', () => closeZeeChat(true));
zeePlayActions.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-zee-act]');
  if (!trigger || zeeTrigger !== zeeDockButton) return;
  const action = trigger.dataset.zeeAct;
  const track = zeeTracks[action];

  stopZeeBreak();
  welcomeChime.pause();
  clearTimeout(zeeStopTimer);
  zeeDock.classList.remove('is-walking');
  zeeMusic.hidden = false;
  zeeMessage.textContent = track.title;
  zeeAction.hidden = true;
  zeeMusicStatus.textContent = 'Loading audio…';

  const audio = new Audio(track.src);
  zeeAudio = audio;
  audio.addEventListener('playing', () => {
    if (audio !== zeeAudio) return;
    zeeMusicStatus.textContent = '';
    setZeeActivity(action);
  });
  audio.addEventListener('waiting', () => {
    if (audio !== zeeAudio) return;
    setZeeActivity(zeeRestModes[zeeSection] ?? 'hello');
  });
  audio.addEventListener('ended', () => {
    if (audio !== zeeAudio) return;
    stopZeeBreak();
    showZeeNote();
  });
  const playbackFailed = () => {
    if (audio !== zeeAudio) return;
    stopZeeBreak();
    zeeMusic.hidden = false;
    zeeMusicStatus.textContent = 'The audio could not play. Select the break to try again.';
  };
  audio.addEventListener('error', playbackFailed);
  audio.play().catch(playbackFailed);
});
zeeFact.addEventListener('click', () => {
  stopZeeBreak();
  zeeMessage.textContent = zeeFacts[zeeFactIndex];
  zeeFactIndex = (zeeFactIndex + 1) % zeeFacts.length;
  zeeAction.hidden = true;
});
zeeAction.addEventListener('click', () => {
  const destination = zeeAction.hash && byId(zeeAction.hash.slice(1));
  closeZeeChat();
  if (destination) {
    destination.setAttribute('tabindex', '-1');
    destination.focus({ preventScroll: true });
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && zeeTrigger && !event.defaultPrevented) closeZeeChat(true);
});
document.addEventListener('pointerdown', (event) => {
  if (zeeTrigger && !zeeChat.contains(event.target) && !event.target.closest('.zee-trigger')) closeZeeChat();
});

function refreshZeeContext(contextLine) {
  const current = zeeSections.findLast((section) => section.getBoundingClientRect().top <= contextLine) || zeeSections[0];
  const nextSection = zeeTrigger === zeeHeroButton ? 'home' : current.id;
  if (nextSection !== zeeSection) {
    zeeSection = nextSection;
    if (zeeTrigger && zeeMusic.hidden) showZeeNote();
  }
}

let zeeScrollPending = false;
function updateZeePosition() {
  zeeScrollPending = false;
  const rect = zeeHeroButton.getBoundingClientRect();
  const zeeHeroVisible = rect.bottom > 90 && rect.top < window.innerHeight - 65;
  if (!zeeHeroVisible && zeeTrigger === zeeHeroButton) {
    const hadFocus = zeeChat.contains(document.activeElement) || document.activeElement === zeeHeroButton;
    closeZeeChat();
    if (hadFocus && !zeeDock.hidden) zeeDockButton.focus({ preventScroll: true });
  }
  refreshZeeContext(window.innerHeight * .43);
  updateZeeDock();
}
function queueZeePosition() {
  if (zeeScrollPending) return;
  zeeScrollPending = true;
  requestAnimationFrame(updateZeePosition);
}
window.addEventListener('scroll', queueZeePosition, { passive: true });
window.addEventListener('resize', queueZeePosition);
zeeHeroButton.disabled = false;
updateZeePosition();

// Keep the native cursor for touch, editing, selection, and reduced motion.
const cursorPreference = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const cursorRoot = document.documentElement;
const kawaiiCursor = el('span', '', { class: 'kawaii-cursor', 'aria-hidden': 'true', hidden: '' });
document.body.append(kawaiiCursor);
const nativeCursorTargets = 'input, textarea, select, label, [contenteditable], video, audio, iframe';
const interactiveCursorTargets = 'a[href], button:not(:disabled), summary, [role="button"], .project-clickable';
let tapAnimation;
let cursorArtworkReady = false;
let mousePosition;

function hideKawaiiCursor() {
  kawaiiCursor.hidden = true;
  cursorRoot.classList.remove('kawaii-cursor-active');
}

function updateKawaiiCursor() {
  if (!cursorArtworkReady || !cursorPreference.matches || !mousePosition ||
      document.querySelector('dialog[open]')) {
    hideKawaiiCursor();
    return;
  }
  const { x, y } = mousePosition;
  const target = document.elementFromPoint(x, y);
  if (!target || target.closest(nativeCursorTargets)) {
    hideKawaiiCursor();
    return;
  }
  const interactive = target.closest(interactiveCursorTargets);
  kawaiiCursor.style.translate = `${x}px ${y}px`;
  kawaiiCursor.classList.toggle('is-interactive', Boolean(interactive));
  kawaiiCursor.hidden = false;
  cursorRoot.classList.add('kawaii-cursor-active');
}

document.addEventListener('pointermove', (event) => {
  mousePosition = event.pointerType === 'mouse' && !event.buttons
    ? { x: event.clientX, y: event.clientY }
    : undefined;
  updateKawaiiCursor();
}, { passive: true });

document.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse' || !kawaiiCursor.classList.contains('is-interactive')) {
    hideKawaiiCursor();
    return;
  }
  if (kawaiiCursor.hidden || event.button !== 0) return;
  tapAnimation?.cancel();
  tapAnimation = kawaiiCursor.animate([{ scale: '1' }, { scale: '.89 1.05' }, { scale: '1' }], {
    duration: 180, easing: 'ease-out'
  });
});
cursorRoot.addEventListener('pointerleave', () => {
  mousePosition = undefined;
  hideKawaiiCursor();
});
window.addEventListener('blur', hideKawaiiCursor);
window.addEventListener('scroll', updateKawaiiCursor, { passive: true });
document.addEventListener('pointerup', updateKawaiiCursor);
document.addEventListener('visibilitychange', hideKawaiiCursor);
cursorPreference.addEventListener('change', hideKawaiiCursor);

// Enable the custom cursor only after both illustrations load.
function preloadCursorArtwork(path) {
  const icon = new Image();
  icon.src = path;
  return icon.decode();
}

if (cursorPreference.matches) {
  Promise.all(['/images/cursor-arrow.svg', '/images/cursor-hand.svg'].map(preloadCursorArtwork))
    .then(() => {
      cursorArtworkReady = true;
      updateKawaiiCursor();
    }, hideKawaiiCursor);
}
