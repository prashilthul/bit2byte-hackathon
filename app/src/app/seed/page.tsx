"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, writeBatch } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/context/ToastContext"
import { Calculator, FlaskConical, Cpu, Cog, Sparkles } from "lucide-react"

function getDb() {
  if (!db) throw new Error("Firestore not initialized")
  return db
}

const SUBJECTS = [
  {
    id: "math",
    name: "Mathematics",
    icon: "math",
  },
  {
    id: "science",
    name: "Science",
    icon: "science",
  },
  {
    id: "technology",
    name: "Technology",
    icon: "technology",
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "engineering",
  },
]

export default function SeedPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [seeding, setSeeding] = useState(false)
  const [done, setDone] = useState(false)
  const [log, setLog] = useState<string[]>([])

  if (authLoading) return null
  if (!user) {
    router.replace("/login")
    return null
  }

  const addLog = (msg: string) => setLog((prev) => [...prev, msg])

  const handleSeed = async () => {
    setSeeding(true)
    setLog([])

    try {
      const batch = writeBatch(getDb())

      // ─── Subjects (single doc per subject, grades array) ───
      for (const s of SUBJECTS) {
        batch.set(doc(getDb(), "subjects", s.id), {
          name: s.name,
          grades: [6, 7, 8, 9, 10, 11, 12],
          icon: s.icon,
        })
        addLog(`✅ Subject: ${s.name} (grades 6–12)`)
      }

      // ─── Mathematics — Materials ───
      batch.set(doc(getDb(), "studyMaterial", "math-intro"), {
        subjectId: "math",
        title: "Introduction to Algebra",
        grade: 8,
        order: 1,
        content: `## What is Algebra?

Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in equations and formulas.

## Key Concepts

- **Variables**: Symbols (like $x$ or $y$) that represent unknown values
- **Constants**: Fixed values that don't change
- **Expressions**: Combinations of variables, constants, and operations
- **Equations**: Statements that two expressions are equal

## Solving Linear Equations

To solve $x + 5 = 12$, subtract 5 from both sides:

$$x + 5 - 5 = 12 - 5$$

$$x = 7$$

## Real-World Applications

Algebra is used everywhere — from calculating travel time to determining loan interest. It's the foundation for advanced math, science, and engineering.

> "Algebra is the language through which most of mathematics is communicated."`,
      })
      addLog("✅ Material: Introduction to Algebra")

      batch.set(doc(getDb(), "studyMaterial", "math-geometry"), {
        subjectId: "math",
        title: "Basics of Geometry",
        grade: 8,
        order: 2,
        content: `## What is Geometry?

Geometry is the branch of mathematics concerned with the properties and relations of points, lines, surfaces, and solids.

## Basic Shapes

- **Triangle**: 3 sides, sum of angles = $180^\\circ$
- **Square**: 4 equal sides, 4 right angles
- **Rectangle**: Opposite sides equal, 4 right angles
- **Circle**: Set of points equidistant from a center

## Area Formulas

Rectangle: $A = l \\times w$

Triangle: $A = \\frac{1}{2} \\times b \\times h$

Circle: $A = \\pi r^2$

## Why It Matters

Geometry helps us understand the physical world — from architecture to engineering to art.`,
      })
      addLog("✅ Material: Basics of Geometry")

      // ─── Mathematics — Quizzes ───
      batch.set(doc(getDb(), "quizzes", "math-quiz-1"), {
        subjectId: "math",
        title: "Algebra Basics",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What is the value of x in $x + 7 = 15$?", options: ["7", "8", "22", "15"], answer: 1 },
          { q: "Which of the following is a variable?", options: ["5", "x", "10", "100"], answer: 1 },
          { q: "Simplify: $3x + 2x$", options: ["5x", "6x", "$5x^2$", "x"], answer: 0 },
          { q: "What does = mean in an equation?", options: ["Greater than", "Both sides equal", "Lesser than", "Not related"], answer: 1 },
          { q: "If $y = 2x + 1$ and $x = 3$, find y", options: ["5", "6", "7", "8"], answer: 2 },
        ],
      })
      addLog("✅ Quiz: Algebra Basics (10 XP)")

      batch.set(doc(getDb(), "quizzes", "math-quiz-2"), {
        subjectId: "math",
        title: "Geometry Challenge",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "How many sides does a hexagon have?", options: ["4", "5", "6", "8"], answer: 2 },
          { q: "What is the area of a rectangle with length 5 and width 3?", options: ["8", "15", "16", "10"], answer: 1 },
          { q: "What is $\\pi$ approximately equal to?", options: ["2.14", "3.14", "4.14", "1.14"], answer: 1 },
          { q: "A triangle has angles 90°, 45°, and what?", options: ["30°", "45°", "60°", "90°"], answer: 1 },
          { q: "What shape has no corners?", options: ["Square", "Triangle", "Circle", "Rectangle"], answer: 2 },
        ],
      })
      addLog("✅ Quiz: Geometry Challenge (15 XP)")

      // ─── Math — More Materials ───
      batch.set(doc(getDb(), "studyMaterial", "math-stats"), {
        subjectId: "math",
        title: "Introduction to Statistics",
        grade: 8,
        order: 3,
        content: `## What are Statistics?

Statistics is the science of collecting, analyzing, and interpreting data.

## Key Terms

- **Mean**: The average of a set of numbers
- **Median**: The middle value when data is sorted
- **Mode**: The most frequent value
- **Range**: The difference between the highest and lowest values

## Example

For the data set: 2, 3, 5, 7, 8

Mean = (2 + 3 + 5 + 7 + 8) / 5 = 25 / 5 = 5

Median = 5 (the middle number)

## Why Statistics Matter

Statistics help us make sense of the world — from sports analytics to scientific research to business decisions.`,
      })
      addLog("✅ Material: Introduction to Statistics")

      batch.set(doc(getDb(), "studyMaterial", "math-fractions"), {
        subjectId: "math",
        title: "Fractions & Decimals",
        grade: 8,
        order: 4,
        content: `## Fractions & Decimals

Fractions and decimals are two ways to represent parts of a whole.

## Converting Between Them

To convert a fraction to a decimal, divide the numerator by the denominator:

$$\\frac{3}{4} = 3 \\div 4 = 0.75$$

To convert a decimal to a fraction, write it over a power of 10:

$$0.625 = \\frac{625}{1000} = \\frac{5}{8}$$

## Operations with Fractions

- **Addition**: $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$
- **Multiplication**: $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$
- **Division**: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$

## Real-World Use

Cooking, shopping discounts, and measurements all rely on fractions and decimals.`,
      })
      addLog("✅ Material: Fractions & Decimals")

      // ─── Math — More Quizzes ───
      batch.set(doc(getDb(), "quizzes", "math-quiz-3"), {
        subjectId: "math",
        title: "Statistics & Data",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What is the mean of 4, 8, 12?", options: ["6", "8", "10", "12"], answer: 1 },
          { q: "What is the median of 3, 7, 9, 12, 15?", options: ["7", "9", "12", "3"], answer: 1 },
          { q: "What does range measure?", options: ["Middle value", "Spread of data", "Average", "Most frequent"], answer: 1 },
          { q: "In a data set, what is the mode?", options: ["The average", "The middle", "The most frequent", "The difference"], answer: 2 },
          { q: "Find the range: 2, 5, 9, 14", options: ["7", "12", "9", "5"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Statistics & Data (10 XP)")

      batch.set(doc(getDb(), "quizzes", "math-quiz-4"), {
        subjectId: "math",
        title: "Fractions Mastery",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "What is $\\\\frac{1}{2} + \\\\frac{1}{4}$?", options: ["$\\\\frac{2}{6}$", "$\\\\frac{3}{4}$", "$\\\\frac{1}{6}$", "$\\\\frac{2}{4}$"], answer: 1 },
          { q: "What is 0.5 as a fraction?", options: ["$\\\\frac{1}{5}$", "$\\\\frac{1}{4}$", "$\\\\frac{1}{2}$", "$\\\\frac{2}{5}$"], answer: 2 },
          { q: "What is $\\\\frac{3}{5} \\\\times \\\\frac{2}{3}$?", options: ["$\\\\frac{6}{15}$", "$\\\\frac{2}{5}$", "$\\\\frac{5}{8}$", "$\\\\frac{1}{2}$"], answer: 1 },
          { q: "What is $\\\\frac{2}{3}$ as a decimal?", options: ["0.5", "0.666...", "0.75", "0.8"], answer: 1 },
          { q: "What is $\\\\frac{1}{4} \\\\div \\\\frac{1}{2}$?", options: ["$\\\\frac{1}{2}$", "$\\\\frac{1}{8}$", "$\\\\frac{3}{4}$", "$\\\\frac{2}{4}$"], answer: 0 },
        ],
      })
      addLog("✅ Quiz: Fractions Mastery (15 XP)")

      // ─── Science — Materials ───
      batch.set(doc(getDb(), "studyMaterial", "science-photosynthesis"), {
        subjectId: "science",
        title: "Introduction to Photosynthesis",
        grade: 8,
        order: 1,
        content: `## What is Photosynthesis?

Photosynthesis is the process by which green plants use sunlight to synthesize food from carbon dioxide and water.

## The Equation

$$6CO_2 + 6H_2O \\xrightarrow{ sunlight } C_6H_{12}O_6 + 6O_2$$

## Key Requirements

- **Sunlight**: The energy source
- **Chlorophyll**: Green pigment that captures light
- **Water**: Absorbed by roots
- **Carbon Dioxide**: Taken from air through leaves

## Stages

1. **Light-dependent reactions**: Sunlight → chemical energy
2. **Calvin cycle**: $CO_2$ → glucose

> Photosynthesis produces the oxygen we breathe and the food we eat.`,
      })
      addLog("✅ Material: Introduction to Photosynthesis")

      batch.set(doc(getDb(), "studyMaterial", "science-periodic"), {
        subjectId: "science",
        title: "The Periodic Table",
        grade: 8,
        order: 2,
        content: `## The Periodic Table

The periodic table organizes all known chemical elements by their atomic number and properties.

## Key Groups

- **Alkali metals** (Group 1): Highly reactive, e.g. Na, K
- **Noble gases** (Group 18): Unreactive, e.g. He, Ne
- **Halogens** (Group 17): Reactive non-metals, e.g. F, Cl

## Important Elements

- **Hydrogen (H)** — Atomic number 1
- **Oxygen (O)** — Atomic number 8
- **Carbon (C)** — Atomic number 6
- **Gold (Au)** — Atomic number 79

## Why It Matters

The periodic table is the foundation of chemistry. It helps predict how elements will react and bond.`,
      })
      addLog("✅ Material: The Periodic Table")

      // ─── Science — Quizzes ───
      batch.set(doc(getDb(), "quizzes", "science-quiz-1"), {
        subjectId: "science",
        title: "Photosynthesis Fundamentals",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What pigment captures light in plants?", options: ["Chlorophyll", "Carotene", "Xanthophyll", "Melanin"], answer: 0 },
          { q: "What are the main products of photosynthesis?", options: ["Water + O₂", "Glucose + O₂", "CO₂ + H₂O", "Glucose + CO₂"], answer: 1 },
          { q: "Where does photosynthesis occur?", options: ["Roots", "Stem", "Leaves", "Flowers"], answer: 2 },
          { q: "What gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 2 },
          { q: "Which is NOT required for photosynthesis?", options: ["Sunlight", "Water", "Soil", "CO₂"], answer: 2 },
        ],
      })
      addLog("✅ Quiz: Photosynthesis Fundamentals (10 XP)")

      batch.set(doc(getDb(), "quizzes", "science-quiz-2"), {
        subjectId: "science",
        title: "Elements & the Periodic Table",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "How are elements organized in the periodic table?", options: ["By weight", "By atomic number", "By color", "Alphabetically"], answer: 1 },
          { q: "What group are noble gases in?", options: ["Group 1", "Group 17", "Group 18", "Group 2"], answer: 2 },
          { q: "What is the atomic number of Oxygen?", options: ["6", "8", "10", "16"], answer: 1 },
          { q: "Which element is a noble gas?", options: ["Sodium", "Chlorine", "Helium", "Carbon"], answer: 2 },
          { q: "What makes alkali metals highly reactive?", options: ["One outer electron", "Full outer shell", "High density", "Magnetic properties"], answer: 0 },
        ],
      })
      addLog("✅ Quiz: Elements & Periodic Table (15 XP)")

      // ─── Science — More Materials ───
      batch.set(doc(getDb(), "studyMaterial", "science-human-body"), {
        subjectId: "science",
        title: "The Human Body Systems",
        grade: 8,
        order: 3,
        content: `## The Human Body

The human body is made up of several systems that work together to keep us alive.

## Major Systems

- **Circulatory System**: Heart and blood vessels — transports oxygen and nutrients
- **Respiratory System**: Lungs and airways — exchanges oxygen and carbon dioxide
- **Digestive System**: Stomach and intestines — breaks down food
- **Nervous System**: Brain and nerves — controls thoughts and movements

## Interesting Facts

- The human body has 206 bones
- The heart beats about 100,000 times per day
- Your skin is the largest organ, weighing about 8 pounds

## Why Learn About It?

Understanding your body helps you make healthy choices and appreciate the amazing machine you live in.`,
      })
      addLog("✅ Material: The Human Body Systems")

      batch.set(doc(getDb(), "studyMaterial", "science-energy"), {
        subjectId: "science",
        title: "Forms of Energy",
        grade: 8,
        order: 4,
        content: `## What is Energy?

Energy is the ability to do work. It comes in many forms and can change from one form to another.

## Types of Energy

- **Kinetic Energy**: Energy of motion ($KE = \\frac{1}{2}mv^2$)
- **Potential Energy**: Stored energy ($PE = mgh$)
- **Thermal Energy**: Heat energy
- **Chemical Energy**: Stored in chemical bonds
- **Electrical Energy**: Flow of electrons
- **Nuclear Energy**: Stored in atomic nuclei

## Law of Conservation of Energy

Energy cannot be created or destroyed — it only changes form.

## Examples

- A moving car has kinetic energy
- A stretched rubber band has elastic potential energy
- Food contains chemical energy`,
      })
      addLog("✅ Material: Forms of Energy")

      // ─── Science — More Quizzes ───
      batch.set(doc(getDb(), "quizzes", "science-quiz-3"), {
        subjectId: "science",
        title: "Human Body Basics",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "Which system transports blood?", options: ["Respiratory", "Circulatory", "Digestive", "Nervous"], answer: 1 },
          { q: "How many bones does an adult human have?", options: ["106", "206", "306", "160"], answer: 1 },
          { q: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Heart", "Skin"], answer: 3 },
          { q: "Which system controls thoughts and movements?", options: ["Circulatory", "Digestive", "Nervous", "Respiratory"], answer: 2 },
          { q: "What does the respiratory system exchange?", options: ["Blood and water", "Oxygen and CO₂", "Food and waste", "Heat and energy"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Human Body Basics (10 XP)")

      batch.set(doc(getDb(), "quizzes", "science-quiz-4"), {
        subjectId: "science",
        title: "Energy Forms",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "What is the formula for kinetic energy?", options: ["$mgh$", "$\\\\frac{1}{2}mv^2$", "$mc^2$", "$F=ma$"], answer: 1 },
          { q: "Energy cannot be created or destroyed. This is the law of...", options: ["Motion", "Conservation of Energy", "Thermodynamics", "Gravity"], answer: 1 },
          { q: "What type of energy does food contain?", options: ["Kinetic", "Nuclear", "Chemical", "Thermal"], answer: 2 },
          { q: "A stretched rubber band has what kind of energy?", options: ["Kinetic", "Elastic potential", "Nuclear", "Electrical"], answer: 1 },
          { q: "What type of energy is heat?", options: ["Kinetic", "Chemical", "Thermal", "Nuclear"], answer: 2 },
        ],
      })
      addLog("✅ Quiz: Energy Forms (15 XP)")

      // ─── Technology — Materials ───
      batch.set(doc(getDb(), "studyMaterial", "tech-intro"), {
        subjectId: "technology",
        title: "Introduction to Programming",
        grade: 8,
        order: 1,
        content: `## What is Programming?

Programming is telling a computer what to do by giving it instructions in a language it understands.

## Key Concepts

- **Variables**: Store data (numbers, text, etc.)
- **Loops**: Repeat actions multiple times
- **Conditionals**: Make decisions (if/else)
- **Functions**: Reusable blocks of code

## Hello World Example

In Python:
$$\\text{print("Hello, World!")}$$

In JavaScript:
$$\\text{console.log("Hello, World!")}$$

## Why Learn Programming?

Programming teaches logical thinking, problem-solving, and creativity. It's a superpower in the digital age.

> "Everybody in this country should learn to program a computer — it teaches you how to think." — Steve Jobs`,
      })
      addLog("✅ Material: Introduction to Programming")

      batch.set(doc(getDb(), "studyMaterial", "tech-internet"), {
        subjectId: "technology",
        title: "How the Internet Works",
        grade: 8,
        order: 2,
        content: `## How the Internet Works

The internet is a global network of computers connected by cables, Wi-Fi, and satellites.

## Key Parts

- **Servers**: Computers that store websites and data
- **Clients**: Your phone, laptop, or tablet
- **Routers**: Direct traffic between networks
- **DNS**: Translates domain names (like google.com) to IP addresses

## How Data Travels

When you visit a website:
1. Your browser sends a request
2. It travels through routers
3. The server responds with data
4. Your browser renders the page

## The Physical Side

Undersea cables span the oceans, connecting continents. The internet is literally a network of wires!`,
      })
      addLog("✅ Material: How the Internet Works")

      // ─── Technology — Quizzes ───
      batch.set(doc(getDb(), "quizzes", "tech-quiz-1"), {
        subjectId: "technology",
        title: "Programming Basics",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Core Processing Unit"], answer: 1 },
          { q: "What is a variable used for?", options: ["Storing data", "Printing text", "Connecting to internet", "Drawing shapes"], answer: 0 },
          { q: "Which of these is a loop?", options: ["if", "for", "function", "variable"], answer: 1 },
          { q: "What does HTML stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "HyperTransfer Markup Language"], answer: 0 },
          { q: "What is an algorithm?", options: ["A type of computer", "A step-by-step solution", "A programming language", "A web browser"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Programming Basics (10 XP)")

      batch.set(doc(getDb(), "quizzes", "tech-quiz-2"), {
        subjectId: "technology",
        title: "Internet & Networks",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "What does DNS stand for?", options: ["Domain Name System", "Digital Network Service", "Data Network Security", "Domain Network Server"], answer: 0 },
          { q: "What does a router do?", options: ["Stores websites", "Directs network traffic", "Displays web pages", "Connects to Wi-Fi only"], answer: 1 },
          { q: "What is an IP address?", options: ["A website name", "A unique device identifier", "A type of cable", "A programming language"], answer: 1 },
          { q: "Which protocol is used for web pages?", options: ["FTP", "SMTP", "HTTP", "TCP"], answer: 2 },
          { q: "What connects continents via the internet?", options: ["Satellites only", "Undersea cables", "Radio towers", "Wi-Fi hotspots"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Internet & Networks (15 XP)")

      // ─── Technology — More Materials ───
      batch.set(doc(getDb(), "studyMaterial", "tech-ai"), {
        subjectId: "technology",
        title: "Introduction to Artificial Intelligence",
        grade: 8,
        order: 3,
        content: `## What is Artificial Intelligence?

Artificial Intelligence (AI) is the ability of computers to perform tasks that normally require human intelligence.

## Types of AI

- **Narrow AI**: Designed for specific tasks (e.g. chess, voice assistants)
- **General AI**: Hypothetical AI that can perform any intellectual task (not yet achieved)
- **Machine Learning**: AI that learns from data without being explicitly programmed

## Everyday AI

- **Recommendation systems** (Netflix, YouTube)
- **Voice assistants** (Siri, Alexa)
- **Image recognition** (face unlock, photo tags)
- **Language translation** (Google Translate)

## Ethical Considerations

AI raises important questions about privacy, bias, and the future of work. Understanding AI helps us use it responsibly.`,
      })
      addLog("✅ Material: Introduction to AI")

      batch.set(doc(getDb(), "studyMaterial", "tech-cyber"), {
        subjectId: "technology",
        title: "Cybersecurity Basics",
        grade: 8,
        order: 4,
        content: `## What is Cybersecurity?

Cybersecurity is the practice of protecting computers, networks, and data from digital attacks.

## Common Threats

- **Phishing**: Fake emails that trick you into revealing information
- **Malware**: Malicious software that damages or steals data
- **Ransomware**: Malware that locks your files and demands payment
- **Password attacks**: Attempts to guess or steal your passwords

## How to Stay Safe

1. Use strong, unique passwords for each account
2. Enable two-factor authentication
3. Don't click suspicious links
4. Keep your software updated
5. Think before you share personal information online

## Why It Matters

Cybersecurity affects everyone. A single weak password can lead to identity theft or data loss.`,
      })
      addLog("✅ Material: Cybersecurity Basics")

      // ─── Technology — More Quizzes ───
      batch.set(doc(getDb(), "quizzes", "tech-quiz-3"), {
        subjectId: "technology",
        title: "AI Fundamentals",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What does AI stand for?", options: ["Automated Input", "Artificial Intelligence", "Advanced Integration", "Automatic Interface"], answer: 1 },
          { q: "What is Narrow AI?", options: ["AI for specific tasks", "General problem-solving AI", "A type of robot", "A programming language"], answer: 0 },
          { q: "Which of these is an example of AI?", options: ["Calculator", "Recommendation system", "Text editor", "Web browser"], answer: 1 },
          { q: "What is Machine Learning?", options: ["Learning to code", "AI that learns from data", "Using a keyboard", "Building computers"], answer: 1 },
          { q: "Which is an ethical concern with AI?", options: ["It costs too much", "Privacy and bias", "It runs on electricity", "It is too slow"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: AI Fundamentals (10 XP)")

      batch.set(doc(getDb(), "quizzes", "tech-quiz-4"), {
        subjectId: "technology",
        title: "Cybersecurity Awareness",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "What is phishing?", options: ["A computer virus", "A fake email to steal info", "A type of firewall", "A programming error"], answer: 1 },
          { q: "What is ransomware?", options: ["Free antivirus", "Malware that locks files", "A password manager", "A type of encryption"], answer: 1 },
          { q: "What is the best way to protect your accounts?", options: ["Same password everywhere", "Strong unique passwords", "No password at all", "Writing passwords on sticky notes"], answer: 1 },
          { q: "What does two-factor authentication add?", options: ["A second password", "An extra layer of security", "Faster login", "More storage"], answer: 1 },
          { q: "What should you do with suspicious links?", options: ["Click to check", "Ignore and don't click", "Share with friends", "Post online"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Cybersecurity Awareness (15 XP)")

      // ─── Engineering — Materials ───
      batch.set(doc(getDb(), "studyMaterial", "eng-structures"), {
        subjectId: "engineering",
        title: "Introduction to Structural Engineering",
        grade: 8,
        order: 1,
        content: `## What is Structural Engineering?

Structural engineering is about designing and building structures that can safely withstand forces.

## Key Forces

- **Compression**: Pushing force (squeezing)
- **Tension**: Pulling force (stretching)
- **Shear**: Sliding force (cutting)
- **Torsion**: Twisting force

## Famous Structures

- **Eiffel Tower**: Built from wrought iron, 300m tall
- **Golden Gate Bridge**: Suspension bridge, 1280m main span
- **Burj Khalifa**: World's tallest building, 828m

## Why It Matters

Every building, bridge, and dam you see was designed by engineers who understood forces and materials.

> "Engineers like to solve problems. If there are no problems readily available, they will create their own."`,
      })
      addLog("✅ Material: Introduction to Structural Engineering")

      batch.set(doc(getDb(), "studyMaterial", "eng-machines"), {
        subjectId: "engineering",
        title: "Simple Machines",
        grade: 8,
        order: 2,
        content: `## Simple Machines

Simple machines make work easier by changing the magnitude or direction of a force.

## The 6 Simple Machines

1. **Lever**: A rigid bar pivoting on a fulcrum
2. **Pulley**: A wheel with a rope to lift loads
3. **Inclined Plane**: A sloped surface
4. **Wedge**: Two inclined planes back-to-back
5. **Screw**: An inclined plane wrapped around a cylinder
6. **Wheel & Axle**: A wheel attached to a rod

## Mechanical Advantage

$$MA = \\frac{\\text{output force}}{\\text{input force}}$$

The greater the mechanical advantage, the easier the work.

## Real-World Applications

- Scissors use levers
- Flagpoles use pulleys
- Ramps use inclined planes
- Knives use wedges`,
      })
      addLog("✅ Material: Simple Machines")

      // ─── Engineering — Quizzes ───
      batch.set(doc(getDb(), "quizzes", "eng-quiz-1"), {
        subjectId: "engineering",
        title: "Structures & Forces",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "What type of force squeezes an object?", options: ["Tension", "Compression", "Shear", "Torsion"], answer: 1 },
          { q: "What is a suspension bridge known for?", options: ["Shortest span", "Using cables for support", "Being underwater", "Having no supports"], answer: 1 },
          { q: "What material is the Eiffel Tower made of?", options: ["Steel", "Wrought iron", "Concrete", "Aluminum"], answer: 1 },
          { q: "What force pulls an object apart?", options: ["Compression", "Shear", "Torsion", "Tension"], answer: 3 },
          { q: "Which is the world's tallest building?", options: ["Empire State", "Burj Khalifa", "Shanghai Tower", "CN Tower"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Structures & Forces (10 XP)")

      batch.set(doc(getDb(), "quizzes", "eng-quiz-2"), {
        subjectId: "engineering",
        title: "Simple Machines Quiz",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "How many simple machines are there?", options: ["4", "5", "6", "7"], answer: 2 },
          { q: "What simple machine is a knife?", options: ["Lever", "Pulley", "Wedge", "Screw"], answer: 2 },
          { q: "What does mechanical advantage measure?", options: ["Speed", "Force multiplication", "Weight", "Friction"], answer: 1 },
          { q: "What simple machine is a flagpole using?", options: ["Lever", "Pulley", "Inclined plane", "Wheel & axle"], answer: 1 },
          { q: "A screw is what type of simple machine?", options: ["Wedge", "Lever", "Inclined plane", "Pulley"], answer: 2 },
        ],
      })
      addLog("✅ Quiz: Simple Machines (15 XP)")

      // ─── Engineering — More Materials ───
      batch.set(doc(getDb(), "studyMaterial", "eng-bridges"), {
        subjectId: "engineering",
        title: "Types of Bridges",
        grade: 8,
        order: 3,
        content: `## Types of Bridges

Bridges are engineering marvels that connect places across obstacles like rivers, valleys, and roads.

## Main Types

- **Beam Bridge**: The simplest type — a horizontal beam supported at both ends. Best for short spans.
- **Arch Bridge**: Uses an arch shape to distribute weight. Strong and elegant.
- **Suspension Bridge**: Uses cables suspended from towers. Ideal for very long spans.
- **Truss Bridge**: Uses a framework of triangles. Strong and materials-efficient.

## Forces in Bridges

Bridges must handle:
- **Compression**: Pushing forces (top of beams, arches)
- **Tension**: Pulling forces (bottom of beams, cables)

## Famous Examples

- **Golden Gate Bridge** (San Francisco) — Suspension bridge, 1280m main span
- **Sydney Harbour Bridge** (Australia) — Steel arch bridge
- **Millau Viaduct** (France) — Tallest bridge in the world`,
      })
      addLog("✅ Material: Types of Bridges")

      batch.set(doc(getDb(), "studyMaterial", "eng-circuits"), {
        subjectId: "engineering",
        title: "Introduction to Electrical Circuits",
        grade: 8,
        order: 4,
        content: `## What is an Electrical Circuit?

An electrical circuit is a closed loop that allows electricity to flow and power devices.

## Basic Components

- **Battery**: Provides the voltage (push) for current to flow
- **Wire**: Conducts electricity between components
- **Resistor**: Limits the flow of current
- **Switch**: Opens or closes the circuit
- **Bulb/LED**: Converts electricity into light

## Ohm's Law

$$V = I \\times R$$

Where:
- $V$ = Voltage (volts)
- $I$ = Current (amperes)
- $R$ = Resistance (ohms)

## Series vs Parallel

- **Series circuit**: Components on one path — if one breaks, all stop
- **Parallel circuit**: Multiple paths — if one breaks, others still work

## Real-World Application

Every electronic device — from phones to cars — relies on circuits. Understanding circuits is the first step to electronics and robotics.`,
      })
      addLog("✅ Material: Introduction to Electrical Circuits")

      // ─── Engineering — More Quizzes ───
      batch.set(doc(getDb(), "quizzes", "eng-quiz-3"), {
        subjectId: "engineering",
        title: "Bridges & Structures",
        grade: 8,
        xpReward: 10,
        questions: [
          { q: "Which bridge type uses cables suspended from towers?", options: ["Beam", "Arch", "Suspension", "Truss"], answer: 2 },
          { q: "What force compresses the top of a bridge beam?", options: ["Tension", "Compression", "Shear", "Torsion"], answer: 1 },
          { q: "What shape makes truss bridges strong?", options: ["Circles", "Squares", "Triangles", "Hexagons"], answer: 2 },
          { q: "Which is the world's tallest bridge?", options: ["Golden Gate", "Millau Viaduct", "Sydney Harbour", "Brooklyn"], answer: 1 },
          { q: "Arch bridges transfer weight to...", options: ["Cables", "The abutments", "The towers", "The deck"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Bridges & Structures (10 XP)")

      batch.set(doc(getDb(), "quizzes", "eng-quiz-4"), {
        subjectId: "engineering",
        title: "Circuits & Electricity",
        grade: 8,
        xpReward: 15,
        questions: [
          { q: "What does a resistor do in a circuit?", options: ["Stores energy", "Limits current", "Produces light", "Connects wires"], answer: 1 },
          { q: "In Ohm's Law, what does $V$ stand for?", options: ["Velocity", "Voltage", "Volume", "Viscosity"], answer: 1 },
          { q: "What happens if one bulb breaks in a series circuit?", options: ["Others get brighter", "All bulbs stop", "Nothing changes", "Circuit shorts"], answer: 1 },
          { q: "What does a switch do?", options: ["Creates voltage", "Opens or closes the circuit", "Measures current", "Stores charge"], answer: 1 },
          { q: "Why are parallel circuits used in homes?", options: ["Cheaper", "Each device works independently", "Simpler to build", "Uses less wire"], answer: 1 },
        ],
      })
      addLog("✅ Quiz: Circuits & Electricity (15 XP)")

      await batch.commit()
      addLog("🎉 All STEM data seeded successfully — 4 subjects, 16 materials, 16 quizzes!")
      setDone(true)
      toast("Database seeded with STEM data!", "success")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast(msg, "error")
      addLog(`❌ Error: ${msg}`)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg bg-surface-card rounded-xl p-8 border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-[#9fe870]" />
            <FlaskConical className="w-6 h-6 text-[#38c8ff]" />
            <Cpu className="w-6 h-6 text-[#ff6b9d]" />
            <Cog className="w-6 h-6 text-[#ffd11a]" />
          </div>
          <CardTitle className="text-display-sm text-canvas-soft">
            Seed STEM Database
          </CardTitle>
          <p className="text-body-sm text-canvas-soft/50 mt-2">
            Populate Firestore with S, T, E, M subjects — each with materials and quizzes.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          {!done ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSeed}
              disabled={seeding}
              className="w-full cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {seeding ? "Seeding..." : "Add All STEM Data"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
                <p className="text-primary font-semibold">STEM data seeded!</p>
                <p className="text-caption text-primary/60 mt-1">
                  4 subjects, 16 materials, 16 quizzes
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-surface-elevated text-canvas-soft hover:bg-surface-card cursor-pointer"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {log.length > 0 && (
            <div className="rounded-xl bg-ink border border-primary/5 p-4 max-h-48 overflow-y-auto space-y-1">
              {log.map((entry, i) => (
                <p key={i} className="text-body-sm text-canvas-soft/70">
                  {entry}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
