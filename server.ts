import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const db = new Database("ikshana.db");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev";

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
    category TEXT NOT NULL, -- 'gallery', 'event', 'about'
    sub_category TEXT,      -- e.g., event title
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

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
      const insert = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
      insert.run(name, email, hashedPassword);
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

      const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
      res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
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
  app.get("/api/photos", (req, res) => {
    const { category, sub_category } = req.query;
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

  app.post("/api/photos", (req, res) => {
    const { url, title, category, sub_category, date } = req.body;
    if (!url || !category) return res.status(400).json({ error: "URL and category are required" });

    try {
      const insert = db.prepare("INSERT INTO photos (url, title, category, sub_category, date) VALUES (?, ?, ?, ?, ?)");
      insert.run(url, title, category, sub_category, date);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add photo" });
    }
  });

  app.delete("/api/photos/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM photos WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // API Routes
  app.post("/api/medical-request", (req, res) => {
    const { patient_name, contact_number, emergency_details, hospital_name, required_amount, documents } = req.body;
    if (!patient_name || !contact_number || !emergency_details) {
      return res.status(400).json({ error: "Missing required fields" });
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

  app.get("/api/medical-request/:contact", (req, res) => {
    const { contact } = req.params;
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

  app.get("/api/reviews", (req, res) => {
    const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { user_name, rating, comment } = req.body;
    if (!user_name || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const insert = db.prepare("INSERT INTO reviews (user_name, rating, comment) VALUES (?, ?, ?)");
      insert.run(user_name, rating, comment);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit review" });
    }
  });

  app.post("/api/rsvp", (req, res) => {
    const { event_id, name, email } = req.body;
    if (!event_id || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
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
