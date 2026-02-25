import { useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Upload, CheckCircle2, Search, FileText, X } from "lucide-react";

export default function SeekHelp() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [checkContact, setCheckContact] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);
  const [statusError, setStatusError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map((f: File) => f.name);
      setSelectedFiles(names);
    }
  };

  const handleCheckStatus = async (e: FormEvent) => {
    e.preventDefault();
    if (!checkContact) return;
    setCheckingStatus(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const response = await fetch(`/api/medical-request/${checkContact}`);
      if (response.ok) {
        const data = await response.json();
        setStatusResult(data);
      } else {
        const err = await response.json();
        setStatusError(err.error || "No request found");
      }
    } catch (error) {
      setStatusError("Failed to check status");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // Handle files - just store names for this demo
    data.documents = selectedFiles.join(", ");

    try {
      const response = await fetch("/api/medical-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error("Error submitting request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="seek-help" className="py-24 px-6 bg-stone-50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[3rem] pill-shadow"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif mb-4">Request Received</h2>
            <p className="text-stone-600 mb-8">
              We have received your medical emergency request. Our team will review the details and contact you as soon as possible.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-brand-red font-bold uppercase tracking-widest text-sm hover:underline"
            >
              Submit another request
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="seek-help" className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-brand-red font-bold tracking-widest uppercase text-xs mb-4 block">Emergency Support</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-8">Seek Medical Help</h2>
          <p className="text-stone-600 text-lg mb-8 leading-relaxed">
            If you or someone you know is facing a medical emergency and needs financial or logistical support, please fill out this form. Ikshana Foundation is committed to standing by those in need.
          </p>
          
          <div className="space-y-6 mb-12">
            <div className="flex gap-4 p-6 bg-white rounded-2xl pill-shadow">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Verified Requests</h4>
                <p className="text-sm text-stone-500">All requests undergo a verification process to ensure help reaches the right people.</p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-white rounded-2xl pill-shadow">
              <div className="w-12 h-12 bg-brand-red/10 text-brand-red rounded-xl flex items-center justify-center shrink-0">
                <Upload size={24} />
              </div>
              <div>
                <h4 className="font-bold mb-1">Document Support</h4>
                <p className="text-sm text-stone-500">Please keep hospital bills, prescriptions, and ID proofs ready for verification.</p>
              </div>
            </div>
          </div>

          {/* Check Status Form */}
          <div className="bg-white p-8 rounded-[2.5rem] pill-shadow border border-brand-red/10">
            <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
              <Search size={20} className="text-brand-red" />
              Check Request Status
            </h3>
            <form onSubmit={handleCheckStatus} className="flex gap-2">
              <input 
                type="tel" 
                placeholder="Enter Contact Number"
                value={checkContact}
                onChange={(e) => setCheckContact(e.target.value)}
                className="flex-1 px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm"
              />
              <button 
                disabled={checkingStatus}
                className="px-6 py-3 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-brand-red/90 transition-all disabled:opacity-50"
              >
                {checkingStatus ? "..." : "Check"}
              </button>
            </form>

            <AnimatePresence>
              {statusResult && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-stone-100 overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Patient</p>
                      <p className="font-bold">{statusResult.patient_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        statusResult.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                        statusResult.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {statusResult.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-lg">
                    {statusResult.emergency_details.substring(0, 100)}...
                  </p>
                  <button 
                    onClick={() => setStatusResult(null)}
                    className="mt-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-brand-red flex items-center gap-1"
                  >
                    <X size={12} /> Close
                  </button>
                </motion.div>
              )}
              {statusError && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-xs text-brand-red font-medium"
                >
                  {statusError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white p-8 md:p-12 rounded-[3rem] pill-shadow"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Patient Name</label>
                <input 
                  required
                  name="patient_name"
                  type="text" 
                  placeholder="Full Name"
                  className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Contact Number</label>
                <input 
                  required
                  name="contact_number"
                  type="tel" 
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Hospital Name & Location</label>
              <input 
                name="hospital_name"
                type="text" 
                placeholder="Hospital Details"
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Emergency Details</label>
              <textarea 
                required
                name="emergency_details"
                rows={4}
                placeholder="Describe the medical emergency and what kind of support is needed..."
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Required Amount (Optional)</label>
              <input 
                name="required_amount"
                type="text" 
                placeholder="e.g. ₹50,000"
                className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-stone-400">Upload Documents (Prescriptions/Bills)</label>
              <div className="relative">
                <input 
                  name="documents"
                  type="file" 
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-red/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 cursor-pointer"
                />
              </div>
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {selectedFiles.map((name, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-medium">
                        <FileText size={10} />
                        {name.length > 15 ? name.substring(0, 12) + '...' : name}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-brand-red text-white rounded-2xl font-bold hover:bg-brand-red/90 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Help Request"}
            </button>
            <p className="text-[10px] text-center text-stone-400 uppercase tracking-widest">
              By submitting, you agree to our verification process.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
