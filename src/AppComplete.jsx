import { useEffect, useRef, useState } from 'react'
import './App.css'
import { PolaroidLineCarousel } from './components/ui/polaroid-line-carousel'
import { IceCubeTestimonials } from './components/ui/ice-cube-testimonials'
import { ImageTextReveal } from './components/ui/imgtext-reveal-scroll-animation'

// Animated single-line loader phrases
const LOADER_MESSAGES = [
  'Welcome to DevCore',
  'We are loading DevCore...',
  'What services we provide?',
  'Cloud POS Web Apps & Custom Systems',
  'Architecting Next-Gen Web Architecture...',
]

// Unified Hero Sequence for both Desktop & Mobile
const HERO_FRAMES = Object.entries(
  import.meta.glob('../Rocket_launches_from_icy_land_20261027031051_frames/**/*.webp', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const TUNNEL_FRAMES = Object.entries(
  import.meta.glob('../Camera_moves_through_icy_tunnel_20261027032841_frames/**/*.webp', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const CLOUDS_FRAMES = Object.entries(
  import.meta.glob('../Camera_moves_up_to_clouds_20261027224013_frames/**/*.webp', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, src]) => src)

const HERO_END = 0.32
const TUNNEL_END = 0.68
const crossBlendRange = 0.04

// Exact mapping for Camera_moves_through_icy_tunnel_20261027032841_frames (125 total frames)
function tunnelFrameToProgress(frameNum) {
  const tunnelSpan = TUNNEL_END - crossBlendRange - HERO_END // 0.32
  const totalFrames = 125
  const seqP = clamp((frameNum - 1) / (totalFrames - 1), 0, 1)
  return HERO_END + seqP * tunnelSpan
}

// Exact mapping for Camera_moves_up_to_clouds_20261027224013_frames (113 total frames)
function cloudsFrameToProgress(frameNum) {
  const cloudsSpan = 1 - TUNNEL_END // 0.32
  const totalFrames = 113
  const seqP = clamp((frameNum - 1) / (totalFrames - 1), 0, 1)
  return TUNNEL_END + seqP * cloudsSpan
}



// Story & Tagline content for every transition & stage (connected with menu navigation)
// Strictly timed to video frame numbers:
// 1. SERVICES: tunnel frame 21 to 78 (all 6 cards uniform 10 frames distance, ends at 78)
// 2. FEATURED PROJECTS: tunnel frame 103 to 125 (demo project cards, same duration, ends at 125)
// 3. CLIENT TESTIMONIALS: clouds frame 19 to 56 (ends at 56)
// 4. PHILOSOPHY: clouds frame 57 to 75 ("DevCore is the Core of Engineering")
// 5. LET'S CONNECT: clouds frame 76 to 105 (direct email, project, linkedin, github + contact form)
// 6. LAST FRAME: clouds frame 106 to 113 (giant bold barfani "DEVCORE STUDIO" text)
// DevCore Studio Services for Polaroid Line Carousel
const SERVICES_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    title: 'Full-Stack Web Development',
    caption: 'High-performance Next.js architectures with distributed microservices, ultra-responsive interfaces, and real-time backend synchronization.',
    badge: 'ARCHITECTURE',
    tags: ['Next.js 15', 'React Server Comp.', 'TypeScript', 'PostgreSQL'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Full-Stack%20Web%20Development',
  },
  {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    title: 'Voice & Chat Agent Integrations',
    caption: 'Autonomous AI phone and chat agents with ultra-low latency streaming, LLM tool calling, live CRM syncing, and multi-turn conversational intelligence.',
    badge: 'AI INTELLIGENCE',
    tags: ['WebRTC Audio', 'ElevenLabs', 'LLM Tool Calling', 'LangGraph'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Voice%20%26%20Chat%20Agent%20Integrations',
  },
  {
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    title: 'AWS Cloud Services',
    caption: 'Zero-downtime AWS cloud infrastructure, serverless Lambda microservices, auto-scaling ECS / EKS clusters, and enterprise-grade security compliance.',
    badge: 'INFRASTRUCTURE',
    tags: ['AWS ECS / EKS', 'Serverless Lambda', 'Terraform / IaC', '99.99% SLA'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AWS%20Cloud%20Services',
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=1200&q=80',
    title: 'POS Systems',
    caption: 'Enterprise-grade point-of-sale platforms featuring offline-first local billing, instant hardware printer & barcode sync, and multi-store inventory commands.',
    badge: 'COMMERCE',
    tags: ['Offline-First SQLite', 'Thermal ESC/POS', 'Barcode Sync', 'Multi-Terminal'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20POS%20Systems',
  },
  {
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    title: 'Custom Software',
    caption: 'Bespoke enterprise software architectures, automated internal tooling, high-throughput data processing pipelines, and resilient microservices.',
    badge: 'ENGINEERING',
    tags: ['Custom ERP / CRM', 'High-Throughput APIs', 'Event-Driven', 'Docker / K8s'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20Custom%20Software',
  },
  {
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    title: 'AI Development',
    caption: 'Full-cycle machine learning and generative AI engineering: fine-tuned open-weights models, RAG vector pipelines, and production multimodal agents.',
    badge: 'NEURAL SYSTEMS',
    tags: ['Fine-Tuned LLMs', 'Multimodal', 'Vector Search / RAG', 'CUDA Engine'],
    cta: 'Inquire Service',
    href: 'mailto:hello@devcore.studio?subject=Inquiry%20-%20AI%20Development',
  },
]

// DevCore Verified Client Testimonials for Fanned Card Stack
const TESTIMONIAL_ITEMS = [
  {
    quote:
      "DevCore delivered our offline-first POS architecture ahead of schedule. Zero downtime across 140 retail outlets during peak Black Friday volume.",
    name: "Marcus Vance",
    title: "VP of Product, OmniPulse Retail",
    badge: "RETAIL COMMERCE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "Their autonomous voice agents slashed our support backlog by 72% in week one. The audio latency is so fast it feels entirely indistinguishable from human operators.",
    name: "Elena Rostova",
    title: "CTO, Synapse AI Telephony",
    badge: "AI INTELLIGENCE",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "DevCore engineered our multi-region AWS cloud infrastructure with zero downtime and automated failover. The code craftsmanship and microservice architecture are world-class.",
    name: "David Sterling",
    title: "Head of Cloud Infrastructure, AetherCloud",
    badge: "CLOUD SYSTEMS",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "From high-throughput data processing to bespoke enterprise tooling, DevCore is our secret weapon for engineering velocity and bulletproof reliability.",
    name: "Sarah Lin",
    title: "VP of Engineering, QuantCore Labs",
    badge: "SOFTWARE ARCHITECTURE",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "The Next.js 15 full-stack platform they created exceeded every performance benchmark. Lighthouse score is solid 100 with instantaneous page transitions.",
    name: "Julian Thorne",
    title: "Founder & Lead Architect, Nexus Flow",
    badge: "WEB ARCHITECTURE",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  },
]

const TRANSITION_STORIES = [
  // --- 1. SERVICES (Tunnel entrance frame 1 to frame 78) ---
  {
    id: 'services-cover',
    type: 'cover',
    badge: 'SERVICES',
    title: 'SERVICES',
    tagline:
      'We provide complete engineering for POS Web apps, autonomous AI voice agents, cloud infrastructure, and bespoke enterprise software systems.',
    start: 0.320,
    end: tunnelFrameToProgress(20.5),
  },
  {
    id: 'services-polaroid-stage',
    type: 'polaroid-stage',
    badge: 'SERVICES CAROUSEL',
    start: tunnelFrameToProgress(21.0),
    aliveStart: tunnelFrameToProgress(23.0),
    aliveEnd: tunnelFrameToProgress(76.0),
    end: tunnelFrameToProgress(78.0),
  },

  // --- 2. FEATURED PROJECTS (Tunnel frames 79 to 125, cards start at 103, end at 125) ---
  {
    id: 'projects-cover',
    type: 'cover',
    badge: 'PORTFOLIO',
    title: 'FEATURED PROJECTS',
    tagline:
      'Mission-critical platforms, enterprise cloud architectures, and autonomous AI systems engineered for global scale and bulletproof stability.',
    start: tunnelFrameToProgress(79.0),
    end: tunnelFrameToProgress(101.5),
  },
  {
    id: 'project-omnipulse',
    type: 'card',
    category: 'project',
    index: '01',
    totalCount: '02',
    badge: 'RETAIL COMMERCE',
    title: 'OmniPulse POS Platform',
    tagline:
      'Enterprise offline-first point-of-sale platform syncing 240+ storefronts with real-time inventory ledger and thermal hardware integration.',
    tags: ['Offline-First SQLite', 'Thermal ESC/POS', 'React & Tauri', 'Distributed Sync', 'Zero-Downtime'],
    icon: 'pos',
    start: tunnelFrameToProgress(102.0),
    aliveStart: tunnelFrameToProgress(103.0),
    aliveEnd: tunnelFrameToProgress(112.0),
    end: tunnelFrameToProgress(113.5),
    cta: 'View Project Brief',
    href: 'mailto:projects@devcore.studio?subject=Project%20Inquiry%20-%20OmniPulse%20POS',
  },
  {
    id: 'project-aethervoice',
    type: 'card',
    category: 'project',
    index: '02',
    totalCount: '02',
    badge: 'AUTONOMOUS AI',
    title: 'AetherVoice Telephony Engine',
    tagline:
      'Sub-200ms WebRTC voice agent network processing 60,000+ customer telephony sessions with live CRM tool-calling and multi-turn intelligence.',
    tags: ['WebRTC Audio Stream', 'Whisper & ElevenLabs', 'LLM Tool Calling', 'LangGraph Mesh', 'Telephony SIP'],
    icon: 'voice',
    start: tunnelFrameToProgress(114.0),
    aliveStart: tunnelFrameToProgress(115.0),
    aliveEnd: tunnelFrameToProgress(123.5),
    end: tunnelFrameToProgress(125.0),
    cta: 'View Project Brief',
    href: 'mailto:projects@devcore.studio?subject=Project%20Inquiry%20-%20AetherVoice',
  },

  // --- 3. CLIENT TESTIMONIALS (Clouds frames 19 to 56) ---
  {
    id: 'testimonials-cover',
    type: 'cover',
    badge: 'VERIFIED CLIENTS',
    title: 'CLIENT TESTIMONIALS',
    tagline:
      'What enterprise leaders and technical founders say about engineering velocity, reliability, and code craftsmanship with DevCore.',
    start: cloudsFrameToProgress(19.0),
    end: cloudsFrameToProgress(24.0),
  },

  // --- 4. "DevCore is the Core of Engineering" (Clouds frames 57 to 75) ---

  // --- 5. LET'S CONNECT + DIRECT LINKS + CONTACT FORM (Clouds frames 76 to 105) ---
  {
    id: 'lets-connect',
    type: 'connect',
    badge: 'INITIATE COLLABORATION',
    title: 'LET’S CONNECT',
    tagline:
      'Whether you need an enterprise POS web app, autonomous voice AI agents, or custom software architecture — connect directly with our engineering team.',
    start: cloudsFrameToProgress(76.0),
    aliveStart: cloudsFrameToProgress(78.0),
    aliveEnd: cloudsFrameToProgress(103.0),
    end: cloudsFrameToProgress(105.0),
  },

  // --- 6. LAST FRAME: MONUMENTAL BARFANI TEXT (Clouds frames 106 to 113) ---
  {
    id: 'monument-devcore',
    type: 'monument',
    title: 'DEVCORE STUDIO',
    subtitle: 'THE CORE OF ENGINEERING',
    start: cloudsFrameToProgress(106.0),
    end: 1.000,
  },
]

// Camera Frame Progression:
// Background 3D camera moves smoothly in real-time with scroll through the icy tunnel while polaroid cards swing along the string.
function getFrozenFrameProgress(progress) {
  // Direct progression with user scroll (camera moves forward together with cards)
  return progress
}

const SECTION_TARGETS = [0.22, 0.36, tunnelFrameToProgress(103), cloudsFrameToProgress(20), cloudsFrameToProgress(78)]

// Checkpoints for 3rd Scroll Fast-Jump to Next/Prev Card
const SNAP_CHECKPOINTS = [
  { id: 'hero', progress: 0.0 },
  { id: 'services-cover', progress: 0.325 },
  { id: 'full-stack-web', progress: 0.38387 },
  { id: 'voice-chat-agent', progress: 0.40839 },
  { id: 'aws-cloud-services', progress: 0.4329 },
  { id: 'pos-systems', progress: 0.45742 },
  { id: 'custom-software', progress: 0.48194 },
  { id: 'ai-development', progress: 0.50645 },
  { id: 'projects-cover', progress: tunnelFrameToProgress(86.0) },
  { id: 'project-omnipulse', progress: tunnelFrameToProgress(107.5) },
  { id: 'project-aethervoice', progress: tunnelFrameToProgress(119.5) },
  { id: 'testimonials-cover', progress: cloudsFrameToProgress(21.0) },
  { id: 'testimonials-showcase', progress: cloudsFrameToProgress(38.0) },
  { id: 'core-of-engineering', progress: cloudsFrameToProgress(66.0) },
  { id: 'lets-connect', progress: cloudsFrameToProgress(88.0) },
  { id: 'monument-devcore', progress: 1.0 },
]

// DevCore Studio AI Knowledge Base for Interactive Floating AI Chat
const DEVCORE_KNOWLEDGE = [
  {
    category: 'greetings',
    keywords: ['hi', 'hello', 'hey', 'salam', 'assalam', 'aoa', 'hola', 'sup', 'morning', 'evening', 'good', 'kese ho', 'kaise ho'],
    response: `Hello! 👋 Welcome to DevCore Studio. I'm your AI assistant. How can I help you today? You can ask me about our Engineering Services, Autonomous AI Integrations, POS Platforms, or custom enterprise solutions!`,
  },
  {
    category: 'services_overview',
    keywords: ['service', 'services', 'what do you do', 'offer', 'provide', 'capabilities', 'expertise', 'build', 'stack'],
    response: `At DevCore Studio, we engineer mission-critical systems across 6 core domains:
• 🌐 Full-Stack Web Development (Next.js 15, React, Node.js, Go)
• 🎙️ Autonomous Voice & Chat Agents (Sub-200ms WebRTC, LLM Tool Calling)
• ☁️ AWS Cloud Services (Zero-downtime microservices, ECS/EKS clusters)
• 💳 Cloud & Offline POS Systems (Hardware-integrated retail platforms)
• ⚙️ Bespoke Custom Software (Automated internal tooling, high-throughput APIs)
• 🧠 Enterprise AI Development (Custom RAG pipelines, neural models)

Which area would you like to explore in detail?`,
  },
  {
    category: 'voice_ai',
    keywords: ['voice', 'call', 'agent', 'chat agent', 'phone', 'telephony', 'webrtc', 'whisper', 'elevenlabs', 'speech', 'audio', 'customer support'],
    response: `🎙️ Voice & Chat Agent Integrations:
We build autonomous AI phone and chat agents with ultra-low latency (<200ms streaming) using WebRTC, Whisper & ElevenLabs, LangGraph, and real-time SIP telephony.
• Multi-turn conversational context
• Live CRM & database tool calling
• Human-indistinguishable streaming voice

Check out our AetherVoice Telephony Engine case study in the Projects section!`,
  },
  {
    category: 'pos_systems',
    keywords: ['pos', 'point of sale', 'retail', 'billing', 'cashier', 'inventory', 'thermal', 'printer', 'barcode', 'store', 'omnipulse'],
    response: `💳 POS Systems & Retail Platforms:
We specialize in offline-first, high-reliability point-of-sale platforms:
• Offline-first SQLite local billing (keeps running even if internet drops)
• Thermal printer ESC/POS & hardware barcode/scale synchronization
• Multi-terminal cloud ledger synchronization (synced across 240+ retail outlets)

Featured project: OmniPulse POS Platform built for high-concurrency retail commerce!`,
  },
  {
    category: 'cloud_aws',
    keywords: ['aws', 'cloud', 'infrastructure', 'devops', 'kubernetes', 'docker', 'ecs', 'eks', 'lambda', 'serverless', 'terraform', 'uptime'],
    response: `☁️ AWS Cloud Architecture:
We engineer zero-downtime cloud infrastructure backed by 99.99% SLAs:
• Serverless microservices with AWS Lambda & API Gateway
• Container orchestration via AWS ECS & EKS
• Infrastructure as Code (Terraform) and Multi-AZ database clustering
• Global CDN with CloudFront & automated failovers.`,
  },
  {
    category: 'web_dev',
    keywords: ['web', 'website', 'frontend', 'backend', 'nextjs', 'next.js', 'react', 'typescript', 'fullstack', 'full-stack', 'tailwind'],
    response: `🌐 Full-Stack Web Development:
We build ultra-fast, modern web architectures with:
• Next.js 15 & React Server Components
• Distributed Node.js & Go microservices
• Type-safe TypeScript & PostgreSQL / Prisma ORM
• Sub-second Time-To-Interactive with fluid 60fps animations.`,
  },
  {
    category: 'projects',
    keywords: ['project', 'projects', 'portfolio', 'work', 'case study', 'omnipulse', 'aethervoice', 'clients'],
    response: `💼 Featured DevCore Projects:
1. OmniPulse POS Platform: Enterprise offline-first retail system syncing 240+ storefronts with sub-50ms ledger synchronization.
2. AetherVoice Telephony Engine: Sub-200ms WebRTC voice agent network processing 60,000+ customer telephony sessions with live CRM tool-calling.

Both architectures are currently running in production with 99.99% uptime!`,
  },
  {
    category: 'pricing_hiring',
    keywords: ['price', 'pricing', 'cost', 'quote', 'hire', 'rate', 'budget', 'timeline', 'start', 'contract'],
    response: `💰 Project Engagement & Pricing:
We work on both dedicated engineering sprints and fixed-scope architectural deliverables. Every project begins with a technical discovery call where we outline the architecture, milestones, and deliverables.

To get an accurate estimate or proposal within 24 hours, contact us at:
📧 projects@devcore.studio`,
  },
  {
    category: 'contact',
    keywords: ['contact', 'email', 'touch', 'call', 'reach', 'talk', 'linkedin', 'github', 'location', 'office'],
    response: `📫 Connect with DevCore Studio:
• Direct Inquiries: hello@devcore.studio
• New Project Proposals: projects@devcore.studio
• LinkedIn: linkedin.com/company/devcore
• GitHub: github.com/devcore

You can also scroll down to our interactive Let's Connect form at the bottom of the page!`,
  },
  {
    category: 'team_identity',
    keywords: ['who are you', 'what is devcore', 'team', 'company', 'devcore studio', 'core of engineering'],
    response: `❄️ DevCore Studio is an elite digital engineering collective. We believe "DevCore is the Core of Engineering" — transforming complex technical challenges into durable competitive market advantages for visionary founders and global enterprises.`,
  },
]

function getDevCoreAIResponse(userText) {
  const query = (userText || '').toLowerCase().trim()
  if (!query) return "Please enter a question so I can assist you!"

  const words = query.split(/[\s,?.!]+/).filter(Boolean)
  let bestMatch = null
  let highestScore = 0

  for (const item of DEVCORE_KNOWLEDGE) {
    let score = 0
    for (const kw of item.keywords) {
      if (query.includes(kw)) {
        score += kw.length > 4 ? 3 : 2
      } else {
        for (const word of words) {
          if (word.length >= 3 && (kw.includes(word) || word.includes(kw))) {
            score += 1
          }
        }
      }
    }
    if (score > highestScore) {
      highestScore = score
      bestMatch = item
    }
  }

  if (highestScore > 0 && bestMatch) {
    return bestMatch.response
  }

  return `Thank you for asking! I'm trained on DevCore Studio's engineering portfolio. I can assist you with:
• Our Services: Full-Stack Web, Autonomous Voice AI, AWS Cloud, POS Systems, Custom Software.
• Featured Projects: OmniPulse POS and AetherVoice.
• Collaboration: Direct project inquiries and email contacts.

Could you specify what kind of project or service you're exploring? You can also email us directly at projects@devcore.studio!`
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getLoadedFrame(imageArray, targetIndex) {
  if (!imageArray || imageArray.length === 0) return null
  const clamped = clamp(Math.round(targetIndex), 0, imageArray.length - 1)

  const direct = imageArray[clamped]
  if (direct && direct.complete && direct.naturalWidth > 0) {
    return direct
  }

  // Fast bounded fallback (max 15 frames search instead of searching 125 frames every frame)
  const maxSearch = 15
  for (let offset = 1; offset <= maxSearch; offset++) {
    const b = clamped - offset
    if (b >= 0 && imageArray[b]?.complete && imageArray[b]?.naturalWidth > 0) {
      return imageArray[b]
    }
    const f = clamped + offset
    if (f < imageArray.length && imageArray[f]?.complete && imageArray[f]?.naturalWidth > 0) {
      return imageArray[f]
    }
  }

  return imageArray[0] || null
}

function drawCover(ctx, img, canvasWidth, canvasHeight, opacity = 1) {
  if (!img || !img.complete || img.naturalWidth === 0) return false

  const imgW = img.naturalWidth
  const imgH = img.naturalHeight
  const scale = Math.max(canvasWidth / imgW, canvasHeight / imgH)
  const drawW = imgW * scale
  const drawH = imgH * scale
  const offsetX = (canvasWidth - drawW) * 0.5
  const offsetY = (canvasHeight - drawH) * 0.5

  if (opacity < 0.999) {
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity))
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
    ctx.restore()
  } else {
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH)
  }
  return true
}

// High-Performance Optical frame blending:
// When scrolling, renders single nearest frame to eliminate GPU bandwidth bottleneck;
// gently crossfades adjacent frames only when nearly stationary.
function renderBlendedSequence(ctx, images, seqProgress, canvasWidth, canvasHeight, isMoving = false) {
  if (!images || images.length === 0) return false
  const total = images.length
  const floatIndex = clamp(seqProgress * (total - 1), 0, total - 1)
  const baseIndex = Math.floor(floatIndex)
  const nextIndex = Math.min(baseIndex + 1, total - 1)
  const fraction = floatIndex - baseIndex

  // Fast path during active movement: draw exact nearest frame with 1 draw call
  if (isMoving) {
    const nearestIndex = fraction > 0.5 ? nextIndex : baseIndex
    const imgNearest = getLoadedFrame(images, nearestIndex)
    return imgNearest ? drawCover(ctx, imgNearest, canvasWidth, canvasHeight, 1) : false
  }

  const imgA = getLoadedFrame(images, baseIndex)
  const imgB = getLoadedFrame(images, nextIndex)

  let drawn = false
  if (imgA && drawCover(ctx, imgA, canvasWidth, canvasHeight, 1)) {
    drawn = true
  }

  if (imgB && imgB !== imgA && fraction > 0.08) {
    drawCover(ctx, imgB, canvasWidth, canvasHeight, fraction)
  }

  return drawn
}

// Ultra-subtle, organic atmospheric mist / cloud puff generator
function createAtmosphericMists(count, width, height) {
  const mists = []
  for (let i = 0; i < count; i++) {
    mists.push({
      x: Math.random() * width * 1.4 - width * 0.2,
      y: Math.random() * height * 0.95,
      radiusX: (Math.random() * 0.35 + 0.35) * Math.max(width, height), // Wide soft volumetric ellipse
      radiusY: (Math.random() * 0.18 + 0.14) * Math.min(width, height),
      speedX: (Math.random() * 0.2 + 0.12), // Very slow majestic horizontal drift
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.003 + 0.0015,
      maxOpacity: Math.random() * 0.055 + 0.045, // Incredibly faint (4.5% to 10% opacity) - feels alive without blocking view
    })
  }
  return mists
}

// Lightweight procedural snowfall generator (halki halki baraf bari)
function createSnowflakes(count, width, height) {
  const flakes = []
  for (let i = 0; i < count; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.1 + 0.8, // 0.8px to 2.9px fine ice crystals
      speedY: Math.random() * 0.85 + 0.45, // Gentle fluttering fall
      speedX: (Math.random() - 0.5) * 0.35, // Subtle wind drift
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.012,
      swayAmp: Math.random() * 1.4 + 0.4,
      opacity: Math.random() * 0.45 + 0.35, // Translucent crystalline glow
    })
  }
  return flakes
}

function AppComplete() {
  const [isLoading, setIsLoading] = useState(true)
  const [isZooming, setIsZooming] = useState(false)
  const [loadPercent, setLoadPercent] = useState(0)
  const [loaderMsgIndex, setLoaderMsgIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [coreSectionProgress, setCoreSectionProgress] = useState(0)

  // Realistic character typing effect for loader lines
  useEffect(() => {
    if (!isLoading) return
    const currentFullText = LOADER_MESSAGES[loaderMsgIndex] || ''
    let charIndex = 0
    setDisplayedText('')

    const typeInterval = setInterval(() => {
      charIndex++
      setDisplayedText(currentFullText.slice(0, charIndex))
      if (charIndex >= currentFullText.length) {
        clearInterval(typeInterval)
      }
    }, 42)

    return () => clearInterval(typeInterval)
  }, [loaderMsgIndex, isLoading])

  // Cycle to next loader phrase every 2.4s
  useEffect(() => {
    if (!isLoading) return
    const timer = setInterval(() => {
      setLoaderMsgIndex((prev) => (prev + 1) % LOADER_MESSAGES.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [isLoading])
  const [activeSection, setActiveSection] = useState('home')
  const activeSectionRef = useRef('home')
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuDropdownRef = useRef(null)

  // Floating Back-to-Top Button State
  const [showBackToTop, setShowBackToTop] = useState(false)
  const showBackToTopRef = useRef(false)

  // Interactive Floating AI Chat Widget State
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! 👋 I'm the DevCore Studio AI Assistant. Ask me anything about our services (Full-Stack Web, Voice Agents, AWS Cloud, POS Systems, Custom Software), our projects, or how to collaborate with our engineering team!",
      time: 'Just now',
    },
  ])
  const [aiInput, setAiInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const aiMessagesEndRef = useRef(null)

  // Rocket launch & 3.2.1 countdown states
  const [countdown, setCountdown] = useState(null)
  const countdownTimerRef = useRef(null)
  const shakeIntensityRef = useRef(0)

  const headerRef = useRef(null)
  const footerRef = useRef(null)
  const canvasRef = useRef(null)
  const snowCanvasRef = useRef(null)
  const snowflakesRef = useRef([])
  const cloudsRef = useRef([])
  const whiteRef = useRef(null)
  const heroCopyRef = useRef(null)
  const launchBtnRef = useRef(null)
  const currentProgressRef = useRef(0)
  const scrollCueRef = useRef(null)
  const servicesRef = useRef(null)
  const servicesHeadingRef = useRef(null)
  const servicesTaglineRef = useRef(null)
  const polaroidWrapRef = useRef(null)
  const testimonialsCardsWrapRef = useRef(null)
  const corePhilosophyWrapRef = useRef(null)
  const storyRefs = useRef([])
  const storyTitleRefs = useRef([])
  const storyTaglineRefs = useRef([])
  const activeTypedSectionRef = useRef({})
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  const heroImagesRef = useRef([])
  const tunnelImagesRef = useRef([])
  const cloudsImagesRef = useRef([])
  const forceRedrawRef = useRef(true)
  const hasDrawnValidFrameRef = useRef(false)
  const isZoomingRef = useRef(false)  // For staged loading guard
  const isMobileRef = useRef(false) // Cached to avoid layout query inside RAF
  const snowTickCounterRef = useRef(0)  // For 30fps snow throttle
  const isPageVisibleRef = useRef(true) // Page Visibility API
  const isProgrammaticScrollRef = useRef(false)
  const isCardAliveRef = useRef(false)
  const stationLockRef = useRef({
    activeStationId: null,
    breakoutAccumDown: 0,
    breakoutAccumUp: 0,
    lastActivityTime: 0,
  })

  // Close menus on click / touch outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false)
      }
    }
    const handleMouseMove = (e) => {
      const halfW = window.innerWidth / 2
      const halfH = window.innerHeight / 2
      mouseRef.current.targetX = (e.clientX - halfW) / halfW
      mouseRef.current.targetY = (e.clientY - halfH) / halfH
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Auto-scroll AI Chat to bottom when new messages arrive
  useEffect(() => {
    if (aiChatOpen) {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aiMessages, isAiTyping, aiChatOpen])

  // Handle sending query to DevCore AI Assistant
  const handleSendAiMessage = (queryText) => {
    const text = (queryText || '').trim()
    if (!text) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = { sender: 'user', text, time: timeStr }
    setAiMessages((prev) => [...prev, userMsg])
    setAiInput('')
    setIsAiTyping(true)

    setTimeout(() => {
      const response = getDevCoreAIResponse(text)
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setAiMessages((prev) => [...prev, { sender: 'bot', text: response, time: botTime }])
      setIsAiTyping(false)
    }, 450)
  }

  // Smooth scroll directly to frame section
  const scrollToProgress = (progress, duration = 1600) => {
    isProgrammaticScrollRef.current = true
    stationLockRef.current.activeStationId = null
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    )
    const startScroll = window.scrollY
    const targetScroll = progress * maxScroll
    const distance = targetScroll - startScroll
    const startTime = performance.now()

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const step = (now) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      window.scrollTo(0, startScroll + distance * easeInOutCubic(t))
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        setTimeout(() => {
          isProgrammaticScrollRef.current = false
          const matchedStation = SNAP_CHECKPOINTS.find((pt) => Math.abs(pt.progress - progress) < 0.006)
          if (matchedStation) {
            stationLockRef.current.activeStationId = matchedStation.id
          }
        }, 120)
      }
    }
    requestAnimationFrame(step)
  }

  // Trigger 3 -> 2 -> 1 countdown inside button on click, then launch immediately to next section
  const startCountdownAndLaunch = () => {
    if (countdown !== null) return
    setCountdown(3)
    shakeIntensityRef.current = 0

    countdownTimerRef.current = setTimeout(() => {
      setCountdown(2)
      shakeIntensityRef.current = 0

      countdownTimerRef.current = setTimeout(() => {
        setCountdown(1)
        shakeIntensityRef.current = 0

        countdownTimerRef.current = setTimeout(() => {
          setCountdown('IGNITION')
          shakeIntensityRef.current = 0
          // Rocket blasts off! Swoops cleanly down from launch pad directly to Services Section (Frame 24 - Full-Stack Web Development)
          scrollToProgress(tunnelFrameToProgress(24.5), 1800)

          countdownTimerRef.current = setTimeout(() => {
            setCountdown(null)
          }, 1200)
        }, 400)
      }, 400)
    }, 400)
  }

  // Clean up animation & countdown timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current)
    }
  }, [])

  // Preload frames with fast initial readiness (unified hero sequence)
  useEffect(() => {
    let isCancelled = false
    // Preload & Decode frames with complete verification before revealing homepage
    const totalRequiredFrames = HERO_FRAMES.length + TUNNEL_FRAMES.length + CLOUDS_FRAMES.length
    let loadedCount = 0

    const updateProgress = () => {
      if (isCancelled) return
      loadedCount++
      const percent = Math.min(Math.round((loadedCount / totalRequiredFrames) * 100), 100)
      setLoadPercent(percent)

      // Safe Staged Loading: Ensure hero and tunnel entrance are fully ready
      // so GPU doesn't choke decompressing 125 images when first card enters!
      const totalRequired = HERO_FRAMES.length + Math.min(40, TUNNEL_FRAMES.length)
      const readyForEntry = loadedCount >= totalRequired || loadedCount >= totalRequiredFrames

      if (readyForEntry && !isZoomingRef.current) {
        isZoomingRef.current = true
        setIsZooming(true)
        setTimeout(() => {
          if (!isCancelled) {
            setIsLoading(false)
            setIsZooming(false)
            forceRedrawRef.current = true
          }
        }, 850)
      }
    }

    const loadAndVerifySequence = (urls) => {
      return urls.map((url) => {
        const img = new Image()
        img.src = url

        const handleComplete = () => {
          forceRedrawRef.current = true
          // img.decode() forces GPU to decompress image immediately, eliminating first-scroll stutter/lag
          if (typeof img.decode === 'function') {
            img.decode().then(updateProgress).catch(updateProgress)
          } else {
            updateProgress()
          }
        }

        if (img.complete && img.naturalWidth > 0) {
          handleComplete()
        } else {
          img.onload = handleComplete
          img.onerror = updateProgress
        }
        return img
      })
    }

    heroImagesRef.current = loadAndVerifySequence(HERO_FRAMES)
    tunnelImagesRef.current = loadAndVerifySequence(TUNNEL_FRAMES)
    cloudsImagesRef.current = loadAndVerifySequence(CLOUDS_FRAMES)

    // High ceiling fallback safety timeout (e.g. if a single asset network hangs)
    const fallbackTimeout = setTimeout(() => {
      if (!isCancelled) {
        setIsZooming(true)
        setTimeout(() => {
          setIsLoading(false)
          setIsZooming(false)
          forceRedrawRef.current = true
        }, 950)
      }
    }, 7000)

    return () => {
      isCancelled = true
      clearTimeout(fallbackTimeout)
    }
  }, [])

  // Render & Responsive Lerp Loop
  useEffect(() => {
    let targetProgress = 0
    let currentProgress = 0
    let animationFrameId = null
    let lastRenderedProgress = -1
    let forceCanvasRedraw = true

    const handleScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      targetProgress = clamp(window.scrollY / maxScroll, 0, 1)
    }

    const handleResize = () => {
      isMobileRef.current = window.innerWidth <= 768 || window.innerHeight > window.innerWidth
      handleScroll()
      forceCanvasRedraw = true
      resizeCanvas()
    }

    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      // Clamp DPR to 1.25 to prevent 4K fill-rate penalty while keeping razor-sharp visuals
      const isMobileDevice = width <= 768 || height > width
      const maxDpr = isMobileDevice ? 1.05 : 1.2
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const targetW = Math.round(width * dpr)
      const targetH = Math.round(height * dpr)

      const canvas = canvasRef.current
      if (canvas) {
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
          forceCanvasRedraw = true
        }
      }

      const snowCanvas = snowCanvasRef.current
      if (snowCanvas) {
        if (snowCanvas.width !== targetW || snowCanvas.height !== targetH) {
          snowCanvas.width = targetW
          snowCanvas.height = targetH
          const isMobileNow = width <= 768 || height > width
          const count = isMobileNow ? 14 : 24
          snowflakesRef.current = createSnowflakes(count, targetW, targetH)
          cloudsRef.current = createAtmosphericMists(isMobileNow ? 3 : 5, targetW, targetH)
        }
      }
    }

    resizeCanvas()
    handleScroll()
    currentProgress = targetProgress

    let lastActiveServiceIdx = -1
    let lastActiveTestimonialIdx = -1
    const tick = () => {
      const isMobile = isMobileRef.current
      const delta = targetProgress - currentProgress
      const absDelta = Math.abs(delta)

      // Standard Natural Website Scroll Lerp (Smooth, measured, standard speed):
      const lerpFactor = isMobile ? 0.095 : 0.085 // Natural calibrated average website travel
      currentProgress += delta * lerpFactor

      if (absDelta < 0.0001) {
        currentProgress = targetProgress
      }

      currentProgressRef.current = currentProgress

      // Toggle floating back-to-top button
      const shouldShowTop = currentProgress > 0.05
      if (shouldShowTop !== showBackToTopRef.current) {
        showBackToTopRef.current = shouldShowTop
        setShowBackToTop(shouldShowTop)
      }

      // Smooth mouse lerp for 3D tilts & micro camera sway
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05

      // Handheld camera sway + shake: ONLY active in hero section (progress < HERO_END)
      // After hero section these are zeroed to save CPU cycles on every RAF tick
      const now = Date.now()
      const isInHero = currentProgress < HERO_END
      let handheldX = 0, handheldY = 0, handheldRot = 0
      let shakeX = 0, shakeY = 0

      if (isInHero) {
        const walkFactor = Math.min(absDelta * 280, 1.8)
        handheldX = (Math.sin(now * 0.0011) * 3.2 + Math.sin(now * 0.0028) * 2.1 + Math.sin(now * 0.0065) * 1.2) * (1 + walkFactor * 0.6)
        handheldY = (Math.cos(now * 0.0009) * 2.8 + Math.cos(now * 0.0023) * 1.8 + Math.sin(now * 0.0055) * 0.9) * (1 + walkFactor * 0.6)
        handheldRot = (Math.sin(now * 0.0008) * 0.28 + Math.sin(now * 0.0021) * 0.16) * (1 + walkFactor * 0.5)

        // Rocket launch screen shake (hero only, decays fast)
        if (shakeIntensityRef.current > 0.002) {
          shakeX = (Math.random() - 0.5) * 6.5 * shakeIntensityRef.current
          shakeY = (Math.random() - 0.5) * 6.5 * shakeIntensityRef.current
          shakeIntensityRef.current *= 0.93
        } else {
          shakeIntensityRef.current = 0
        }
      } else {
        // Past hero: kill any residual shake immediately
        shakeIntensityRef.current = 0
      }


      // Living Atmospheric Reaction on Frames (Camera Breathing, Handheld Sway & Launch Shake)
      const canvas = canvasRef.current
      if (canvas) {
        const camTiltX = mouseRef.current.x * 0.8 + handheldX + shakeX
        const camTiltY = mouseRef.current.y * 0.6 + handheldY + shakeY
        const breathe = Math.sin(now * 0.0014) * 0.45
        // scale 1.04 provides comfortable margin so edges never show black border during shake
        canvas.style.transform = `scale(1.042) translate3d(${camTiltX.toFixed(2)}px, ${(camTiltY + breathe).toFixed(2)}px, 0) rotate(${handheldRot.toFixed(3)}deg)`

        // Card Freeze Lock: Compute target frame progress first
        const frameProgress = getFrozenFrameProgress(currentProgress)
        // Dirty-checking: only execute bitmap draw when frame progress actually changes
        const progressDiff = Math.abs(frameProgress - lastRenderedProgress)
        const shouldRedraw =
          isPageVisibleRef.current && (
            progressDiff > 0.0001 ||
            forceCanvasRedraw ||
            forceRedrawRef.current ||
            !hasDrawnValidFrameRef.current
          )

        if (shouldRedraw) {

          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            // Unified Hero Sequence for both Desktop & Mobile
            const activeHero = heroImagesRef.current

            // Seamless direct playback across 3 continuous sequence stages
            // No freeze/dead-zone pauses: sequence 1 -> sequence 2 -> sequence 3 flow smoothly
            const crossBlendRange = 0.04 // Soft cinematic cross-dissolve overlap

            const isMovingFast = absDelta > 0.002
            let didDraw = false
            if (frameProgress < HERO_END - crossBlendRange) {
              // Sequence 1: Rocket Launch
              const seqP = clamp(frameProgress / (HERO_END - crossBlendRange), 0, 1)
              didDraw = renderBlendedSequence(ctx, activeHero, seqP, canvas.width, canvas.height, isMovingFast)
            } else if (frameProgress <= HERO_END) {
              // Seamless Overlap: Rocket Launch ending gently cross-fades into Tunnel starting
              const blendRatio = (frameProgress - (HERO_END - crossBlendRange)) / crossBlendRange
              didDraw = renderBlendedSequence(ctx, activeHero, 1, canvas.width, canvas.height, isMovingFast)
              const firstTunnel = getLoadedFrame(tunnelImagesRef.current, 0)
              if (firstTunnel) {
                drawCover(ctx, firstTunnel, canvas.width, canvas.height, blendRatio)
                didDraw = true
              }
            } else if (frameProgress < TUNNEL_END - crossBlendRange) {
              // Sequence 2: Ice Tunnel continuous forward motion (frozen while card animates)
              const seqP = clamp(
                (frameProgress - HERO_END) / (TUNNEL_END - crossBlendRange - HERO_END),
                0,
                1,
              )
              didDraw = renderBlendedSequence(ctx, tunnelImagesRef.current, seqP, canvas.width, canvas.height, isMovingFast)
            } else if (frameProgress <= TUNNEL_END) {
              // Seamless Overlap: Tunnel ending seamlessly cross-fades into Clouds starting
              const blendRatio = (frameProgress - (TUNNEL_END - crossBlendRange)) / crossBlendRange
              didDraw = renderBlendedSequence(ctx, tunnelImagesRef.current, 1, canvas.width, canvas.height, isMovingFast)
              const firstClouds = getLoadedFrame(cloudsImagesRef.current, 0)
              if (firstClouds) {
                drawCover(ctx, firstClouds, canvas.width, canvas.height, blendRatio)
                didDraw = true
              }
            } else {
              // Sequence 3: Clouds continuous upward flight to climax (frozen while card animates)
              const seqP = clamp((frameProgress - TUNNEL_END) / (1 - TUNNEL_END), 0, 1)
              didDraw = renderBlendedSequence(ctx, cloudsImagesRef.current, seqP, canvas.width, canvas.height, isMovingFast)
            }

            if (didDraw) {
              hasDrawnValidFrameRef.current = true
              lastRenderedProgress = frameProgress
              forceCanvasRedraw = false
              forceRedrawRef.current = false
            }
          }
        }
      }

      // Snow: hero section only (progress < HERO_END), 30fps throttle, skip if tab hidden
      const snowCanvas = snowCanvasRef.current
      if (snowCanvas) {
        const snowCtx = snowCanvas.getContext('2d')
        const inHeroSnow = currentProgress < HERO_END
        snowTickCounterRef.current++
        const snowFrame = snowTickCounterRef.current % 2 === 0 // 30fps throttle

        if (!inHeroSnow) {
          // Past hero section: clear once and skip all particle work
          if (snowCtx && snowCanvas.width > 0) {
            snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)
          }
        } else if (snowCtx && snowFrame && isPageVisibleRef.current) {
          snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height)

          if (snowflakesRef.current.length === 0) {
            const count = isMobile ? 14 : 20
            snowflakesRef.current = createSnowflakes(count, snowCanvas.width, snowCanvas.height)
          }

          const flakes = snowflakesRef.current
          const scrollBoost = Math.min(Math.abs(delta) * 12, 1.8)

          for (let i = 0; i < flakes.length; i++) {
            const flake = flakes[i]
            flake.sway += flake.swaySpeed
            flake.x += flake.speedX + Math.sin(flake.sway) * (flake.swayAmp * 0.35)
            flake.y += flake.speedY + scrollBoost

            if (flake.y > snowCanvas.height) {
              flake.y = -6
              flake.x = Math.random() * snowCanvas.width
            }
            if (flake.x < -10) flake.x = snowCanvas.width + 6
            if (flake.x > snowCanvas.width + 10) flake.x = -6

            snowCtx.beginPath()
            snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
            snowCtx.fillStyle = `rgba(240, 250, 255, ${flake.opacity.toFixed(3)})`
            snowCtx.fill()
          }
        }
      }

      // Update Barfani Sliding White Transition
      // Glides up dynamically during stage shifts (Rocket -> Tunnel, Tunnel -> Clouds)
      if (whiteRef.current) {
        let whiteOpacity = 0
        let whiteY = 110 // start off-screen below (+110%)

        const sweepRange = 0.055

        // Transition 1 sweep (around HERO_END 0.32)
        if (Math.abs(currentProgress - HERO_END) <= sweepRange) {
          const progressInSweep = (currentProgress - (HERO_END - sweepRange)) / (sweepRange * 2)
          // Progress from 0 to 1 -> sweep from translateY(110%) to translateY(-110%)
          whiteY = 110 - progressInSweep * 220
          whiteOpacity = Math.sin(progressInSweep * Math.PI) * 0.92
        }
        // Transition 2 sweep (around TUNNEL_END 0.68)
        else if (Math.abs(currentProgress - TUNNEL_END) <= sweepRange) {
          const progressInSweep = (currentProgress - (TUNNEL_END - sweepRange)) / (sweepRange * 2)
          whiteY = 110 - progressInSweep * 220
          whiteOpacity = Math.sin(progressInSweep * Math.PI) * 0.92
        }

        if (whiteOpacity > 0.005) {
          whiteRef.current.style.display = 'block'
          whiteRef.current.style.opacity = whiteOpacity.toFixed(3)
          whiteRef.current.style.transform = `translateY(${whiteY.toFixed(1)}%)`
        } else {
          whiteRef.current.style.display = 'none'
          whiteRef.current.style.opacity = '0'
        }
      }

      // Update Header: Remains permanently visible and interactive for full frame navigation
      if (headerRef.current) {
        headerRef.current.style.opacity = '1'
        headerRef.current.style.transform = 'translateY(0)'
      }

      // Track active section for topnav menu pills:
      // Services ends strictly at frame 78, followed by Projects, Testimonials, and Contact
      let currentSec
      if (currentProgress < 0.30) {
        currentSec = 'home'
      } else if (currentProgress < tunnelFrameToProgress(78.0)) {
        currentSec = 'services'
      } else if (currentProgress < TUNNEL_END) {
        currentSec = 'projects'
      } else if (currentProgress < cloudsFrameToProgress(57.0)) {
        currentSec = 'testimonials'
      } else {
        currentSec = 'contact'
      }

      if (currentSec !== activeSectionRef.current) {
        activeSectionRef.current = currentSec
        setActiveSection(currentSec)
      }

      // Update Hero Text Copy (remains fully readable, then fades gently with 3D tilt)
      if (heroCopyRef.current) {
        const tp = clamp((currentProgress - 0.05) / 0.14, 0, 1)
        const tiltX = -mouseRef.current.y * 12
        const tiltY = mouseRef.current.x * 14
        heroCopyRef.current.style.opacity = (1 - tp).toFixed(3)
        heroCopyRef.current.style.transform = `translateY(${-24 * tp}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
      }

      // Update Icy Red Launch Button (visible at hero, smoothly fades on scroll)
      if (launchBtnRef.current) {
        const lbp = clamp((currentProgress - 0.04) / 0.12, 0, 1)
        const tiltX = -mouseRef.current.y * 8
        const tiltY = mouseRef.current.x * 10
        launchBtnRef.current.style.opacity = (1 - lbp).toFixed(3)
        launchBtnRef.current.style.transform = `translateX(-50%) translateY(${lbp * 20}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
        launchBtnRef.current.style.pointerEvents = lbp < 0.8 ? 'auto' : 'none'
      }

      // Update Services Text Block (strictly visible from frame_035.png to frame_058.png with 3D depth)
      if (servicesRef.current) {
        // frame_035 = index 34/59 * 0.30 = 0.1729
        // frame_058 = index 57/59 * 0.30 = 0.2898
        const frame35Progress = 0.1729
        const frame58Progress = 0.2898
        const enterRange = 0.015
        const exitRange = 0.015

        const enterStart = frame35Progress - enterRange // ~0.158
        const enterEnd = frame35Progress // ~0.173
        const exitStart = frame58Progress // ~0.290
        const exitEnd = frame58Progress + exitRange // ~0.305

        let servOpacity = 0
        let servY = 20

        if (currentProgress >= enterStart && currentProgress <= exitEnd) {
          if (currentProgress < enterEnd) {
            const p = (currentProgress - enterStart) / (enterEnd - enterStart)
            servOpacity = p
            servY = (1 - p) * 20
          } else if (currentProgress > exitStart) {
            const p = (currentProgress - exitStart) / (exitEnd - exitStart)
            servOpacity = 1 - p
            servY = -16 * p
          } else {
            servOpacity = 1
            servY = 0
          }
        }

        const tiltX = -mouseRef.current.y * 10
        const tiltY = mouseRef.current.x * 12
        servicesRef.current.style.opacity = '0'
        servicesRef.current.style.display = 'none'

        // Services Tagline Fade
        if (servOpacity > 0.15) {
          if (servicesTaglineRef.current) {
            servicesTaglineRef.current.classList.add('is-revealed')
          }
        } else if (servOpacity <= 0.01) {
          if (servicesTaglineRef.current) {
            servicesTaglineRef.current.classList.remove('is-revealed')
          }
        }
      }

      // Update Transition Stories (Covers & 9:16 Vertical Cards in Ice Tunnel)
      // Optimized Transition Stories (Zero overhead for off-screen cards)
      TRANSITION_STORIES.forEach((story, idx) => {
        const el = storyRefs.current[idx]
        if (!el) return

        const { start, end } = story
        // Absolute culling: If card is outside its progress range, instantly hide it and do NO math or DOM updates
        if (currentProgress < start || currentProgress > end) {
          if (el.style.display !== 'none') {
            el.style.display = 'none'
            el.style.opacity = '0'
            el.style.pointerEvents = 'none'
          }
          return
        }

        const p = (currentProgress - start) / (end - start)

        let rotX = 0
        let translateY = 0
        let translateZ = 0
        let scale = 1
        let opacity = 0

        if (story.type === 'cover') {
          if (p < 0.28) {
            const enterP = p / 0.28
            opacity = enterP
            translateY = (1 - enterP) * 28
          } else if (p > 0.72) {
            const exitP = (p - 0.72) / 0.28
            opacity = 1 - exitP
            translateY = -24 * exitP
          } else {
            opacity = 1
            translateY = 0
          }
        } else if (story.type === 'monument') {
          if (p < 0.3) {
            const enterP = p / 0.3
            opacity = enterP
            translateY = (1 - enterP) * 30
          } else {
            opacity = 1
            translateY = 0
          }
          translateZ = 45
          scale = 1 + 0.03 * Math.sin(p * Math.PI)
        } else if (story.type === 'connect') {
          if (p < 0.2) {
            const enterP = p / 0.2
            opacity = enterP
            translateY = (1 - enterP) * 36
            scale = 0.94 + 0.06 * enterP
          } else if (p > 0.8) {
            const exitP = (p - 0.8) / 0.2
            opacity = 1 - exitP
            translateY = -32 * exitP
            scale = 1 - 0.06 * exitP
          } else {
            opacity = 1
            translateY = 0
            scale = 1
          }
          translateZ = 25
        } else {
          // Dedicated Single Card Animation:
          const { aliveStart, aliveEnd } = story

          if (aliveStart && aliveEnd) {
            if (currentProgress < aliveStart) {
              const enterRatio = clamp((currentProgress - start) / (aliveStart - start), 0, 1)
              const easeEnter = 1 - Math.pow(1 - enterRatio, 3)

              rotX = (1 - easeEnter) * 32
              translateY = (1 - easeEnter) * 110
              translateZ = -50 * (1 - easeEnter) + 20 * easeEnter
              scale = 0.90 + 0.10 * easeEnter
              opacity = easeEnter
            } else if (currentProgress <= aliveEnd) {
              rotX = 0
              translateY = 0
              translateZ = 20
              scale = 1
              opacity = 1
            } else {
              const exitRatio = clamp((currentProgress - aliveEnd) / (end - aliveEnd), 0, 1)
              const easeExit = Math.pow(exitRatio, 2)

              rotX = -easeExit * 26
              translateY = -easeExit * 130
              translateZ = 20 - easeExit * 70
              scale = 1 - easeExit * 0.10
              opacity = Math.max(0, 1 - easeExit * 1.25)
            }
          }
        }

        // Mouse tilt (smooth & hardware-friendly)
        const mouseTiltX = isMobile ? 0 : -mouseRef.current.y * 5
        const mouseTiltY = isMobile ? 0 : mouseRef.current.x * 7

        const finalRotX = rotX + mouseTiltX
        const finalRotY = mouseTiltY

        if (opacity > 0.005) {
          if (el.style.display !== 'flex') el.style.display = 'flex'
          el.style.opacity = opacity.toFixed(3)
          // 3D translate with translate3d for GPU compositing
          el.style.transform = `translate3d(-50%, -50%, 0) translateY(${translateY.toFixed(1)}px) translateZ(${translateZ.toFixed(1)}px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`
          el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none'
        } else {
          if (el.style.display !== 'none') {
            el.style.display = 'none'
            el.style.opacity = '0'
            el.style.pointerEvents = 'none'
          }
        }

        // Tagline reveal
        if (opacity > 0.3) {
          const taglineEl = storyTaglineRefs.current[idx]
          if (taglineEl && !taglineEl.classList.contains('is-revealed')) {
            taglineEl.classList.add('is-revealed')
          }
        } else if (opacity <= 0.05) {
          const taglineEl = storyTaglineRefs.current[idx]
          if (taglineEl && taglineEl.classList.contains('is-revealed')) {
            taglineEl.classList.remove('is-revealed')
          }
        }
      })

      // Update Polaroid Line Carousel (Smooth fade in/out in services section frame 21.0 - 78.0)
      if (polaroidWrapRef.current) {
        const pStart = tunnelFrameToProgress(21.0)
        const pAliveStart = tunnelFrameToProgress(23.0)
        const pAliveEnd = tunnelFrameToProgress(76.0)
        const pEnd = tunnelFrameToProgress(78.0)

        if (currentProgress < pStart || currentProgress > pEnd) {
          if (polaroidWrapRef.current.style.display !== 'none') {
            polaroidWrapRef.current.style.display = 'none'
            polaroidWrapRef.current.style.opacity = '0'
            polaroidWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let pOpacity = 1
          let pY = 0

          if (currentProgress < pAliveStart) {
            const enterR = clamp((currentProgress - pStart) / (pAliveStart - pStart), 0, 1)
            pOpacity = enterR
            pY = (1 - enterR) * 24
          } else if (currentProgress > pAliveEnd) {
            const exitR = clamp((currentProgress - pAliveEnd) / (pEnd - pAliveEnd), 0, 1)
            pOpacity = 1 - exitR
            pY = -exitR * 24
          }

          if (polaroidWrapRef.current.style.display !== 'block') {
            polaroidWrapRef.current.style.display = 'block'
          }
          polaroidWrapRef.current.style.opacity = pOpacity.toFixed(3)
          polaroidWrapRef.current.style.transform = `translate3d(0, ${pY.toFixed(1)}px, 0)`
          polaroidWrapRef.current.style.pointerEvents = pOpacity > 0.35 ? 'auto' : 'none'

          // Scroll-driven trigger: As the user scrolls through the services range,
          // naturally swing and snap to each corresponding polaroid card (0 to 5)
          const serviceScrollRatio = clamp((currentProgress - pStart) / (pEnd - pStart), 0, 0.999)
          const targetCardIdx = Math.floor(serviceScrollRatio * 6)
          if (targetCardIdx !== lastActiveServiceIdx) {
            lastActiveServiceIdx = targetCardIdx
            window.dispatchEvent(new CustomEvent('devcore:scroll-service-index', { detail: { index: targetCardIdx } }))
          }
        }
      }

      // Update 3D Fanned Card Stack Testimonials (Clouds frames 24.5 to 56.0)
      if (testimonialsCardsWrapRef.current) {
        const fStart = cloudsFrameToProgress(24.5)
        const fAliveStart = cloudsFrameToProgress(26.0)
        const fAliveEnd = cloudsFrameToProgress(54.0)
        const fEnd = cloudsFrameToProgress(56.0)

        if (currentProgress < fStart || currentProgress > fEnd) {
          if (testimonialsCardsWrapRef.current.style.display !== 'none') {
            testimonialsCardsWrapRef.current.style.display = 'none'
            testimonialsCardsWrapRef.current.style.opacity = '0'
            testimonialsCardsWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let fOpacity = 1
          let fY = 0

          if (currentProgress < fAliveStart) {
            const enterR = clamp((currentProgress - fStart) / (fAliveStart - fStart), 0, 1)
            fOpacity = enterR
            fY = (1 - enterR) * 28
          } else if (currentProgress > fAliveEnd) {
            const exitR = clamp((currentProgress - fAliveEnd) / (fEnd - fAliveEnd), 0, 1)
            fOpacity = 1 - exitR
            fY = -exitR * 28
          }

          if (testimonialsCardsWrapRef.current.style.display !== 'flex') {
            testimonialsCardsWrapRef.current.style.display = 'flex'
          }
          testimonialsCardsWrapRef.current.style.opacity = fOpacity.toFixed(3)
          testimonialsCardsWrapRef.current.style.transform = `translate3d(0, ${fY.toFixed(1)}px, 0)`
          testimonialsCardsWrapRef.current.style.pointerEvents = fOpacity > 0.35 ? 'auto' : 'none'

          // Scroll-driven sequential card reveal:
          // As the user scrolls across the testimonials window (frame 24.5 to 56.0),
          // fan out and sequentially highlight cards 0, 1, 2, 3, 4 one-at-a-time!
          const testRatio = clamp((currentProgress - fStart) / (fEnd - fStart), 0, 0.999)
          const targetCardIdx = Math.floor(testRatio * TESTIMONIAL_ITEMS.length)
          if (targetCardIdx !== lastActiveTestimonialIdx) {
            lastActiveTestimonialIdx = targetCardIdx
            window.dispatchEvent(new CustomEvent('devcore:select-testimonial', { detail: { index: targetCardIdx } }))
          }
        }
      }

      // Update Footer
      if (footerRef.current) {
        const fp = clamp((currentProgress - 0.85) / 0.13, 0, 1)
        footerRef.current.style.opacity = fp.toFixed(3)
        footerRef.current.style.transform = `translateY(${(1 - fp) * 80}px)`
      }


      const cStart = cloudsFrameToProgress(57.0)
      const cEnd = cloudsFrameToProgress(75.0)
      if (corePhilosophyWrapRef.current) {
        const cStart = cloudsFrameToProgress(57.0)
        const cAliveStart = cloudsFrameToProgress(59.0)
        const cAliveEnd = cloudsFrameToProgress(73.0)
        const cEnd = cloudsFrameToProgress(75.0)

        if (currentProgress < cStart || currentProgress > cEnd) {
          if (corePhilosophyWrapRef.current.style.display !== 'none') {
            corePhilosophyWrapRef.current.style.display = 'none'
            corePhilosophyWrapRef.current.style.opacity = '0'
            corePhilosophyWrapRef.current.style.pointerEvents = 'none'
          }
        } else {
          let cOpacity = 1
          let cY = 0

          if (currentProgress < cAliveStart) {
            const enterR = clamp((currentProgress - cStart) / (cAliveStart - cStart), 0, 1)
            cOpacity = enterR
            cY = (1 - enterR) * 26
          } else if (currentProgress > cAliveEnd) {
            const exitR = clamp((currentProgress - cAliveEnd) / (cEnd - cAliveEnd), 0, 1)
            cOpacity = 1 - exitR
            cY = -exitR * 26
          }

          if (corePhilosophyWrapRef.current.style.display !== 'flex') {
            corePhilosophyWrapRef.current.style.display = 'flex'
          }
          corePhilosophyWrapRef.current.style.opacity = cOpacity.toFixed(3)
          corePhilosophyWrapRef.current.style.transform = `translate3d(0, ${cY.toFixed(1)}px, 0)`
          corePhilosophyWrapRef.current.style.pointerEvents = cOpacity > 0.35 ? 'auto' : 'none'

          const rawProgress = clamp((currentProgress - cStart) / (cEnd - cStart), 0, 1)
          window.dispatchEvent(new CustomEvent('devcore:core-reveal-progress', { detail: { progress: rawProgress } }))
        }
      }

      animationFrameId = window.requestAnimationFrame(tick)

  
    }

    // Initialize isMobile cache once on mount
    isMobileRef.current = window.innerWidth <= 768 || window.innerHeight > window.innerWidth

    // Page Visibility API: track tab visibility to skip RAF work when hidden
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    animationFrameId = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      {/* Clean Minimal Loader: Simple "Loading DevCore..." and Progress Bar */}
      <div
        className={`global-loader ${isLoading ? 'is-visible' : 'is-hidden'}`}
        aria-live="polite"
        aria-busy={isLoading}
      >
        <div className="loader-portal-container">
          <h2 className="simple-loader-heading">Loading DevCore...</h2>
          <div className="loader-progress-bar-wrap">
            <div className="loader-progress-bar-fill" style={{ width: `${loadPercent}%` }} />
          </div>
          <span className="simple-loader-percent">{loadPercent}%</span>
        </div>
      </div>

      <div className={`story-shell ${isLoading ? 'is-loading' : 'is-ready'}`}>
        <header className="topbar" ref={headerRef}>
          <button
            type="button"
            className="brand-pill"
            onClick={() => scrollToProgress(0)}
            aria-label="DevCore Home - Scroll to top"
          >
            <span className="brand-mark">D</span>
            <span className="brand-name">DevCore</span>
          </button>

          {/* Desktop Expanded Navigation Menu (Visible on Desktop >= 769px) */}
          <nav className="topnav topnav--desktop" aria-label="Main navigation">
            <div
              className="topnav-dropdown"
              ref={dropdownRef}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className={`topnav-btn topnav-btn--dropdown ${activeSection === 'services' ? 'is-active' : ''}`}
                onClick={() => {
                  setServicesOpen((prev) => !prev)
                  scrollToProgress(tunnelFrameToProgress(24.5))
                }}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                <svg
                  className={`dropdown-chevron ${servicesOpen ? 'is-open' : ''}`}
                  width="8"
                  height="5"
                  viewBox="0 0 8 5"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1L4 4L7 1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className={`tiny-transparent-menu ${servicesOpen ? 'is-visible' : ''}`} role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.38387)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 0 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Full-Stack Web</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.40839)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 1 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Voice & Chat Agents</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.4329)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 2 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AWS Cloud</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.45742)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 3 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>POS Systems</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.48194)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 4 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>Custom Software</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="tiny-menu-item"
                  onClick={() => {
                    scrollToProgress(0.50645)
                    window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                    setServicesOpen(false)
                  }}
                >
                  <span className="tiny-menu-dot" aria-hidden="true" />
                  <span>AI Development</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`topnav-btn ${activeSection === 'projects' ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(tunnelFrameToProgress(86.0))}
            >
              Projects
            </button>
            <button
              type="button"
              className={`topnav-btn ${activeSection === 'testimonials' ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(cloudsFrameToProgress(28.0))}
            >
              Testimonials
            </button>
            <button
              type="button"
              className={`topnav-btn ${activeSection === 'contact' ? 'is-active' : ''}`}
              onClick={() => scrollToProgress(cloudsFrameToProgress(88.0))}
            >
              Contact
            </button>
          </nav>

          {/* Mobile Three-Dots (•••) Glass Navigation Menu (Visible on Mobile <= 768px) */}
          <div className="three-dots-wrapper three-dots-wrapper--mobile" ref={menuDropdownRef}>
            <button
              type="button"
              className={`three-dots-btn ${menuOpen ? 'is-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((prev) => !prev)
              }}
              aria-expanded={menuOpen}
              aria-label="Navigation menu"
              title="Menu"
            >
              <span className="three-dot" />
              <span className="three-dot" />
              <span className="three-dot" />
            </button>

            {menuOpen && (
              <div className="three-dots-dropdown-glass" role="menu">
                <div className="menu-group-label">NAVIGATION</div>

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item"
                  onClick={() => {
                    scrollToProgress(0)
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">🚀</span>
                  <span className="menu-item-title">Home / Launch</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(24.5))
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">⚡</span>
                  <span className="menu-item-title">Services Overview</span>
                </button>

                <div className="menu-subservices-grid">
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.38387)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 0 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Full-Stack Web
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.40839)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 1 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Voice & Chat AI
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.4329)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 2 } }))
                      setMenuOpen(false)
                    }}
                  >
                    AWS Cloud
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.45742)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 3 } }))
                      setMenuOpen(false)
                    }}
                  >
                    POS Systems
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.48194)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 4 } }))
                      setMenuOpen(false)
                    }}
                  >
                    Custom Software
                  </button>
                  <button
                    type="button"
                    className="menu-sub-chip"
                    onClick={() => {
                      scrollToProgress(0.50645)
                      window.dispatchEvent(new CustomEvent('devcore:select-service', { detail: { index: 5 } }))
                      setMenuOpen(false)
                    }}
                  >
                    AI Development
                  </button>
                </div>

                <div className="menu-divider" />

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item"
                  onClick={() => {
                    scrollToProgress(tunnelFrameToProgress(86.0))
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">💼</span>
                  <span className="menu-item-title">Featured Projects</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item"
                  onClick={() => {
                    scrollToProgress(cloudsFrameToProgress(21.0))
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">⭐</span>
                  <span className="menu-item-title">Client Testimonials</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item"
                  onClick={() => {
                    scrollToProgress(cloudsFrameToProgress(66.0))
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">❄️</span>
                  <span className="menu-item-title">DevCore Philosophy</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="three-dots-item three-dots-item--cta"
                  onClick={() => {
                    scrollToProgress(cloudsFrameToProgress(88.0))
                    setMenuOpen(false)
                  }}
                >
                  <span className="menu-item-icon">✉️</span>
                  <span className="menu-item-title">Let’s Connect</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="hero-video-stage">
          <canvas ref={canvasRef} className="hero-video-canvas" />

          <div
            ref={whiteRef}
            className="white-transition"
            style={{ opacity: 0, transform: 'translateY(100%)' }}
            aria-hidden="true"
          />

          <canvas ref={snowCanvasRef} className="snow-overlay-canvas" aria-hidden="true" />

          <div className="scene-overlay">
            <div className="hero-copy" ref={heroCopyRef}>
              <span className="hero-word hero-word-we">We Ship</span>
              <span className="hero-word hero-word-products">Products</span>
              <span className="hero-word hero-word-this-way">This Way</span>
            </div>

            <div className="hero-launch-wrapper" ref={launchBtnRef}>
              {/* Rock-solid Launch Button: 3, 2, 1 Countdown inside button then launch */}
              <button
                type="button"
                className={`icy-launch-btn icy-launch-btn--circle ${countdown !== null ? 'is-counting' : ''}`}
                onClick={startCountdownAndLaunch}
                disabled={countdown !== null}
                aria-label="Power launch to Services"
                title={countdown === null ? 'Launch to Services Section' : `Countdown: ${countdown}`}
              >
                {countdown === null ? (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="power-svg"
                  >
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                ) : countdown === 'IGNITION' ? (
                  <span className="countdown-ignition-dot" />
                ) : (
                  <span key={countdown} className="countdown-number countdown-pop">
                    {countdown}
                  </span>
                )}
                <span className="sr-only">
                  {countdown === null ? 'Power Launch' : `Countdown ${countdown}`}
                </span>
              </button>
            </div>

            <div className="hero-services-block" ref={servicesRef} aria-hidden={true} style={{ opacity: 0, display: 'none' }}>
              <div className="hero-services-eyebrow">OUR SERVICES</div>
              <h2 className="hero-services-heading">
                <span ref={servicesHeadingRef}>POS & SOFTWARE SYSTEMS</span>
              </h2>
              <p className="hero-services-tagline" ref={servicesTaglineRef}>
                We provide services like POS Web apps and custom software systems tailored for enterprise growth.
              </p>
            </div>

            {/* Interactive Polaroid Line Carousel (Mounted during tunnel services section) */}
            <div
              ref={polaroidWrapRef}
              className="polaroid-carousel-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                pointerEvents: 'none',
              }}
            >
              <PolaroidLineCarousel
                slides={SERVICES_SLIDES}
                cardWidth={420}
                sag={65}
                swing={1}
                autoplay={0}
                string="#38bdf8"
                ariaLabel="DevCore Studio Services Carousel"
              />
            </div>

            {/* 3D Fanned Card Stack Testimonials (Transparent cards that fan out in sequence) */}
            <div
              ref={testimonialsCardsWrapRef}
              className="fanned-testimonials-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                pointerEvents: 'none',
              }}
            >
              <IceCubeTestimonials
                items={TESTIMONIAL_ITEMS}
              />
            </div>

            {/* Dedicated Core Philosophy Reveal Stage */}
            <div
              ref={corePhilosophyWrapRef}
              className="core-philosophy-stage"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 40,
                opacity: 0,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                pointerEvents: 'none',
              }}
            >
              <ImageTextReveal />
            </div>

            {TRANSITION_STORIES.map((story, index) => (
              <div
                key={story.id}
                ref={(el) => {
                  storyRefs.current[index] = el
                }}
                className={`transition-story-card ${story.type === 'card' ? 'transition-story-card--vertical' : 'transition-story-card--cover'}`}
                style={{ opacity: 0, display: 'none' }}
              >
                {story.type === 'card' ? (
                  <div className="card-9-16-glass">
                    {/* Top Header: Badge & Index */}
                    <div className="card-9-16-top">
                      <div className="story-badge">
                        <span className="story-badge-dot" aria-hidden="true" />
                        <span>{story.badge}</span>
                      </div>
                      <span className="card-9-16-index">{story.index} / {story.totalCount || '06'}</span>
                    </div>

                    {/* Center Content: Icon + Title + Tagline + Tech Pills */}
                    <div className="card-9-16-center">
                      <div className="card-9-16-icon-wrap" aria-hidden="true">
                        {story.icon === 'web' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        )}
                        {story.icon === 'voice' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                        )}
                        {story.icon === 'cloud' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                          </svg>
                        )}
                        {story.icon === 'pos' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        )}
                        {story.icon === 'software' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                          </svg>
                        )}
                        {story.icon === 'ai' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        )}
                        {story.icon === 'quote' && (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                        )}
                      </div>

                      <h3 className="card-9-16-title">
                        <span
                          ref={(el) => {
                            storyTitleRefs.current[index] = el
                          }}
                        >
                          {story.title}
                        </span>
                      </h3>

                      <p
                        className="card-9-16-tagline"
                        ref={(el) => {
                          storyTaglineRefs.current[index] = el
                        }}
                      >
                        {story.tagline}
                      </p>

                      {story.tags && (
                        <div className="card-9-16-tags">
                          {story.tags.slice(0, 4).map((tag, tIdx) => (
                            <span key={tIdx} className="card-9-16-pill">
                              <span className="card-9-16-dot" aria-hidden="true" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Footer: CTA Button */}
                    <div className="card-9-16-bottom">
                      {story.cta && (
                        <a href={story.href || '#'} className="story-cta-btn">
                          <span>{story.cta}</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M7 17l9.2-9.2M17 17V8H8" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ) : story.type === 'connect' ? (
                  <div className="card-connect-glass">
                    <div className="card-connect-header">
                      <div className="story-badge">
                        <span className="story-badge-dot" aria-hidden="true" />
                        <span>{story.badge}</span>
                      </div>
                      <h2 className="card-connect-title">{story.title}</h2>
                      <p className="card-connect-tagline">{story.tagline}</p>
                    </div>

                    {/* Required Direct Links */}
                    <div className="card-connect-links">
                      <a href="mailto:hello@devcore.studio" className="connect-link-chip">
                        <span className="connect-chip-label">EMAIL</span>
                        <span className="connect-chip-val">hello@devcore.studio ↗</span>
                      </a>
                      <a href="mailto:projects@devcore.studio" className="connect-link-chip">
                        <span className="connect-chip-label">NEW PROJECT</span>
                        <span className="connect-chip-val">projects@devcore.studio ↗</span>
                      </a>
                      <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="connect-link-chip">
                        <span className="connect-chip-label">LINKEDIN</span>
                        <span className="connect-chip-val">linkedin.com/company/devcore ↗</span>
                      </a>
                      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="connect-link-chip">
                        <span className="connect-chip-label">GITHUB</span>
                        <span className="connect-chip-val">github.com/devcore ↗</span>
                      </a>
                    </div>

                    {/* Required Interactive Contact Form */}
                    <form
                      className="card-connect-form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        alert('Message sent to DevCore Studio! We will respond within 24 hours.')
                      }}
                    >
                      <div className="connect-form-row">
                        <input
                          type="text"
                          className="connect-form-input"
                          placeholder="Your Name"
                          required
                        />
                        <input
                          type="email"
                          className="connect-form-input"
                          placeholder="Your Email"
                          required
                        />
                      </div>
                      <textarea
                        className="connect-form-textarea"
                        placeholder="Tell us about your project, POS or AI agent needs..."
                        rows={3}
                        required
                      />
                      <button type="submit" className="story-cta-btn connect-submit-btn">
                        <span>Send Message</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ) : story.type === 'monument' ? (
                  <div className="barfani-monument-wrap">
                    <h1 className="barfani-monument-title">{story.title}</h1>
                    <p className="barfani-monument-subtitle">{story.subtitle}</p>
                  </div>
                ) : (
                  <>
                    <div className="story-badge">
                      <span className="story-badge-dot" aria-hidden="true" />
                      <span>{story.badge}</span>
                    </div>
                    <h2 className="story-title">
                      <span
                        ref={(el) => {
                          storyTitleRefs.current[index] = el
                        }}
                      >
                        {story.title}
                      </span>
                    </h2>
                    <p
                      className="story-tagline"
                      ref={(el) => {
                        storyTaglineRefs.current[index] = el
                      }}
                    >
                      {story.tagline}
                    </p>
                    {story.cta && (
                      story.href ? (
                        <a
                          href={story.href}
                          className="story-cta-btn"
                        >
                          <span>{story.cta}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="story-cta-btn"
                          onClick={() => story.target !== undefined && scrollToProgress(story.target)}
                        >
                          <span>{story.cta}</span>
                        </button>
                      )
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>


        <footer className="bottombar" ref={footerRef} style={{ opacity: 0, transform: 'translateY(80px)' }}>
          <div className="footer-shell">
            <span>DevCore — POS Web Apps & Custom Software Systems</span>
            <button
              type="button"
              className="footer-shell-btn"
              onClick={() => scrollToProgress(0.95)}
            >
              Contact DevCore
            </button>
          </div>
        </footer>

        {/* Floating Back-To-Top Arrow Button */}
        <button
          type="button"
          className={`floating-back-to-top ${showBackToTop ? 'is-visible' : ''}`}
          onClick={() => scrollToProgress(0, 1400)}
          aria-label="Back to Homepage"
          title="Back to Top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

        {/* Floating AI Chat Widget */}
        <div className="floating-ai-chat-root">
          {!aiChatOpen && (
            <button
              type="button"
              className="floating-ai-trigger-circle"
              onClick={() => setAiChatOpen(true)}
              aria-label="Open DevCore AI Assistant"
              title="Chat with DevCore AI"
            >
              <div className="ai-trigger-circle-inner">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ai-bot-circle-icon">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <rect x="3" y="8" width="18" height="12" rx="4" />
                  <circle cx="9" cy="14" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="14" r="1.5" fill="currentColor" />
                  <path d="M9 18h6" />
                </svg>
                <span className="ai-live-pulse-dot" />
              </div>
            </button>
          )}

          {aiChatOpen && (
            <div className="ai-chat-window-glass" role="dialog" aria-label="DevCore AI Chat">
              <div className="ai-chat-header">
                <div className="ai-header-left">
                  <div className="ai-header-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="8" width="18" height="12" rx="4" />
                      <circle cx="9" cy="14" r="1.5" fill="currentColor" />
                      <circle cx="15" cy="14" r="1.5" fill="currentColor" />
                      <path d="M9 18h6" />
                    </svg>
                    <span className="ai-online-status-dot" />
                  </div>
                  <div>
                    <h3 className="ai-header-title">DevCore AI</h3>
                    <p className="ai-header-subtitle">Real-time Engineering Knowledge</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ai-chat-close-btn"
                  onClick={() => setAiChatOpen(false)}
                  aria-label="Close AI Chat"
                >
                  ✕
                </button>
              </div>

              <div className="ai-chat-body">
                {aiMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`ai-message-row ${msg.sender === 'user' ? 'ai-message-user' : 'ai-message-bot'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="ai-bot-avatar-tiny">
                        <span>D</span>
                      </div>
                    )}
                    <div className="ai-bubble">
                      <div className="ai-bubble-text">{msg.text}</div>
                      <span className="ai-bubble-time">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="ai-message-row ai-message-bot">
                    <div className="ai-bot-avatar-tiny">
                      <span>D</span>
                    </div>
                    <div className="ai-bubble ai-bubble--typing">
                      <span className="ai-typing-dot" />
                      <span className="ai-typing-dot" />
                      <span className="ai-typing-dot" />
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* Quick suggestion chips */}
              <div className="ai-quick-chips">
                <button
                  type="button"
                  className="ai-chip"
                  onClick={() => handleSendAiMessage('What services do you provide?')}
                >
                  Services Overview
                </button>
                <button
                  type="button"
                  className="ai-chip"
                  onClick={() => handleSendAiMessage('Tell me about Voice & Chat Agents')}
                >
                  Voice AI
                </button>
                <button
                  type="button"
                  className="ai-chip"
                  onClick={() => handleSendAiMessage('What POS solutions do you build?')}
                >
                  POS Systems
                </button>
                <button
                  type="button"
                  className="ai-chip"
                  onClick={() => handleSendAiMessage('How can I contact DevCore Studio?')}
                >
                  Contact Info
                </button>
              </div>

              {/* Input Form */}
              <form
                className="ai-chat-footer"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendAiMessage(aiInput)
                }}
              >
                <input
                  type="text"
                  className="ai-chat-input"
                  placeholder="Ask about DevCore services, AI, POS..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="ai-chat-send-btn"
                  disabled={!aiInput.trim()}
                  aria-label="Send query"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="story-spacer" aria-hidden="true" />
      </div>
    </>
  )
}

export default AppComplete
