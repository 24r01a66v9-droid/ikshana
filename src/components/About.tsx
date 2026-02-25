import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, Plus, X, Upload, Trash2, Camera } from "lucide-react";

interface AboutPhoto {
  id: string;
  url: string;
  caption: string;
}

export default function About() {
  const [photos, setPhotos] = useState<AboutPhoto[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ caption: "", file: null as File | null });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load photos from API on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos?category=about");
        if (response.ok) {
          const data = await response.json();
          setPhotos(data);
        }
      } catch (e) {
        console.error("Failed to fetch about photos", e);
      }
    };
    fetchPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPhoto({ ...newPhoto, file: e.target.files[0] });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setNewPhoto({ ...newPhoto, file: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const photoData = {
        url: base64String,
        title: newPhoto.caption || "About Moment",
        category: "about",
      };

      try {
        const response = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });

        if (response.ok) {
          // Refresh photos
          const refreshResponse = await fetch("/api/photos?category=about");
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setPhotos(data);
          }
          setIsAdding(false);
          setNewPhoto({ caption: "", file: null });
        }
      } catch (e) {
        console.error("Failed to upload about photo", e);
      }
    };
    reader.readAsDataURL(newPhoto.file);
  };

  const removePhoto = async (id: string) => {
    try {
      const response = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete about photo", e);
    }
  };

  return (
    <section id="about" className="py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center mb-32">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[16/9] rounded-[3rem] overflow-hidden pill-shadow bg-stone-100">
              <img 
                src="https://picsum.photos/seed/community-service-team/1600/900" 
                alt="Ikshana Team" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-brand-cream p-8 rounded-[2.5rem] pill-shadow hidden lg:block border border-white">
              <p className="font-serif text-2xl italic text-brand-red">"Students for students, by students."</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] w-12 bg-brand-red"></div>
              <span className="text-brand-red font-bold tracking-[0.2em] uppercase text-[10px]">Our Story</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-serif mb-8 tracking-tighter leading-none">About <br /><span className="italic text-stone-400">Ikshana.</span></h2>
            <div className="space-y-6 text-stone-600 text-lg leading-relaxed">
              <p>
                The name <span className="text-brand-red font-medium">Ikshana</span> means "vision," and we believe in seeing the struggles of society and responding with compassion and responsibility.
              </p>
              <p>
                Established on <span className="text-brand-red font-medium">May 6, 2021</span>, by a dynamic team of 15 volunteers, Ikshana Foundation was born in response to the hardships faced by small orphanages during the 2020 pandemic.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="group">
                  <h3 className="text-4xl font-serif text-brand-red mb-2 group-hover:scale-110 transition-transform origin-left">15+</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Founding Volunteers</p>
                </div>
                <div className="group">
                  <h3 className="text-4xl font-serif text-brand-red mb-2 group-hover:scale-110 transition-transform origin-left">2021</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Year Founded</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* About Archive Section */}
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Team Archive</span>
                <div className="h-[1px] w-12 bg-stone-200"></div>
              </div>
              <h3 className="text-4xl font-serif mb-4">Foundation <span className="italic text-stone-400">Memories.</span></h3>
              <p className="text-stone-500">Documenting our journey, team members, and the moments that define our foundation.</p>
            </div>
            
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-3 bg-stone-900 text-white px-8 py-5 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-brand-red transition-all pill-shadow self-start md:self-auto"
            >
              <Camera size={16} />
              Add Team Photo
            </button>
          </div>

          {photos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="aspect-[21/9] flex flex-col items-center justify-center border border-stone-200 rounded-[3rem] bg-stone-50/30 relative overflow-hidden"
            >
              <div className="text-center px-6">
                <div className="w-16 h-16 bg-white text-stone-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <ImageIcon size={32} />
                </div>
                <p className="text-stone-400 font-serif italic">No archive photos yet. Start documenting our team journey.</p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-stone-100 border border-stone-100"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <p className="text-white font-serif text-sm mb-4 leading-tight">{photo.caption}</p>
                      <button 
                        onClick={() => removePhoto(photo.id)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-red transition-colors"
                        title="Remove from archive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <span className="text-brand-red font-bold tracking-widest uppercase text-[10px] mb-2 block">Foundation Archive</span>
                <h3 className="text-4xl font-serif">Add Team Photo</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Caption</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Founding team meeting, 2021"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-serif"
                    value={newPhoto.caption}
                    onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  />
                </div>

                <div 
                  className={`relative border-2 border-dashed rounded-[2.5rem] p-10 transition-all flex flex-col items-center justify-center text-center group ${
                    dragActive ? "border-brand-red bg-brand-red/5" : "border-stone-100 bg-stone-50 hover:bg-stone-100/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {newPhoto.file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden mb-6 shadow-xl border-4 border-white">
                        <img 
                          src={URL.createObjectURL(newPhoto.file)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-stone-900 font-serif text-xs mb-2">{newPhoto.file.name}</p>
                      <button 
                        type="button"
                        onClick={() => setNewPhoto({ ...newPhoto, file: null })}
                        className="text-brand-red text-[10px] font-bold uppercase tracking-widest hover:underline"
                      >
                        Replace Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-stone-300 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-stone-500 text-xs mb-2 font-serif">
                        Drop a team memory here
                      </p>
                      <p className="text-stone-400 text-[10px] uppercase tracking-widest">
                        or <span className="text-brand-red font-bold cursor-pointer">browse files</span>
                      </p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!newPhoto.file}
                  className="w-full bg-stone-900 text-white py-6 rounded-2xl font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-brand-red transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  Save to Archive
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
