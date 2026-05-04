import { create } from 'zustand'

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
  toggleSubtopic: (chapterId: string, subtopic: string) => void
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

// ─── GRADE 11 CHAPTERS (no subtopics, random progress) ────────────────────────
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

  const masteries: Mastery[] = ['Not Started', 'Weak', 'Average', 'Strong', 'Mastered']
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard']
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
        const theory = Math.floor(Math.random() * 100)
        const confidence = Math.floor(Math.random() * 100)
        chapters.push({
          id: `g11-${idx++}`,
          subject: sub,
          unit: u.unit,
          name,
          grade: 11,
          theory,
          pyqs: Math.floor(Math.random() * 80),
          mockAccuracy: Math.floor(Math.random() * 90) + 10,
          revisionCount: Math.floor(Math.random() * 5),
          confidence,
          mastery: masteries[Math.min(Math.floor(confidence / 25), 4)],
          lastStudied: idx % 3 === 0 ? null : new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
          nextRevision: new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
          difficulty: difficulties[Math.floor(Math.random() * 3)],
          subtopics: [],
          completedSubtopics: [],
        })
      })
    })
  })
  return chapters
}

// ─── GRADE 12 CHAPTERS (with L1, L2... subtopics) ─────────────────────────────
interface G12ChapterDef {
  unit: string
  name: string
  difficulty: Difficulty
  subtopics: string[]
}

const GRADE12_PHYSICS: G12ChapterDef[] = [
  {
    unit: 'Electrostatics', name: 'Electric Charges & Fields', difficulty: 'Medium',
    subtopics: ['L1: Electric Charges & Conservation of Charge', 'L2: Coulomb\'s Law & Superposition', 'L3: Electric Field & Field Lines', 'L4: Electric Flux & Gauss\'s Theorem', 'L5: Applications of Gauss\'s Law (Sphere, Cylinder, Plane)', 'L6: Electric Dipole & Field due to Dipole'],
  },
  {
    unit: 'Electrostatics', name: 'Electrostatic Potential & Capacitance', difficulty: 'Hard',
    subtopics: ['L1: Electric Potential & Potential Difference', 'L2: Potential due to Point Charge & Dipole', 'L3: Equipotential Surfaces', 'L4: Capacitors & Capacitance', 'L5: Parallel Plate Capacitor', 'L6: Dielectrics & Polarisation', 'L7: Energy Stored in a Capacitor', 'L8: Combination of Capacitors', 'L9: Van de Graaff Generator'],
  },
  {
    unit: 'Current Electricity', name: 'Current Electricity', difficulty: 'Medium',
    subtopics: ['L1: Electric Current & Drift Velocity', 'L2: Ohm\'s Law & Resistance', 'L3: Resistivity & Conductivity', 'L4: Temperature Dependence of Resistance', 'L5: Electrical Energy & Power', 'L6: Kirchhoff\'s Laws (KCL & KVL)', 'L7: Wheatstone Bridge & Meter Bridge', 'L8: Potentiometer & Its Applications', 'L9: Internal Resistance of a Cell & Cells in Combination'],
  },
  {
    unit: 'Magnetism', name: 'Moving Charges & Magnetism', difficulty: 'Hard',
    subtopics: ['L1: Biot-Savart Law & Applications', 'L2: Ampere\'s Circuital Law', 'L3: Force on a Moving Charge (Lorentz Force)', 'L4: Motion of Charged Particle in Magnetic Field', 'L5: Force on Current-Carrying Conductor', 'L6: Force between Parallel Conductors & Definition of Ampere', 'L7: Torque on Current Loop & Magnetic Dipole', 'L8: Moving Coil Galvanometer, Ammeter & Voltmeter'],
  },
  {
    unit: 'Magnetism', name: 'Magnetism & Matter', difficulty: 'Easy',
    subtopics: ['L1: Bar Magnet as Magnetic Dipole & Field Lines', 'L2: Earth\'s Magnetic Field & Magnetic Elements', 'L3: Dia-, Para- & Ferromagnetic Materials', 'L4: Hysteresis & Permanent Magnets'],
  },
  {
    unit: 'Electromagnetic Induction', name: 'Electromagnetic Induction', difficulty: 'Hard',
    subtopics: ['L1: Magnetic Flux & Faraday\'s Laws', 'L2: Lenz\'s Law & Conservation of Energy', 'L3: Motional EMF', 'L4: Self-Inductance & Inductors', 'L5: Mutual Inductance', 'L6: AC Generator'],
  },
  {
    unit: 'Electromagnetic Induction', name: 'Alternating Current', difficulty: 'Hard',
    subtopics: ['L1: AC Voltage & RMS Values', 'L2: AC through Resistor, Inductor & Capacitor', 'L3: LCR Series Circuit & Phasor Diagram', 'L4: Resonance in LCR Circuit', 'L5: Power in AC Circuit & Power Factor', 'L6: LC Oscillations', 'L7: Transformers'],
  },
  {
    unit: 'Electromagnetic Waves', name: 'Electromagnetic Waves', difficulty: 'Easy',
    subtopics: ['L1: Displacement Current & Maxwell\'s Equations', 'L2: Electromagnetic Waves & Their Properties', 'L3: Electromagnetic Spectrum (Radio → Gamma)'],
  },
  {
    unit: 'Optics', name: 'Ray Optics & Optical Instruments', difficulty: 'Medium',
    subtopics: ['L1: Reflection at Spherical Mirrors & Mirror Formula', 'L2: Refraction at Plane Surfaces & Snell\'s Law', 'L3: Total Internal Reflection & Optical Fibre', 'L4: Refraction at Spherical Surfaces & Lens Formula', 'L5: Power of Lens & Lens Maker\'s Formula', 'L6: Prism & Dispersion of Light', 'L7: Scattering of Light', 'L8: Human Eye & Defects of Vision', 'L9: Microscope (Simple & Compound)', 'L10: Telescope (Refracting & Reflecting)'],
  },
  {
    unit: 'Optics', name: 'Wave Optics', difficulty: 'Hard',
    subtopics: ['L1: Huygens\' Principle & Refraction/Reflection', 'L2: Coherent Sources & Interference', 'L3: Young\'s Double Slit Experiment (YDSE)', 'L4: Fringe Width & Conditions', 'L5: Diffraction at Single Slit', 'L6: Resolving Power of Optical Instruments', 'L7: Polarisation & Malus\' Law'],
  },
  {
    unit: 'Modern Physics', name: 'Dual Nature of Radiation & Matter', difficulty: 'Medium',
    subtopics: ['L1: Photoelectric Effect & Experimental Setup', 'L2: Einstein\'s Photoelectric Equation', 'L3: Threshold Frequency & Work Function', 'L4: De Broglie Wavelength & Matter Waves', 'L5: Davisson-Germer Experiment'],
  },
  {
    unit: 'Modern Physics', name: 'Atoms', difficulty: 'Medium',
    subtopics: ['L1: Alpha Particle Scattering & Rutherford\'s Model', 'L2: Bohr\'s Model & Postulates', 'L3: Energy Levels & Hydrogen Spectrum', 'L4: Spectral Series (Lyman, Balmer, Paschen)'],
  },
  {
    unit: 'Modern Physics', name: 'Nuclei', difficulty: 'Medium',
    subtopics: ['L1: Composition of Nucleus & Nuclear Forces', 'L2: Mass Defect & Binding Energy', 'L3: Radioactivity: Alpha, Beta & Gamma Decay', 'L4: Half-Life & Radioactive Decay Law', 'L5: Nuclear Fission & Chain Reaction', 'L6: Nuclear Fusion & Nuclear Reactor'],
  },
  {
    unit: 'Modern Physics', name: 'Semiconductor Devices', difficulty: 'Medium',
    subtopics: ['L1: Energy Bands in Solids (Conductor, Insulator, Semiconductor)', 'L2: Intrinsic & Extrinsic Semiconductors (n-type, p-type)', 'L3: p-n Junction Diode & I-V Characteristics', 'L4: Rectifiers (Half-Wave & Full-Wave)', 'L5: Zener Diode & Voltage Regulation', 'L6: Junction Transistor (NPN & PNP)', 'L7: Transistor as Amplifier & Oscillator', 'L8: Logic Gates (AND, OR, NOT, NAND, NOR, XOR)'],
  },
]

const GRADE12_CHEMISTRY: G12ChapterDef[] = [
  {
    unit: 'Physical Chemistry', name: 'Solid State', difficulty: 'Medium',
    subtopics: ['L1: Types of Solids (Ionic, Molecular, Covalent, Metallic)', 'L2: Crystal Lattice & Unit Cell (SC, BCC, FCC)', 'L3: Packing in Solids & Packing Efficiency', 'L4: Density of Unit Cell', 'L5: Point Defects (Frenkel & Schottky)', 'L6: Electrical & Magnetic Properties of Solids'],
  },
  {
    unit: 'Physical Chemistry', name: 'Solutions', difficulty: 'Medium',
    subtopics: ['L1: Types of Solutions & Concentration Terms (Molarity, Molality, Mole Fraction)', 'L2: Vapour Pressure of Solutions & Raoult\'s Law', 'L3: Ideal & Non-Ideal Solutions, Azeotropes', 'L4: Elevation of Boiling Point (ΔTb)', 'L5: Depression in Freezing Point (ΔTf)', 'L6: Osmotic Pressure & Osmosis', 'L7: Van\'t Hoff Factor & Abnormal Molecular Mass'],
  },
  {
    unit: 'Physical Chemistry', name: 'Electrochemistry', difficulty: 'Hard',
    subtopics: ['L1: Electrochemical Cells & Electrode Potentials', 'L2: Standard Electrode Potential & EMF of Cell', 'L3: Nernst Equation & Its Applications', 'L4: Relationship between ΔG, EMF & Equilibrium Constant', 'L5: Electrolysis & Faraday\'s Laws of Electrolysis', 'L6: Electrolytic Conductance & Kohlrausch\'s Law', 'L7: Batteries (Primary & Secondary)', 'L8: Fuel Cells & Corrosion'],
  },
  {
    unit: 'Physical Chemistry', name: 'Chemical Kinetics', difficulty: 'Hard',
    subtopics: ['L1: Rate of Reaction & Rate Law Expression', 'L2: Order & Molecularity of Reactions', 'L3: Integrated Rate Law (Zero & First Order)', 'L4: Half-Life of Reactions', 'L5: Arrhenius Equation & Activation Energy', 'L6: Collision Theory of Chemical Reactions'],
  },
  {
    unit: 'Physical Chemistry', name: 'Surface Chemistry', difficulty: 'Easy',
    subtopics: ['L1: Adsorption vs Absorption & Freundlich Isotherm', 'L2: Catalysis (Homogeneous, Heterogeneous & Enzyme)', 'L3: Colloids: Classification & Properties', 'L4: Emulsions & Tyndall Effect', 'L5: Coagulation of Colloids'],
  },
  {
    unit: 'Inorganic Chemistry', name: 'General Principles of Isolation of Elements', difficulty: 'Easy',
    subtopics: ['L1: Occurrence of Metals & Concentration Methods', 'L2: Thermodynamic Principles (Ellingham Diagram)', 'L3: Electrochemical Principles of Metallurgy', 'L4: Refining Methods (Distillation, Zone Refining, etc.)'],
  },
  {
    unit: 'Inorganic Chemistry', name: 'p-Block Elements (Group 15, 16, 17, 18)', difficulty: 'Hard',
    subtopics: ['L1: Group 15 — Nitrogen Family: Properties & Trends', 'L2: Ammonia (NH3) — Structure, Preparation & Uses', 'L3: Nitric Acid (HNO3) — Preparation & Properties', 'L4: Group 16 — Oxygen Family: Properties & Trends', 'L5: Sulphur Dioxide (SO2) & Sulphur Trioxide (SO3)', 'L6: Sulphuric Acid (H2SO4) — Contact Process & Uses', 'L7: Group 17 — Halogens: Properties & Trends', 'L8: Hydrogen Chloride (HCl) & Interhalogen Compounds', 'L9: Group 18 — Noble Gases: Properties & Uses'],
  },
  {
    unit: 'Inorganic Chemistry', name: 'd & f-Block Elements', difficulty: 'Medium',
    subtopics: ['L1: Transition Metals: Electronic Configuration & General Properties', 'L2: Variation of Properties (Ionisation Energy, Oxidation States, Colour)', 'L3: KMnO4 — Properties & Uses', 'L4: K2Cr2O7 — Properties & Uses', 'L5: Lanthanoids: Properties & Lanthanoid Contraction', 'L6: Actinoids: Properties & Comparison with Lanthanoids'],
  },
  {
    unit: 'Inorganic Chemistry', name: 'Coordination Compounds', difficulty: 'Hard',
    subtopics: ['L1: Coordination Entities: Ligands & Central Metal', 'L2: IUPAC Nomenclature of Coordination Compounds', 'L3: Werner\'s Theory & Effective Atomic Number', 'L4: Valence Bond Theory (VBT)', 'L5: Crystal Field Theory (CFT) & CFSE', 'L6: Isomerism (Structural & Stereoisomerism)', 'L7: Stability of Coordination Compounds', 'L8: Importance in Biological & Industrial Applications'],
  },
  {
    unit: 'Organic Chemistry', name: 'Haloalkanes & Haloarenes', difficulty: 'Medium',
    subtopics: ['L1: Nomenclature & Nature of C-X Bond', 'L2: Methods of Preparation of Haloalkanes', 'L3: Physical Properties of Haloalkanes', 'L4: SN1 & SN2 Mechanisms', 'L5: E1 & E2 Elimination Reactions', 'L6: Haloarenes: Preparation & Properties', 'L7: Polyhalogen Compounds & Uses (DDT, BHC)'],
  },
  {
    unit: 'Organic Chemistry', name: 'Alcohols, Phenols & Ethers', difficulty: 'Medium',
    subtopics: ['L1: Nomenclature & Classification of Alcohols', 'L2: Methods of Preparation of Alcohols', 'L3: Physical & Chemical Properties of Alcohols', 'L4: Reactions of Alcohols (Esterification, Oxidation, Dehydration)', 'L5: Phenols: Preparation & Properties', 'L6: Chemical Reactions of Phenols (Electrophilic Substitution)', 'L7: Ethers: Preparation, Properties & Reactions'],
  },
  {
    unit: 'Organic Chemistry', name: 'Aldehydes, Ketones & Carboxylic Acids', difficulty: 'Hard',
    subtopics: ['L1: Nomenclature & Structure of Carbonyl Compounds', 'L2: Methods of Preparation of Aldehydes & Ketones', 'L3: Nucleophilic Addition Reactions', 'L4: Aldol Condensation & Cannizzaro Reaction', 'L5: Clemmensen & Wolff-Kishner Reduction', 'L6: Oxidation Reactions of Aldehydes', 'L7: Carboxylic Acids: Nomenclature & Preparation', 'L8: Properties & Reactions of Carboxylic Acids', 'L9: Acid Derivatives (Anhydride, Ester, Amide)'],
  },
  {
    unit: 'Organic Chemistry', name: 'Amines', difficulty: 'Medium',
    subtopics: ['L1: Nomenclature & Classification of Amines', 'L2: Methods of Preparation of Amines', 'L3: Physical & Chemical Properties of Amines', 'L4: Diazonium Salts & Coupling Reactions', 'L5: Cyanides & Isocyanides'],
  },
  {
    unit: 'Organic Chemistry', name: 'Biomolecules', difficulty: 'Easy',
    subtopics: ['L1: Carbohydrates: Monosaccharides (Glucose, Fructose)', 'L2: Disaccharides & Polysaccharides', 'L3: Proteins & Amino Acids: Structure', 'L4: Peptide Bond & Structure of Proteins', 'L5: Enzymes & Their Functions', 'L6: Nucleic Acids: DNA & RNA Structure', 'L7: Vitamins & Hormones'],
  },
  {
    unit: 'Organic Chemistry', name: 'Polymers', difficulty: 'Easy',
    subtopics: ['L1: Classification of Polymers (Addition, Condensation, Copolymer)', 'L2: Natural Rubber & Vulcanisation', 'L3: Synthetic Fibres (Nylon, Dacron, Orlon)', 'L4: Thermoplastics & Thermosetting Polymers', 'L5: Biodegradable & Non-Biodegradable Polymers'],
  },
  {
    unit: 'Organic Chemistry', name: 'Chemistry in Everyday Life', difficulty: 'Easy',
    subtopics: ['L1: Drugs & Medicines: Drug-Receptor Interaction', 'L2: Analgesics, Tranquilisers & Antibiotics', 'L3: Antacids, Antihistamines & Antiseptics', 'L4: Food Additives (Antioxidants, Preservatives, Artificial Sweeteners)', 'L5: Cleansing Agents: Soaps & Detergents'],
  },
]

const GRADE12_MATHS: G12ChapterDef[] = [
  {
    unit: 'Algebra', name: 'Relations & Functions', difficulty: 'Easy',
    subtopics: ['L1: Types of Relations (Reflexive, Symmetric, Transitive, Equivalence)', 'L2: Types of Functions (One-One, Onto, Bijective)', 'L3: Composition of Functions', 'L4: Invertible Functions & Inverse', 'L5: Binary Operations'],
  },
  {
    unit: 'Algebra', name: 'Inverse Trigonometric Functions', difficulty: 'Medium',
    subtopics: ['L1: Domain, Range & Principal Values', 'L2: Properties of Inverse Trig Functions', 'L3: Simplification using Identities', 'L4: Equations involving Inverse Trig Functions'],
  },
  {
    unit: 'Algebra', name: 'Matrices', difficulty: 'Easy',
    subtopics: ['L1: Types of Matrices & Basic Operations', 'L2: Multiplication of Matrices', 'L3: Transpose, Symmetric & Skew-Symmetric Matrices', 'L4: Adjoint & Inverse of a Matrix', 'L5: Elementary Row & Column Operations'],
  },
  {
    unit: 'Algebra', name: 'Determinants', difficulty: 'Medium',
    subtopics: ['L1: Determinant of a 2×2 & 3×3 Matrix', 'L2: Properties of Determinants', 'L3: Expansion along Row/Column & Cofactors', 'L4: Area of Triangle using Determinants', 'L5: Adjoint & Inverse using Determinants', 'L6: Solution of System of Linear Equations (Cramer\'s Rule)'],
  },
  {
    unit: 'Calculus', name: 'Continuity & Differentiability', difficulty: 'Hard',
    subtopics: ['L1: Continuity of Functions at a Point & on an Interval', 'L2: Differentiability & Relation to Continuity', 'L3: Derivatives of Composite Functions (Chain Rule)', 'L4: Derivatives of Implicit Functions', 'L5: Logarithmic Differentiation', 'L6: Parametric Differentiation', 'L7: Derivatives of Exponential & Logarithmic Functions', 'L8: Second Order Derivatives', 'L9: Rolle\'s Theorem & Mean Value Theorem'],
  },
  {
    unit: 'Calculus', name: 'Applications of Derivatives', difficulty: 'Hard',
    subtopics: ['L1: Rate of Change of Quantities', 'L2: Increasing & Decreasing Functions', 'L3: Tangents & Normals to Curves', 'L4: Approximations using Derivatives', 'L5: Maxima & Minima (First Derivative Test)', 'L6: Maxima & Minima (Second Derivative Test)', 'L7: Absolute Maxima & Minima on a Closed Interval'],
  },
  {
    unit: 'Calculus', name: 'Integrals', difficulty: 'Hard',
    subtopics: ['L1: Integration as Reverse of Differentiation', 'L2: Integration by Substitution', 'L3: Integration using Trigonometric Identities', 'L4: Partial Fractions', 'L5: Integration by Parts', 'L6: Special Integrals (√(a²-x²), √(x²±a²))', 'L7: Definite Integrals & Fundamental Theorem', 'L8: Properties of Definite Integrals (King Property, etc.)'],
  },
  {
    unit: 'Calculus', name: 'Applications of Integrals', difficulty: 'Medium',
    subtopics: ['L1: Area under a Curve (Definite Integral Method)', 'L2: Area between Two Curves', 'L3: Area of Standard Curves (Parabola, Circle, Ellipse)'],
  },
  {
    unit: 'Calculus', name: 'Differential Equations', difficulty: 'Hard',
    subtopics: ['L1: Order & Degree of a Differential Equation', 'L2: General & Particular Solutions', 'L3: Variable Separable Method', 'L4: Homogeneous Differential Equations', 'L5: Linear Differential Equations (Integrating Factor Method)', 'L6: Applications (Growth & Decay, Newton\'s Cooling Law)'],
  },
  {
    unit: 'Vectors & 3D', name: 'Vectors', difficulty: 'Medium',
    subtopics: ['L1: Types of Vectors & Algebra (Addition, Subtraction)', 'L2: Position Vector & Section Formula', 'L3: Dot Product (Scalar Product) & Applications', 'L4: Cross Product (Vector Product) & Applications', 'L5: Scalar Triple Product & Volume of Parallelepiped', 'L6: Vector Triple Product'],
  },
  {
    unit: 'Vectors & 3D', name: 'Three Dimensional Geometry', difficulty: 'Hard',
    subtopics: ['L1: Direction Cosines & Direction Ratios', 'L2: Equation of a Line in Space (Vector & Cartesian)', 'L3: Angle between Two Lines & Skew Lines', 'L4: Shortest Distance between Two Skew Lines', 'L5: Equation of a Plane (Vector & Cartesian)', 'L6: Angle between Two Planes & Line-Plane', 'L7: Distance of a Point from a Plane', 'L8: Angle between Line and Plane'],
  },
  {
    unit: 'Linear Programming', name: 'Linear Programming', difficulty: 'Easy',
    subtopics: ['L1: Introduction to LPP & Terminology', 'L2: Formulation of Linear Programming Problem', 'L3: Graphical Method (Feasible Region)', 'L4: Corner Point Method & Optimal Solution', 'L5: Different Types of LPP (Bounded & Unbounded)'],
  },
  {
    unit: 'Probability', name: 'Probability (Advanced)', difficulty: 'Hard',
    subtopics: ['L1: Conditional Probability & Multiplication Theorem', 'L2: Independent Events', 'L3: Bayes\' Theorem & Applications', 'L4: Random Variables & Probability Distribution', 'L5: Mean & Variance of Random Variables', 'L6: Bernoulli Trials & Binomial Distribution'],
  },
]

const buildGrade12Chapters = (): Chapter[] => {
  const all: { sub: Subject; defs: G12ChapterDef[] }[] = [
    { sub: 'Physics', defs: GRADE12_PHYSICS },
    { sub: 'Chemistry', defs: GRADE12_CHEMISTRY },
    { sub: 'Mathematics', defs: GRADE12_MATHS },
  ]

  const chapters: Chapter[] = []
  let idx = 0
  all.forEach(({ sub, defs }) => {
    defs.forEach(def => {
      chapters.push({
        id: `g12-${idx++}`,
        subject: sub,
        unit: def.unit,
        name: def.name,
        grade: 12,
        theory: 0,
        pyqs: 0,
        mockAccuracy: 0,
        revisionCount: 0,
        confidence: 0,
        mastery: 'Not Started',
        lastStudied: null,
        nextRevision: null,
        difficulty: def.difficulty,
        subtopics: def.subtopics,
        completedSubtopics: [],
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
  chapters: [...generateGrade11Chapters(), ...buildGrade12Chapters()],
  updateChapter: (id, updates) => set((s) => ({
    chapters: s.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  toggleSubtopic: (chapterId, subtopic) => set((s) => ({
    chapters: s.chapters.map(c => {
      if (c.id !== chapterId) return c
      const completed = c.completedSubtopics.includes(subtopic)
        ? c.completedSubtopics.filter(st => st !== subtopic)
        : [...c.completedSubtopics, subtopic]
      const pct = c.subtopics.length > 0 ? Math.round((completed.length / c.subtopics.length) * 100) : 0
      return { ...c, completedSubtopics: completed, theory: pct }
    })
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
