import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Subject = 'Physics' | 'Chemistry' | 'Mathematics'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Mastery = 'Not Started' | 'Weak' | 'Average' | 'Strong' | 'Mastered'

export interface Chapter {
  id: string
  subject: Subject
  unit: string
  name: string
  grade: 11 | 12
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
  completedSubtopics: string[]
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

export interface FocusSession {
  id: string
  date: string
  subject: Subject | 'General'
  duration: number
  mode: string
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

export interface MinorTest {
  id: string
  date: string
  name: string
  physics: number
  chemistry: number
  maths: number
  total: number
  maxMarks: number
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

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  description?: string
  type?: string
  color?: string
}

export type NoteColor = 'yellow' | 'peach' | 'mint' | 'lavender'

export interface ImportantNote {
  id: string
  title: string
  content: string
  color: NoteColor
  reminder?: string
  pinned: boolean
  completed: boolean
  createdAt: string
  updatedAt: string
}

interface AppState {
  activeView: string
  setActiveView: (view: string) => void
  chapters: Chapter[]
  updateChapter: (id: string, updates: Partial<Chapter>) => void
  toggleSubtopic: (chapterId: string, subtopic: string) => void
  sessions: StudySession[]
  addSession: (session: StudySession) => void
  focusSessions: FocusSession[]
  addFocusSession: (s: FocusSession) => void
  mockTests: MockTest[]
  addMockTest: (test: MockTest) => void
  minorTests: MinorTest[]
  addMinorTest: (test: MinorTest) => void
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
  calendarEvents: CalendarEvent[]
  addCalendarEvents: (events: CalendarEvent[]) => void
  removeCalendarEvent: (id: string) => void
  importantNotes: ImportantNote[]
  addImportantNote: (note: ImportantNote) => void
  updateImportantNote: (id: string, updates: Partial<ImportantNote>) => void
  removeImportantNote: (id: string) => void
  toggleImportantNoteComplete: (id: string) => void
  toggleImportantNotePinned: (id: string) => void
  pomodoroActive: boolean
  setPomodoroActive: (v: boolean) => void
  streakDays: number
  xp: number
  addXP: (amount: number) => void
}

// ─── GRADE 11 CHAPTERS ────────────────────────────────────────────────────────
const generateGrade11Chapters = (): Chapter[] => {
  const physicsChapters = [
    { unit: 'Mechanics', chapters: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'Properties of Matter'] },
    { unit: 'Thermodynamics', chapters: ['Thermal Properties', 'Kinetic Theory', 'Thermodynamics', 'Heat Transfer'] },
    { unit: 'Waves & Oscillations', chapters: ['Oscillations', 'Waves'] },
  ]
  const chemChapters = [
    { unit: 'Physical', chapters: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions'] },
    { unit: 'Organic', chapters: ['General Organic Chemistry', 'Hydrocarbons'] },
    { unit: 'Inorganic', chapters: ['Periodic Table', 'Hydrogen', 's-Block Elements', 'p-Block (Gr 13 & 14)', 'Environmental Chemistry'] },
  ]
  const mathChapters = [
    { unit: 'Algebra', chapters: ['Sets & Relations', 'Complex Numbers', 'Quadratic Equations', 'Sequences & Series', 'Binomial Theorem', 'Permutations & Combinations'] },
    { unit: 'Calculus', chapters: ['Limits & Derivatives'] },
    { unit: 'Coordinate Geometry', chapters: ['Straight Lines', 'Conic Sections'] },
    { unit: 'Trigonometry', chapters: ['Trigonometric Functions'] },
    { unit: 'Statistics & Probability', chapters: ['Statistics', 'Probability (Basic)'] },
    { unit: 'Mathematical Reasoning', chapters: ['Mathematical Reasoning'] },
  ]

  const all = [
    { sub: 'Physics' as Subject, units: physicsChapters },
    { sub: 'Chemistry' as Subject, units: chemChapters },
    { sub: 'Mathematics' as Subject, units: mathChapters },
  ]

  const chapters: Chapter[] = []
  let idx = 0
  all.forEach(({ sub, units }) => {
    units.forEach(u => {
      u.chapters.forEach(name => {
        chapters.push({
          id: `g11-${idx++}`, subject: sub, unit: u.unit, name, grade: 11,
          theory: 0, pyqs: 0, mockAccuracy: 0, revisionCount: 0, confidence: 0,
          mastery: 'Not Started', lastStudied: null, nextRevision: null,
          difficulty: 'Medium', subtopics: [], completedSubtopics: [],
        })
      })
    })
  })
  return chapters
}

// ─── GRADE 12 CHAPTERS (no subtopics — user fills own notes) ─────────────────
const buildGrade12Chapters = (): Chapter[] => {
  const PHYSICS: { unit: string; name: string; difficulty: Difficulty }[] = [
    { unit: 'Electrostatics', name: 'Electric Charges & Fields', difficulty: 'Medium' },
    { unit: 'Electrostatics', name: 'Electrostatic Potential & Capacitance', difficulty: 'Hard' },
    { unit: 'Current Electricity', name: 'Current Electricity', difficulty: 'Medium' },
    { unit: 'Magnetism', name: 'Moving Charges & Magnetism', difficulty: 'Hard' },
    { unit: 'Magnetism', name: 'Magnetism & Matter', difficulty: 'Easy' },
    { unit: 'Electromagnetic Induction', name: 'Electromagnetic Induction', difficulty: 'Hard' },
    { unit: 'Electromagnetic Induction', name: 'Alternating Current', difficulty: 'Hard' },
    { unit: 'Electromagnetic Waves', name: 'Electromagnetic Waves', difficulty: 'Easy' },
    { unit: 'Optics', name: 'Ray Optics & Optical Instruments', difficulty: 'Medium' },
    { unit: 'Optics', name: 'Wave Optics', difficulty: 'Hard' },
    { unit: 'Modern Physics', name: 'Dual Nature of Radiation & Matter', difficulty: 'Medium' },
    { unit: 'Modern Physics', name: 'Atoms', difficulty: 'Medium' },
    { unit: 'Modern Physics', name: 'Nuclei', difficulty: 'Medium' },
    { unit: 'Modern Physics', name: 'Semiconductor Devices', difficulty: 'Medium' },
  ]
  const CHEMISTRY: { unit: string; name: string; difficulty: Difficulty }[] = [
    { unit: 'Physical Chemistry', name: 'Solid State', difficulty: 'Medium' },
    { unit: 'Physical Chemistry', name: 'Solutions', difficulty: 'Medium' },
    { unit: 'Physical Chemistry', name: 'Electrochemistry', difficulty: 'Hard' },
    { unit: 'Physical Chemistry', name: 'Chemical Kinetics', difficulty: 'Hard' },
    { unit: 'Physical Chemistry', name: 'Surface Chemistry', difficulty: 'Easy' },
    { unit: 'Inorganic Chemistry', name: 'General Principles of Isolation of Elements', difficulty: 'Easy' },
    { unit: 'Inorganic Chemistry', name: 'p-Block Elements (Group 15, 16, 17, 18)', difficulty: 'Hard' },
    { unit: 'Inorganic Chemistry', name: 'd & f-Block Elements', difficulty: 'Medium' },
    { unit: 'Inorganic Chemistry', name: 'Coordination Compounds', difficulty: 'Hard' },
    { unit: 'Organic Chemistry', name: 'Haloalkanes & Haloarenes', difficulty: 'Medium' },
    { unit: 'Organic Chemistry', name: 'Alcohols, Phenols & Ethers', difficulty: 'Medium' },
    { unit: 'Organic Chemistry', name: 'Aldehydes, Ketones & Carboxylic Acids', difficulty: 'Hard' },
    { unit: 'Organic Chemistry', name: 'Amines', difficulty: 'Medium' },
    { unit: 'Organic Chemistry', name: 'Biomolecules', difficulty: 'Easy' },
    { unit: 'Organic Chemistry', name: 'Polymers', difficulty: 'Easy' },
    { unit: 'Organic Chemistry', name: 'Chemistry in Everyday Life', difficulty: 'Easy' },
  ]
  const MATHS: { unit: string; name: string; difficulty: Difficulty }[] = [
    { unit: 'Algebra', name: 'Relations & Functions', difficulty: 'Easy' },
    { unit: 'Algebra', name: 'Inverse Trigonometric Functions', difficulty: 'Medium' },
    { unit: 'Algebra', name: 'Matrices', difficulty: 'Easy' },
    { unit: 'Algebra', name: 'Determinants', difficulty: 'Medium' },
    { unit: 'Calculus', name: 'Continuity & Differentiability', difficulty: 'Hard' },
    { unit: 'Calculus', name: 'Applications of Derivatives', difficulty: 'Hard' },
    { unit: 'Calculus', name: 'Integrals', difficulty: 'Hard' },
    { unit: 'Calculus', name: 'Applications of Integrals', difficulty: 'Medium' },
    { unit: 'Calculus', name: 'Differential Equations', difficulty: 'Hard' },
    { unit: 'Vectors & 3D', name: 'Vectors', difficulty: 'Medium' },
    { unit: 'Vectors & 3D', name: 'Three Dimensional Geometry', difficulty: 'Hard' },
    { unit: 'Linear Programming', name: 'Linear Programming', difficulty: 'Easy' },
    { unit: 'Probability', name: 'Probability (Advanced)', difficulty: 'Hard' },
  ]

  const all: { sub: Subject; defs: { unit: string; name: string; difficulty: Difficulty }[] }[] = [
    { sub: 'Physics', defs: PHYSICS },
    { sub: 'Chemistry', defs: CHEMISTRY },
    { sub: 'Mathematics', defs: MATHS },
  ]

  const chapters: Chapter[] = []
  let idx = 0
  all.forEach(({ sub, defs }) => {
    defs.forEach(def => {
      chapters.push({
        id: `g12-${idx++}`, subject: sub, unit: def.unit, name: def.name, grade: 12,
        theory: 0, pyqs: 0, mockAccuracy: 0, revisionCount: 0, confidence: 0,
        mastery: 'Not Started', lastStudied: null, nextRevision: null,
        difficulty: def.difficulty, subtopics: [], completedSubtopics: [],
      })
    })
  })
  return chapters
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      chapters: [...generateGrade11Chapters(), ...buildGrade12Chapters()],
      updateChapter: (id, updates) => set((s) => ({
        chapters: s.chapters.map(c => c.id === id ? { ...c, ...updates } : c),
      })),
      toggleSubtopic: (chapterId, subtopic) => set((s) => ({
        chapters: s.chapters.map(c => {
          if (c.id !== chapterId) return c
          const completed = c.completedSubtopics.includes(subtopic)
            ? c.completedSubtopics.filter(st => st !== subtopic)
            : [...c.completedSubtopics, subtopic]
          const pct = c.subtopics.length > 0 ? Math.round((completed.length / c.subtopics.length) * 100) : 0
          return { ...c, completedSubtopics: completed, theory: pct }
        }),
      })),

      sessions: [],
      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),

      focusSessions: [],
      addFocusSession: (fs) => set((s) => ({ focusSessions: [fs, ...s.focusSessions] })),

      mockTests: [],
      addMockTest: (test) => set((s) => ({ mockTests: [...s.mockTests, test] })),
      minorTests: [],
      addMinorTest: (test) => set((s) => ({ minorTests: [...s.minorTests, test] })),

      bookmarks: [],
      addBookmark: (q) => set((s) => ({ bookmarks: [q, ...s.bookmarks] })),
      removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter(b => b.id !== id) })),
      updateBookmark: (id, updates) => set((s) => ({
        bookmarks: s.bookmarks.map(b => b.id === id ? { ...b, ...updates } : b),
      })),

      tasks: [],
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
      })),

      formulas: [],
      addFormula: (f) => set((s) => ({ formulas: [f, ...s.formulas] })),
      updateFormula: (id, updates) => set((s) => ({
        formulas: s.formulas.map(f => f.id === id ? { ...f, ...updates } : f),
      })),
      removeFormula: (id) => set((s) => ({ formulas: s.formulas.filter(f => f.id !== id) })),

      calendarEvents: [],
      addCalendarEvents: (events) => set((s) => ({
        calendarEvents: [...s.calendarEvents, ...events],
      })),
      removeCalendarEvent: (id) => set((s) => ({
        calendarEvents: s.calendarEvents.filter(event => event.id !== id),
      })),

      importantNotes: [],
      addImportantNote: (note) => set((s) => ({ importantNotes: [note, ...s.importantNotes] })),
      updateImportantNote: (id, updates) => set((s) => ({
        importantNotes: s.importantNotes.map(note => note.id === id ? { ...note, ...updates } : note),
      })),
      removeImportantNote: (id) => set((s) => ({
        importantNotes: s.importantNotes.filter(note => note.id !== id),
      })),
      toggleImportantNoteComplete: (id) => set((s) => ({
        importantNotes: s.importantNotes.map(note => note.id === id ? { ...note, completed: !note.completed, updatedAt: new Date().toISOString() } : note),
      })),
      toggleImportantNotePinned: (id) => set((s) => ({
        importantNotes: s.importantNotes.map(note => note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note),
      })),

      pomodoroActive: false,
      setPomodoroActive: (v) => set({ pomodoroActive: v }),
      streakDays: 0,
      xp: 0,
      addXP: (amount) => set((s) => ({ xp: s.xp + amount })),
    }),
    {
      name: 'jcc-store-v1',
      partialize: (state) => ({
        chapters:      state.chapters,
        tasks:         state.tasks,
        bookmarks:     state.bookmarks,
        formulas:      state.formulas,
        calendarEvents: state.calendarEvents,
        sessions:      state.sessions,
        focusSessions: state.focusSessions,
        mockTests:     state.mockTests,
        minorTests:    state.minorTests,
        importantNotes: state.importantNotes,
        streakDays:    state.streakDays,
        xp:            state.xp,
      }),
    }
  )
)
