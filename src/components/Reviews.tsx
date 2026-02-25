import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { Star, Quote, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.name);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: userName, rating, comment }),
      });
      if (response.ok) {
        setUserName("");
        setComment("");
        setRating(5);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-4 block">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-serif">What People Say</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-stone-50 p-8 rounded-[2.5rem] pill-shadow sticky top-24">
              <h3 className="text-2xl font-serif mb-6">Leave a Review</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Your Name</label>
                  <input 
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    type="text" 
                    className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-colors ${rating >= star ? "text-amber-400" : "text-stone-300"}`}
                      >
                        <Star size={20} fill={rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Comment</label>
                  <textarea 
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all resize-none"
                  />
                </div>
                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-brand-red text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-red/90 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                  {loading ? "Posting..." : "Post Review"}
                </button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.length > 0 ? (
                reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-stone-50 p-8 rounded-[2.5rem] relative"
                  >
                    <Quote className="absolute top-6 right-8 text-brand-red/10 w-12 h-12" />
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? "text-amber-400" : "text-stone-300"} 
                          fill={i < review.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <p className="text-stone-600 mb-6 italic leading-relaxed">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red font-bold">
                        {review.user_name[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{review.user_name}</h4>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-20 text-stone-400 italic">
                  No reviews yet. Be the first to share your experience!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
