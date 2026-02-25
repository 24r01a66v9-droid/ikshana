import { motion } from "motion/react";
import { Home, HeartPulse, GraduationCap, Users2 } from "lucide-react";

export default function WhatWeDo() {
  const services = [
    {
      title: "Orphanage Support",
      icon: Home,
      description: "Providing food, groceries, clothes, educational materials, and emotional support to children in need.",
      details: ["Food & Groceries", "Clothes & Essentials", "Study Materials", "Social Support"]
    },
    {
      title: "Old-Age Home Support",
      icon: Users2,
      description: "Contributing groceries, hygiene kits, blankets, and most importantly, companionship to our elders.",
      details: ["Hygiene Kits", "Blankets & Clothing", "Emotional Care", "Companionship"]
    },
    {
      title: "Medical Assistance",
      icon: HeartPulse,
      description: "Offering monetary support to individuals who cannot afford treatments, medicines, or emergency care.",
      details: ["Treatment Costs", "Medicine Support", "Emergency Expenses", "Healthcare Access"]
    },
    {
      title: "Educational Support",
      icon: GraduationCap,
      description: "Helping underprivileged students continue their education through fees, books, and study materials.",
      details: ["School/College Fees", "Books & Stationery", "Mentorship", "Continuing Education"]
    }
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-4 block">Our Impact Areas</span>
          <h2 className="text-4xl md:text-5xl font-serif">What We Do</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 rounded-[3rem] border border-stone-100 hover:border-brand-red/20 hover:bg-brand-cream/10 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500 shrink-0">
                  <service.icon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif mb-4">{service.title}</h3>
                  <p className="text-stone-500 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.details.map((detail) => (
                      <span key={detail} className="px-4 py-1.5 bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest rounded-full group-hover:bg-white transition-colors">
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
