import Groq from "groq-sdk"
import { NextRequest, NextResponse } from "next/server"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" })

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ questions: [], error: "GROQ_API_KEY is not set. Add it to your .env file." })
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
    if (!text) {
      return NextResponse.json({ questions: [], error: "Groq returned an empty response. Check your API key and quota." })
    }

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      const snippet = text.slice(0, 200)
      return NextResponse.json({ questions: [], error: `Failed to parse JSON from Groq response. Response started with: "${snippet}"` })
    }

    const questions = JSON.parse(jsonMatch[0]).slice(0, count)
    return NextResponse.json({ questions })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ questions: [], error: `Groq API error: ${message}` })
  }
}
