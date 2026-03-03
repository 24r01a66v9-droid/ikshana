import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ikshana.db");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

// Supabase Setup (Optional for Persistence)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (supabase) {
  console.log("Supabase client initialized for persistent storage.");
} else {
  console.log("Using local SQLite (ikshana.db). Data will be ephemeral in some environments.");
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medical_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    emergency_details TEXT NOT NULL,
    hospital_name TEXT,
    required_amount TEXT,
    documents TEXT, -- Store as JSON or comma-separated URLs
    status TEXT DEFAULT 'pending',
    expiry_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    title TEXT,
    category TEXT NOT NULL, -- 'gallery', 'event', 'about', 'hero'
    sub_category TEXT,      -- e.g., event title
    is_featured INTEGER DEFAULT 0,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail TEXT,
    category TEXT,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Ensure role column exists in users table
try {
  db.prepare("SELECT role FROM users LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log("Migration: Added role column to users table");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

// Migration: Ensure expiry_date column exists in medical_requests table
try {
  db.prepare("SELECT expiry_date FROM medical_requests LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE medical_requests ADD COLUMN expiry_date TEXT");
    console.log("Migration: Added expiry_date column to medical_requests table");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

// Migration: Automatically set Manaswini Sharma as Admin
try {
  const adminEmail = "24r01a66v9@cmrithyderabad.edu.in";
  db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(adminEmail);
  console.log(`Migration: Ensured ${adminEmail} is an admin.`);
} catch (e) {
  console.error("Admin migration failed:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email === "24r01a66v9@cmrithyderabad.edu.in" ? "admin" : "user";
      const insert = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
      insert.run(name, email, hashedPassword, role);
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Force admin role for the specific email
      const role = user.email === "24r01a66v9@cmrithyderabad.edu.in" ? "admin" : user.role;

      const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: role }, JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
      res.json({ user: { id: user.id, name: user.name, email: user.email, role: role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Photos API
  app.get("/api/photos", async (req, res) => {
    const { category, sub_category } = req.query;
    
    if (supabase) {
      try {
        let query = supabase.from("photos").select("*");
        if (category) query = query.eq("category", category);
        if (sub_category) query = query.eq("sub_category", sub_category);
        
        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return res.json(data);
      } catch (error) {
        console.error("Supabase fetch photos error:", error);
        // Fallback to SQLite if Supabase fails
      }
    }

    try {
      let query = "SELECT * FROM photos WHERE 1=1";
      const params = [];
      
      if (category) {
        query += " AND category = ?";
        params.push(category);
      }
      if (sub_category) {
        query += " AND sub_category = ?";
        params.push(sub_category);
      }
      
      query += " ORDER BY created_at DESC";
      const photos = db.prepare(query).all(...params);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  app.post("/api/photos", async (req, res) => {
    const { url, title, category, sub_category, date, is_featured } = req.body;
    if (!url || !category) return res.status(400).json({ error: "URL and category are required" });

    if (supabase) {
      try {
        const { data, error } = await supabase.from("photos").insert([{
          url,
          title: title || null,
          category,
          sub_category: sub_category || null,
          date: date || new Date().toLocaleDateString(),
          is_featured: is_featured ? 1 : 0
        }]).select();
        
        if (error) throw error;
        return res.json({ success: true, id: data[0].id });
      } catch (error) {
        console.error("Supabase add photo error:", error);
      }
    }

    try {
      const insert = db.prepare("INSERT INTO photos (url, title, category, sub_category, date, is_featured) VALUES (?, ?, ?, ?, ?, ?)");
      const result = insert.run(
        url, 
        title || null, 
        category, 
        sub_category || null, 
        date || new Date().toLocaleDateString(), 
        is_featured ? 1 : 0
      );
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add photo" });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    const { id } = req.params;
    
    if (supabase) {
      try {
        const { error } = await supabase.from("photos").delete().eq("id", id);
        if (error) throw error;
        return res.json({ success: true });
      } catch (error) {
        console.error("Supabase delete photo error:", error);
      }
    }

    try {
      db.prepare("DELETE FROM photos WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // Videos API
  app.get("/api/videos", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return res.json(data);
      } catch (error) {
        console.error("Supabase fetch videos error:", error);
      }
    }

    try {
      const videos = db.prepare("SELECT * FROM videos ORDER BY created_at DESC").all();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    const { title, description, url, thumbnail, category, date } = req.body;
    if (!title || !url) return res.status(400).json({ error: "Title and URL are required" });

    if (supabase) {
      try {
        const { data, error } = await supabase.from("videos").insert([{
          title,
          description: description || null,
          url,
          thumbnail: thumbnail || null,
          category: category || "General",
          date: date || new Date().toLocaleDateString()
        }]).select();
        
        if (error) throw error;
        return res.json({ success: true, id: data[0].id });
      } catch (error) {
        console.error("Supabase add video error:", error);
      }
    }

    try {
      const insert = db.prepare("INSERT INTO videos (title, description, url, thumbnail, category, date) VALUES (?, ?, ?, ?, ?, ?)");
      const result = insert.run(
        title,
        description || null,
        url,
        thumbnail || null,
        category || "General",
        date || new Date().toLocaleDateString()
      );
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to add video" });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    const { id } = req.params;
    
    if (supabase) {
      try {
        const { error } = await supabase.from("videos").delete().eq("id", id);
        if (error) throw error;
        return res.json({ success: true });
      } catch (error) {
        console.error("Supabase delete video error:", error);
      }
    }

    try {
      db.prepare("DELETE FROM videos WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // Reviews API
  app.get("/api/reviews", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return res.json(data);
      } catch (error) {
        console.error("Supabase fetch reviews error:", error);
      }
    }

    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    const { user_name, rating, comment } = req.body;
    if (!user_name || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from("reviews").insert([{
          user_name,
          rating,
          comment
        }]).select();
        
        if (error) throw error;
        return res.json({ success: true, id: data[0].id });
      } catch (error) {
        console.error("Supabase add review error:", error);
      }
    }

    try {
      const insert = db.prepare("INSERT INTO reviews (user_name, rating, comment) VALUES (?, ?, ?)");
      insert.run(user_name, rating, comment);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  // Medical Requests API
  app.post("/api/medical-request", async (req, res) => {
    const { patient_name, contact_number, emergency_details, hospital_name, required_amount, documents } = req.body;
    if (!patient_name || !contact_number || !emergency_details) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from("medical_requests").insert([{
          patient_name,
          contact_number,
          emergency_details,
          hospital_name,
          required_amount,
          documents,
          status: 'pending'
        }]).select();
        
        if (error) throw error;
        return res.json({ success: true, id: data[0].id });
      } catch (error) {
        console.error("Supabase add medical request error:", error);
      }
    }

    try {
      const insert = db.prepare(`
        INSERT INTO medical_requests (patient_name, contact_number, emergency_details, hospital_name, required_amount, documents)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insert.run(patient_name, contact_number, emergency_details, hospital_name, required_amount, documents);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit request" });
    }
  });

  app.get("/api/medical-request/:contact", async (req, res) => {
    const { contact } = req.params;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("medical_requests")
          .select("*")
          .eq("contact_number", contact)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (error) throw error;
        if (data && data.length > 0) {
          return res.json(data[0]);
        } else {
          return res.status(404).json({ error: "No request found for this number" });
        }
      } catch (error) {
        console.error("Supabase fetch medical request error:", error);
      }
    }

    try {
      const request = db.prepare("SELECT * FROM medical_requests WHERE contact_number = ? ORDER BY created_at DESC LIMIT 1").get(contact);
      if (request) {
        res.json(request);
      } else {
        res.status(404).json({ error: "No request found for this number" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request status" });
    }
  });

  app.get("/api/medical-requests", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("medical_requests")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        return res.json(data);
      } catch (error) {
        console.error("Supabase fetch all medical requests error:", error);
      }
    }

    try {
      const requests = db.prepare("SELECT * FROM medical_requests ORDER BY created_at DESC").all();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical requests" });
    }
  });

  app.delete("/api/medical-request/:id", authenticateToken, async (req: any, res) => {
    console.log(`DELETE request for ID: ${req.params.id} by user: ${req.user.email} (Role: ${req.user.role})`);
    if (req.user.role !== 'admin') {
      console.log("Access denied: Not an admin");
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;

    if (supabase) {
      console.log("Supabase: Deleting request ID:", id);
      try {
        const { error } = await supabase.from("medical_requests").delete().eq("id", id);
        if (error) throw error;
        console.log("Supabase: Delete successful");
        return res.json({ success: true });
      } catch (error) {
        console.error("Supabase delete medical request error:", error);
      }
    }

    try {
      db.prepare("DELETE FROM medical_requests WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete request" });
    }
  });

  app.patch("/api/medical-request/:id", authenticateToken, async (req: any, res) => {
    console.log(`PATCH request for ID: ${req.params.id} by user: ${req.user.email} (Role: ${req.user.role})`);
    console.log("Body:", req.body);
    if (req.user.role !== 'admin') {
      console.log("Access denied: Not an admin");
      return res.status(403).json({ error: "Admin access required" });
    }
    const { id } = req.params;
    const { status, expiry_date } = req.body;

    if (supabase) {
      console.log("Supabase: Updating request ID:", id, "with status:", status, "expiry:", expiry_date);
      try {
        const { data, error } = await supabase
          .from("medical_requests")
          .update({ status, expiry_date })
          .eq("id", id)
          .select();
        
        if (error) throw error;
        console.log("Supabase: Update successful", data);
        return res.json({ success: true, data: data[0] });
      } catch (error) {
        console.error("Supabase update medical request error:", error);
      }
    }

    try {
      const updates = [];
      const params = [];
      if (status) {
        updates.push("status = ?");
        params.push(status);
      }
      if (expiry_date !== undefined) {
        updates.push("expiry_date = ?");
        params.push(expiry_date);
      }
      params.push(id);

      if (updates.length > 0) {
        const sql = `UPDATE medical_requests SET ${updates.join(", ")} WHERE id = ?`;
        console.log("Executing SQL:", sql, "with params:", params);
        const result = db.prepare(sql).run(...params);
        console.log("Update result:", result);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update request" });
    }
  });

  // RSVP API
  app.post("/api/rsvp", async (req, res) => {
    const { event_id, name, email } = req.body;
    if (!event_id || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (supabase) {
      try {
        const { data, error } = await supabase.from("rsvps").insert([{
          event_id,
          name,
          email
        }]).select();
        
        if (error) throw error;
        return res.json({ success: true, id: data[0].id });
      } catch (error) {
        console.error("Supabase add RSVP error:", error);
      }
    }

    try {
      const insert = db.prepare("INSERT INTO rsvps (event_id, name, email) VALUES (?, ?, ?)");
      insert.run(event_id, name, email);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
