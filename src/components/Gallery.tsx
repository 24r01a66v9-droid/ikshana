import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, Plus, X, Upload, Trash2, Camera } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
  date: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newImage, setNewImage] = useState({ title: "", category: "Event", file: null as File | null });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images from API on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos?category=gallery");
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        }
      } catch (e) {
        console.error("Failed to fetch gallery images", e);
      }
    };
    fetchPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage({ ...newImage, file: e.target.files[0] });
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
      setNewImage({ ...newImage, file: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const photoData = {
        url: base64String,
        title: newImage.title || "Untitled Moment",
        category: "gallery",
        sub_category: newImage.category,
        date: new Date().toLocaleDateString(),
      };

      try {
        const response = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });

        if (response.ok) {
          // Refresh images
          const refreshResponse = await fetch("/api/photos?category=gallery");
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setImages(data);
          }
          setIsAdding(false);
          setNewImage({ title: "", category: "Event", file: null });
        }
      } catch (e) {
        console.error("Failed to upload photo", e);
      }
    };
    reader.readAsDataURL(newImage.file);
  };

  const removeImage = async (id: string) => {
    try {
      const response = await fetch(`/api/photos/${id}`, { method: "DELETE" });
      if (response.ok) {
        setImages(images.filter(img => img.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete photo", e);
    }
  };

  return (
    <section id="gallery" className="py-32 px-6 bg-[#F9F8F6] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-24">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-[1px] w-12 bg-brand-red"></div>
              <span className="text-brand-red font-bold tracking-[0.2em] uppercase text-[10px]">Visual Archive</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-6xl md:text-8xl font-serif leading-[0.9] tracking-tighter mb-8"
            >
              Captured <br />
              <span className="italic text-stone-400">Moments.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-stone-500 text-lg max-w-md leading-relaxed"
            >
              A curated collection of impact, community, and the spirit of Ikshana. 
              Every frame tells a story of change.
            </motion.p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(true)}
              className="group relative flex items-center gap-4 bg-stone-900 text-white pl-8 pr-10 py-5 rounded-full font-bold tracking-widest uppercase text-xs transition-all hover:bg-brand-red overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Camera size={16} />
                Contribute to Gallery
              </span>
              <div className="absolute inset-0 bg-brand-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </motion.button>
            <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
              {images.length} Stories Shared
            </div>
          </div>
        </div>

        {images.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="aspect-[21/9] flex flex-col items-center justify-center border border-stone-200 rounded-[4rem] bg-white/50 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="grid grid-cols-12 h-full">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border-r border-stone-900 h-full"></div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 text-center px-6">
              <div className="w-20 h-20 bg-stone-100 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-8">
                <ImageIcon size={40} />
              </div>
              <h3 className="text-2xl font-serif mb-4">The archive is currently empty</h3>
              <p className="text-stone-400 mb-8 max-w-sm mx-auto">Be the first to document a moment and share it with the community.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="text-brand-red font-bold tracking-widest uppercase text-xs hover:tracking-[0.2em] transition-all"
              >
                Upload Photo +
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="break-inside-avoid group relative rounded-[2.5rem] overflow-hidden bg-white border border-stone-100"
                >
                  <div className="relative aspect-auto overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.title}
                      className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <button 
                        onClick={() => removeImage(image.id)}
                        className="w-14 h-14 bg-white text-brand-red rounded-full flex items-center justify-center hover:bg-brand-red hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
                        title="Delete from archive"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-stone-100 text-stone-500 text-[9px] font-bold uppercase tracking-widest rounded-full">
                        {image.category}
                      </span>
                      <span className="text-stone-300 text-[10px] font-mono">{image.date}</span>
                    </div>
                    <h3 className="text-xl font-serif leading-tight group-hover:text-brand-red transition-colors">
                      {image.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Editorial Upload Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
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
              className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            >
              <div className="lg:w-1/2 bg-stone-50 p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-100">
                <div>
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="mb-12 text-stone-400 hover:text-stone-900 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    <X size={16} /> Close
                  </button>
                  <h3 className="text-5xl font-serif mb-6 leading-none">Share a <br /><span className="italic text-stone-400">Moment.</span></h3>
                  <p className="text-stone-500 leading-relaxed mb-8">
                    Contribute to the Ikshana visual archive. Your photos help us document the journey of impact and community building.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <span className="w-8 h-[1px] bg-stone-200"></span>
                    Guidelines
                  </div>
                  <ul className="text-[10px] text-stone-400 space-y-2 uppercase tracking-wider">
                    <li>• High resolution preferred</li>
                    <li>• Relevant to Ikshana events</li>
                    <li>• Respect privacy of individuals</li>
                  </ul>
                </div>
              </div>

              <div className="lg:w-1/2 p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3 group-focus-within:text-brand-red transition-colors">Story Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="What's happening in this photo?"
                        className="w-full bg-transparent border-b border-stone-200 py-4 focus:outline-none focus:border-brand-red transition-all text-lg font-serif placeholder:text-stone-300"
                        value={newImage.title}
                        onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                      />
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-3 group-focus-within:text-brand-red transition-colors">Category</label>
                      <div className="flex flex-wrap gap-3">
                        {["Event", "Community", "Initiative", "Team"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewImage({ ...newImage, category: cat })}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                              newImage.category === cat 
                                ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                                : "bg-stone-50 text-stone-400 hover:bg-stone-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div 
                      className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all flex flex-col items-center justify-center text-center group ${
                        dragActive ? "border-brand-red bg-brand-red/5" : "border-stone-100 bg-stone-50 hover:bg-stone-100/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {newImage.file ? (
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-32 rounded-[2rem] overflow-hidden mb-6 shadow-xl border-4 border-white">
                            <img 
                              src={URL.createObjectURL(newImage.file)} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-stone-900 font-serif text-sm mb-2">{newImage.file.name}</p>
                          <button 
                            type="button"
                            onClick={() => setNewImage({ ...newImage, file: null })}
                            className="text-brand-red text-[10px] font-bold uppercase tracking-widest hover:underline"
                          >
                            Replace Image
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-stone-300 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                          </div>
                          <p className="text-stone-500 text-sm mb-2 font-serif">
                            Drop your memory here
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
                  </div>

                  <button 
                    type="submit"
                    disabled={!newImage.file}
                    className="w-full bg-stone-900 text-white py-6 rounded-2xl font-bold tracking-[0.3em] uppercase text-[10px] hover:bg-brand-red transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-brand-red/20"
                  >
                    Archive Moment
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
