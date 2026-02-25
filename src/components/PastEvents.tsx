import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Palette, PenTool, Image as ImageIcon, Plus, X, Upload, Trash2, Camera } from "lucide-react";

interface EventPhoto {
  id: string;
  url: string;
  caption: string;
}

export default function PastEvents() {
  const [eventPhotos, setEventPhotos] = useState<Record<string, EventPhoto[]>>({});
  const [isAdding, setIsAdding] = useState<{ eventTitle: string } | null>(null);
  const [newPhoto, setNewPhoto] = useState({ caption: "", file: null as File | null });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const events = [
    {
      title: "SIDDI 1.0",
      date: "September 9, 2021",
      occasion: "Ganesh Chaturthi",
      description: "Siddi 1.0 served as a platform for students to express themselves, advocate for causes close to their hearts, and inspire positive change. It reinforced the values of empathy, respect, and environmental stewardship, reminding us of our interconnectedness with each other and the world around us.",
      activities: [
        {
          name: "Craft Making",
          icon: Palette,
          description: "During the event, the students showcased their creativity by crafting beautiful representations of Lord Ganesha using a variety of materials such as clay and plants. Each creation was a unique expression of devotion, skillfully molded and intricately designed to capture the essence of the beloved deity. The use of natural elements like clay and plants added a special touch, infusing the artworks with a sense of harmony and reverence for the environment."
        },
        {
          name: "Essay Writing",
          icon: PenTool,
          description: "In their essays, students talked about Sanathana Dharma and why it's important. They explained how it gives guidelines for how to live a good life and keep society balanced. They showed how these teachings are still useful today, helping people grow spiritually, behave well, and make communities peaceful."
        },
        {
          name: "Poster Making",
          icon: ImageIcon,
          description: "During the poster making session, students crafted visually compelling posters advocating for animal rights. Through their artwork, they aimed to give a voice to the voiceless creatures of our planet. Each poster depicted poignant imagery and powerful messages, urging viewers to recognize and respect the rights of animals. From emotive illustrations to thought-provoking slogans, these posters served as impactful reminders of the importance of compassion and empathy towards all living beings."
        }
      ]
    }
  ];

  // Load photos from API on mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos?category=event");
        if (response.ok) {
          const data = await response.json();
          // Group by sub_category (event title)
          const grouped = data.reduce((acc: Record<string, EventPhoto[]>, photo: any) => {
            const eventTitle = photo.sub_category;
            if (!acc[eventTitle]) acc[eventTitle] = [];
            acc[eventTitle].push(photo);
            return acc;
          }, {});
          setEventPhotos(grouped);
        }
      } catch (e) {
        console.error("Failed to fetch event photos", e);
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
    if (!newPhoto.file || !isAdding) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const photoData = {
        url: base64String,
        title: newPhoto.caption || "Event Moment",
        category: "event",
        sub_category: isAdding.eventTitle,
      };

      try {
        const response = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });

        if (response.ok) {
          // Refresh photos
          const refreshResponse = await fetch("/api/photos?category=event");
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const grouped = data.reduce((acc: Record<string, EventPhoto[]>, photo: any) => {
              const eventTitle = photo.sub_category;
              if (!acc[eventTitle]) acc[eventTitle] = [];
              acc[eventTitle].push(photo);
              return acc;
            }, {});
            setEventPhotos(grouped);
          }
          setIsAdding(null);
          setNewPhoto({ caption: "", file: null });
        }
      } catch (e) {
        console.error("Failed to upload event photo", e);
      }
    };
    reader.readAsDataURL(newPhoto.file);
  };

  const removePhoto = async (eventTitle: string, photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
      if (response.ok) {
        const currentPhotos = eventPhotos[eventTitle] || [];
        setEventPhotos({
          ...eventPhotos,
          [eventTitle]: currentPhotos.filter(p => p.id !== photoId)
        });
      }
    } catch (e) {
      console.error("Failed to delete event photo", e);
    }
  };

  return (
    <section id="events" className="py-32 px-6 bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="h-[1px] w-12 bg-brand-red"></div>
            <span className="text-brand-red font-bold tracking-[0.2em] uppercase text-[10px]">Our Journey</span>
          </motion.div>
          <h2 className="text-6xl md:text-8xl font-serif tracking-tighter leading-[0.9]">
            Past Events <br />
            <span className="italic text-stone-400">& Initiatives.</span>
          </h2>
        </div>

        {events.map((event, eventIdx) => (
          <div key={eventIdx} className="mb-32 last:mb-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-12 border-b border-stone-200 pb-12">
              <div className="max-w-2xl">
                <span className="text-brand-red font-mono text-xs mb-4 block uppercase tracking-widest">{event.date}</span>
                <h3 className="text-4xl md:text-5xl font-serif mb-6">{event.title}</h3>
                <p className="text-stone-500 text-lg leading-relaxed italic">
                  "{event.description}"
                </p>
              </div>
              
              <div className="flex flex-col items-start lg:items-end gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Occasion</span>
                <span className="text-2xl font-serif text-stone-900">{event.occasion}</span>
                <button 
                  onClick={() => setIsAdding({ eventTitle: event.title })}
                  className="mt-4 flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-full font-bold tracking-widest uppercase text-[10px] hover:bg-brand-red transition-all pill-shadow"
                >
                  <Camera size={14} />
                  Add Event Photos
                </button>
              </div>
            </div>

            {/* Activities Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {event.activities.map((activity, i) => (
                <motion.div
                  key={activity.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[3rem] p-10 border border-stone-100 hover:border-brand-red/20 transition-all group"
                >
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-brand-red mb-8 group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                    <activity.icon size={24} />
                  </div>
                  <h4 className="text-2xl font-serif mb-4">{activity.name}</h4>
                  <p className="text-stone-500 leading-relaxed text-sm">
                    {activity.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Event Photos Display */}
            {eventPhotos[event.title] && eventPhotos[event.title].length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Event Archive</span>
                  <div className="h-[1px] flex-grow bg-stone-100"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence mode="popLayout">
                    {eventPhotos[event.title].map((photo) => (
                      <motion.div
                        key={photo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative aspect-square rounded-3xl overflow-hidden bg-stone-100"
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.caption}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                          <p className="text-white text-[10px] font-medium mb-3 truncate">{photo.caption}</p>
                          <button 
                            onClick={() => removePhoto(event.title, photo.id)}
                            className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-red transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(null)}
              className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl"
            >
              <button 
                onClick={() => setIsAdding(null)}
                className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <span className="text-brand-red font-bold tracking-widest uppercase text-[10px] mb-2 block">Archive Manager</span>
                <h3 className="text-3xl font-serif">Add to {isAdding.eventTitle}</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Caption</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Describe this moment..."
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all font-serif"
                    value={newPhoto.caption}
                    onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  />
                </div>

                <div 
                  className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center text-center ${
                    dragActive ? "border-brand-red bg-brand-red/5" : "border-stone-100 bg-stone-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {newPhoto.file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-lg">
                        <img 
                          src={URL.createObjectURL(newPhoto.file)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-stone-900 font-medium text-xs mb-2">{newPhoto.file.name}</p>
                      <button 
                        type="button"
                        onClick={() => setNewPhoto({ ...newPhoto, file: null })}
                        className="text-brand-red text-[10px] font-bold uppercase tracking-widest hover:underline"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-stone-300 mb-4 shadow-sm">
                        <Upload size={20} />
                      </div>
                      <p className="text-stone-500 text-xs mb-2">
                        <span className="text-brand-red font-bold">Click to upload</span> or drag and drop
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
                  className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold tracking-widest uppercase text-[10px] hover:bg-brand-red transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  Save to Event Archive
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
