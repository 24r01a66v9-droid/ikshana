import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8 flex flex-col items-center"
      >
        <Logo className="w-40 h-40 mb-4" />
        <h1 className="text-4xl font-serif font-black tracking-[0.2em] text-stone-800">IKSHANA</h1>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <span className="inline-block px-4 py-1 bg-brand-red/10 text-brand-red rounded-full text-xs font-bold tracking-widest uppercase mb-6">
          CMRIT Student Led Organization
        </span>
        <h2 className="text-5xl md:text-7xl font-serif font-light leading-tight mb-6">
          Supporting Lives, <span className="italic font-medium">Spreading Hope</span>.
        </h2>
        <p className="text-brand-red font-serif italic text-xl mb-8 opacity-80">
          "your little help + our passion to help = someone's hope"
        </p>
        <p className="text-stone-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Ikshana is a community-driven social service initiative dedicated to supporting those who need it most through compassion and responsibility.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" className="px-8 py-4 bg-brand-red text-white rounded-full font-medium hover:bg-brand-red/90 transition-all flex items-center gap-2 group">
            Join Our Community
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#support" className="px-8 py-4 border border-stone-300 rounded-full font-medium hover:bg-white transition-all">
            Support Our Cause
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">Scroll to discover</span>
        <div className="w-px h-12 bg-gradient-to-b from-stone-300 to-transparent" />
      </motion.div>
    </section>
  );
}
