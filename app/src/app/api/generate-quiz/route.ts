import Groq from "groq-sdk"
import { NextRequest, NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ questions: [] })
  }

  try {
    const { transcript, subject, count = 3 } = await req.json()

    const prompt = `Based on the following educational transcript, generate exactly ${count} multiple-choice questions to test comprehension.

Subject: ${subject}
Transcript: "${transcript}"

Return ONLY a valid JSON array. Each object must have exactly:
- "q": question string
- "options": array of exactly 4 strings
- "answer": number (0-3) indicating the correct option index

Example format:
[{"q": "What is photosynthesis?", "options": ["Process A", "Process B", "Process C", "Process D"], "answer": 0}]

Return ONLY the JSON array, no other text.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const text = completion.choices[0]?.message?.content?.trim() || ""
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const questions = jsonMatch ? JSON.parse(jsonMatch[0]).slice(0, count) : []

    return NextResponse.json({ questions })
  } catch {
    return NextResponse.json({ questions: [] })
  }
}
