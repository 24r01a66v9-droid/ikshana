import { motion } from "motion/react";

export default function Impact() {
  const stats = [
    { label: "Founding Volunteers", value: "15+" },
    { label: "Year Established", value: "2021" },
    { label: "Medical Cases Assisted", value: "45+" },
    { label: "Students Supported", value: "30+" },
    { label: "Donation Drives", value: "25+" },
  ];

  return (
    <section className="py-24 px-6 bg-stone-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-4 block">Real Numbers</span>
          <h2 className="text-4xl md:text-5xl font-serif">Our Growing Impact</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <h3 className="text-5xl md:text-6xl font-serif text-brand-red mb-4">{stat.value}</h3>
              <p className="text-stone-400 text-xs uppercase tracking-widest font-bold leading-relaxed">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
