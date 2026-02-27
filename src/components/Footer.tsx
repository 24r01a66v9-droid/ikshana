import { Instagram, Twitter, Linkedin, Github } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer id="contact" className="bg-stone-900 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo className="w-10 h-10" />
              <span className="font-serif font-bold tracking-widest text-2xl">IKSHANA</span>
            </div>
            <p className="text-stone-400 max-w-md mb-8 leading-relaxed">
              Ikshana is a student-led organization at CMRIT, dedicated to fostering a community of leaders, creators, and change-makers.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/ikshana_official/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.linkedin.com/company/ikshana-foundation/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6">Quick Links</h4>
            <ul className="space-y-4 text-stone-400">
              <li><a href="#about" className="hover:text-brand-red transition-colors">About Us</a></li>
              <li><a href="#events" className="hover:text-brand-red transition-colors">Events</a></li>
              <li><a href="#gallery" className="hover:text-brand-red transition-colors">Gallery</a></li>
              <li><a href="#seek-help" className="hover:text-brand-red transition-colors">Seek Help</a></li>
              <li><a href="#reviews" className="hover:text-brand-red transition-colors">Reviews</a></li>
              <li><a href="#support" className="hover:text-brand-red transition-colors">Support Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6">Contact</h4>
            <ul className="space-y-4 text-stone-400">
              <li>Ikshana Foundation</li>
              <li>Hyderabad, Telangana</li>
              <li>
                <a href="https://www.instagram.com/ikshana_official/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2">
                  <Instagram size={14} /> @ikshana_official
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/ikshana-foundation/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors flex items-center gap-2">
                  <Linkedin size={14} /> Ikshana Foundation
                </a>
              </li>
              <li>contact@ikshana.cmrit.ac.in</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-xs uppercase tracking-widest font-bold">
          <p>© 2026 My Website | All Rights Reserved</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
