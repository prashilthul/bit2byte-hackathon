"use client"

const stats = [
  { value: 12, suffix: "+", label: "Subjects" },
  { value: 50, suffix: "+", label: "Quizzes" },
  { value: 1000, suffix: "+", label: "Students" },
  { value: 3, suffix: "", label: "Languages" },
]

export default function StatsSection() {
  return (
    <section className="band-dark px-6 py-20 md:py-28 relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="stats-headline text-display-md md:text-display-xl font-black text-primary">
            Growing every day
          </h2>
          <p className="mt-4 text-body-md text-canvas-soft/50 max-w-2xl mx-auto">
            Our platform is expanding to reach more students across rural
            communities.
          </p>
        </div>

        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-item text-center">
              <div className="stat-number text-display-lg md:text-display-xxl font-black text-primary leading-none">
                <span>{stat.value}</span>
                <span>{stat.suffix}</span>
              </div>
              <p className="mt-3 text-body-sm text-canvas-soft/40 font-semibold uppercase tracking-[0.15em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
