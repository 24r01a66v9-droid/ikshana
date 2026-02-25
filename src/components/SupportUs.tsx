import { motion } from "motion/react";
import { Linkedin, Share2, Heart } from "lucide-react";

export default function SupportUs() {
  return (
    <section id="support" className="py-20 px-6 bg-brand-red text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif">Boost Our Mission</h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Help us reach more people! Follow, Like, Share, and <span className="font-bold italic">Repost</span> our updates on LinkedIn to boost our profile and spread hope.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a 
              href="https://www.linkedin.com/company/ikshana-foundation/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-brand-red rounded-full font-bold flex items-center gap-2 hover:bg-stone-100 transition-all"
            >
              <Linkedin size={20} />
              Follow on LinkedIn
            </a>
            <a 
              href="#contact"
              className="px-8 py-4 border border-white/30 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              <Heart size={20} />
              Support Our Cause
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
