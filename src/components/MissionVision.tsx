import { motion } from "motion/react";
import { Heart, Eye, ShieldCheck, Users, Star } from "lucide-react";

export default function MissionVision() {
  const values = [
    { name: "Compassion", icon: Heart },
    { name: "Transparency", icon: Eye },
    { name: "Accountability", icon: ShieldCheck },
    { name: "Dignity for All", icon: Users },
    { name: "Service Before Self", icon: Star },
  ];

  return (
    <section className="py-24 px-6 bg-brand-cream/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-[3rem] pill-shadow"
          >
            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red mb-8">
              <Heart size={32} />
            </div>
            <h2 className="text-4xl font-serif mb-6">Our Mission</h2>
            <ul className="space-y-4 text-stone-600 text-lg">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                To support children in orphanages and care for elderly in old-age homes.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                To provide financial assistance for medical treatments and education.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                To inspire youth to participate in meaningful social service.
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-12 rounded-[3rem] pill-shadow"
          >
            <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red mb-8">
              <Eye size={32} />
            </div>
            <h2 className="text-4xl font-serif mb-6">Our Vision</h2>
            <p className="text-stone-600 text-lg mb-6">
              To build a society where:
            </p>
            <ul className="space-y-4 text-stone-600 text-lg">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                No child is deprived of education and no elderly person feels neglected.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                No individual suffers due to lack of medical support.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red mt-2.5 shrink-0" />
                Communities come together to uplift one another.
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-sm uppercase tracking-[0.3em] text-stone-400 font-bold mb-12">Our Core Values</h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {values.map((value, i) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400">
                  <value.icon size={20} />
                </div>
                <span className="font-serif text-lg italic">{value.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
