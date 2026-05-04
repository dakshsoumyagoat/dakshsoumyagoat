import { create } from 'zustand'

export type Subject = 'Physics' | 'Chemistry' | 'Mathematics'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Mastery = 'Not Started' | 'Weak' | 'Average' | 'Strong' | 'Mastered'

export interface Chapter {
  id: string
  subject: Subject
  unit: string
  name: string
  theory: number
  pyqs: number
  mockAccuracy: number
  revisionCount: number
  confidence: number
  mastery: Mastery
  lastStudied: string | null
  nextRevision: string | null
  difficulty: Difficulty
  subtopics: string[]
}

export interface StudySession {
  id: string
  date: string
  subject: Subject
  chapter: string
  duration: number
  type: 'Theory' | 'Practice' | 'Revision' | 'Mock'
  notes: string
}

export interface MockTest {
  id: string
  date: string
  type: 'JEE Main' | 'JEE Advanced'
  physics: number
  chemistry: number
  maths: number
  total: number
  maxMarks: number
  timeSpent: number
  rank: number
  accuracy: number
}

export interface BookmarkedQuestion {
  id: string
  subject: Subject
  chapter: string
  difficulty: Difficulty
  tags: string[]
  notes: string
  bookmarked: string
  attempts: number
  solved: boolean
}

export interface Task {
  id: string
  title: string
  subject: Subject | 'General'
  type: 'Theory' | 'Practice' | 'Revision' | 'Mock'
  date: string
  duration: number
  completed: boolean
  chapter?: string
}

export interface FormulaNote {
  id: string
  subject: Subject
  title: string
  content: string
  tags: string[]
  created: string
  pinned: boolean
}

interface AppState {
  activeView: string
  setActiveView: (view: string) => void
  chapters: Chapter[]
  updateChapter: (id: string, updates: Partial<Chapter>) => void
  sessions: StudySession[]
  addSession: (session: StudySession) => void
  mockTests: MockTest[]
  addMockTest: (test: MockTest) => void
  bookmarks: BookmarkedQuestion[]
  addBookmark: (q: BookmarkedQuestion) => void
  removeBookmark: (id: string) => void
  updateBookmark: (id: string, updates: Partial<BookmarkedQuestion>) => void
  tasks: Task[]
  addTask: (task: Task) => void
  toggleTask: (id: string) => void
  formulas: FormulaNote[]
  addFormula: (f: FormulaNote) => void
  updateFormula: (id: string, updates: Partial<FormulaNote>) => void
  removeFormula: (id: string) => void
  pomodoroActive: boolean
  setPomodoroActive: (v: boolean) => void
  streakDays: number
  xp: number
  addXP: (amount: number) => void
  studyHoursToday: number
  productivityScore: number
}

const generateChapters = (): Chapter[] => {
  const physicsChapters = [
    { unit: 'Mechanics', chapters: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'Properties of Matter'] },
    { unit: 'Thermodynamics', chapters: ['Thermal Properties', 'Kinetic Theory', 'Thermodynamics', 'Heat Transfer'] },
    { unit: 'Electrostatics', chapters: ['Electric Charges', 'Gauss Law', 'Capacitance', 'Current Electricity'] },
    { unit: 'Magnetism', chapters: ['Moving Charges', 'Magnetism', 'EMI', 'AC Circuits'] },
    { unit: 'Optics', chapters: ['Ray Optics', 'Wave Optics', 'Dual Nature'] },
    { unit: 'Modern Physics', chapters: ['Atoms', 'Nuclei', 'Semiconductors'] },
  ]
  const chemChapters = [
    { unit: 'Physical', chapters: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Chemical Kinetics'] },
    { unit: 'Organic', chapters: ['General Organic', 'Hydrocarbons', 'Haloalkanes', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Amines', 'Biomolecules'] },
    { unit: 'Inorganic', chapters: ['Periodic Table', 'Chemical Bonding', 's-Block', 'p-Block', 'd-Block', 'Coordination', 'Metallurgy'] },
  ]
  const mathChapters = [
    { unit: 'Algebra', chapters: ['Sets & Relations', 'Complex Numbers', 'Quadratic Equations', 'Sequences', 'Binomial Theorem', 'Permutations', 'Matrices', 'Determinants'] },
    { unit: 'Calculus', chapters: ['Limits', 'Continuity', 'Differentiation', 'Applications of Derivatives', 'Indefinite Integration', 'Definite Integration', 'Differential Equations'] },
    { unit: 'Coordinate Geometry', chapters: ['Straight Lines', 'Circles', 'Parabola', 'Ellipse', 'Hyperbola'] },
    { unit: 'Trigonometry', chapters: ['Trigonometric Functions', 'Inverse Trigonometry'] },
    { unit: 'Vector & 3D', chapters: ['Vectors', '3D Geometry'] },
    { unit: 'Statistics', chapters: ['Statistics', 'Probability'] },
  ]

  const masteries: Mastery[] = ['Not Started', 'Weak', 'Average', 'Strong', 'Mastered']
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']
  const subjects: [typeof physicsChapters, typeof physicsChapters, typeof mathChapters] = [physicsChapters as any, chemChapters as any, mathChapters]
  const subjectNames: Subject[] = ['Physics', 'Chemistry', 'Mathematics']

  const chapters: Chapter[] = []
  let idx = 0

  subjects.forEach((units, si) => {
    units.forEach(unit => {
      unit.chapters.forEach(name => {
        const theory = Math.floor(Math.random() * 100)
        const confidence = Math.floor(Math.random() * 100)
        const masteryIdx = Math.floor(confidence / 25)
        chapters.push({
          id: `ch-${idx++}`,
          subject: subjectNames[si],
          unit: unit.unit,
          name,
          theory,
          pyqs: Math.floor(Math.random() * 80),
          mockAccuracy: Math.floor(Math.random() * 90) + 10,
          revisionCount: Math.floor(Math.random() * 5),
          confidence,
          mastery: masteries[Math.min(masteryIdx, 4)],
          lastStudied: idx % 3 === 0 ? null : new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
          nextRevision: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
          difficulty: difficulties[Math.floor(Math.random() * 3)],
          subtopics: [],
        })
      })
    })
  })
  return chapters
}

const generateSessions = (): StudySession[] => {
  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics']
  const types: StudySession['type'][] = ['Theory', 'Practice', 'Revision', 'Mock']
  const sessions: StudySession[] = []
  for (let i = 0; i < 60; i++) {
    const d = new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 0.5)
    sessions.push({
      id: `s-${i}`,
      date: d.toISOString().split('T')[0],
      subject: subjects[Math.floor(Math.random() * 3)],
      chapter: 'Kinematics',
      duration: Math.floor(Math.random() * 120) + 30,
      type: types[Math.floor(Math.random() * 4)],
      notes: '',
    })
  }
  return sessions
}

const generateMockTests = (): MockTest[] => {
  const tests: MockTest[] = []
  for (let i = 0; i < 12; i++) {
    const physics = Math.floor(Math.random() * 60) + 20
    const chemistry = Math.floor(Math.random() * 60) + 20
    const maths = Math.floor(Math.random() * 60) + 20
    tests.push({
      id: `mt-${i}`,
      date: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
      type: i % 3 === 0 ? 'JEE Advanced' : 'JEE Main',
      physics,
      chemistry,
      maths,
      total: physics + chemistry + maths,
      maxMarks: 300,
      timeSpent: Math.floor(Math.random() * 60) + 150,
      rank: Math.floor(Math.random() * 5000) + 500,
      accuracy: Math.floor(Math.random() * 40) + 50,
    })
  }
  return tests.reverse()
}

export const useStore = create<AppState>((set) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
  chapters: generateChapters(),
  updateChapter: (id, updates) => set((s) => ({
    chapters: s.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  sessions: generateSessions(),
  addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
  mockTests: generateMockTests(),
  addMockTest: (test) => set((s) => ({ mockTests: [...s.mockTests, test] })),
  bookmarks: [
    { id: 'bq-1', subject: 'Physics', chapter: 'Rotational Motion', difficulty: 'Hard', tags: ['MOI', 'Angular Momentum'], notes: 'Tricky part - parallel axis theorem with composite bodies', bookmarked: '2024-01-15', attempts: 3, solved: false },
    { id: 'bq-2', subject: 'Chemistry', chapter: 'Electrochemistry', difficulty: 'Medium', tags: ['Nernst Equation'], notes: 'Remember to use log base 10', bookmarked: '2024-01-18', attempts: 2, solved: true },
    { id: 'bq-3', subject: 'Mathematics', chapter: 'Definite Integration', difficulty: 'Hard', tags: ['King Property', 'Limits'], notes: 'Use king property then substitute', bookmarked: '2024-01-20', attempts: 4, solved: false },
    { id: 'bq-4', subject: 'Physics', chapter: 'Wave Optics', difficulty: 'Medium', tags: ['YDSE', 'Fringe Width'], notes: 'Path difference calculation', bookmarked: '2024-01-22', attempts: 1, solved: false },
    { id: 'bq-5', subject: 'Mathematics', chapter: 'Complex Numbers', difficulty: 'Hard', tags: ['Geometry', 'Rotation'], notes: 'Rotation by e^(i theta)', bookmarked: '2024-01-25', attempts: 2, solved: true },
  ],
  addBookmark: (q) => set((s) => ({ bookmarks: [q, ...s.bookmarks] })),
  removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter(b => b.id !== id) })),
  updateBookmark: (id, updates) => set((s) => ({ bookmarks: s.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b) })),
  tasks: [
    { id: 't-1', title: 'Complete Rotational Dynamics theory', subject: 'Physics', type: 'Theory', date: new Date().toISOString().split('T')[0], duration: 90, completed: false, chapter: 'Rotational Motion' },
    { id: 't-2', title: 'Solve 30 Organic Chemistry PYQs', subject: 'Chemistry', type: 'Practice', date: new Date().toISOString().split('T')[0], duration: 60, completed: true, chapter: 'Organic' },
    { id: 't-3', title: 'Revise Integration formulas', subject: 'Mathematics', type: 'Revision', date: new Date().toISOString().split('T')[0], duration: 45, completed: false, chapter: 'Definite Integration' },
    { id: 't-4', title: 'JEE Main Mock Test #13', subject: 'General', type: 'Mock', date: new Date().toISOString().split('T')[0], duration: 180, completed: false },
  ],
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  toggleTask: (id) => set((s) => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) })),
  formulas: [
    { id: 'f-1', subject: 'Physics', title: 'Rotational Mechanics', content: '**Moment of Inertia**\n- Solid sphere: I = (2/5)MR²\n- Ring: I = MR²\n- Disk: I = (1/2)MR²\n- Rod (center): I = ML²/12\n\n**Parallel Axis Theorem**\nI = I_cm + Md²\n\n**Torque**\nτ = Iα = r × F', tags: ['Rotation', 'MOI', 'Mechanics'], created: '2024-01-10', pinned: true },
    { id: 'f-2', subject: 'Mathematics', title: 'Integration Techniques', content: '**Standard Integrals**\n∫sinx dx = -cosx + C\n∫cosx dx = sinx + C\n∫tan x dx = ln|sec x| + C\n\n**King Property**\n∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx\n\n**By Parts**\n∫uv dx = u∫v dx - ∫(u\'∫v dx)dx', tags: ['Integration', 'Calculus'], created: '2024-01-12', pinned: true },
    { id: 'f-3', subject: 'Chemistry', title: 'Electrochemistry', content: '**Nernst Equation**\nE = E° - (RT/nF) × ln Q\n\n**At 25°C:**\nE = E° - (0.0592/n) × log Q\n\n**Cell Reaction:**\nΔG° = -nFE°\nΔG° = -RT ln K', tags: ['Electrochemistry', 'Nernst'], created: '2024-01-14', pinned: false },
  ],
  addFormula: (f) => set((s) => ({ formulas: [f, ...s.formulas] })),
  updateFormula: (id, updates) => set((s) => ({ formulas: s.formulas.map(f => f.id === id ? { ...f, ...updates } : f) })),
  removeFormula: (id) => set((s) => ({ formulas: s.formulas.filter(f => f.id !== id) })),
  pomodoroActive: false,
  setPomodoroActive: (v) => set({ pomodoroActive: v }),
  streakDays: 14,
  xp: 3420,
  addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
  studyHoursToday: 4.5,
  productivityScore: 78,
}))
