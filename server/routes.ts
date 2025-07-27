
import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Import storage after it's initialized
  const { storage } = await import("./storage");
  
  // Middleware for JSON parsing
  app.use(express.json());

  // Simple authentication middleware (for demo purposes)
  const authenticateToken = (req: AuthenticatedRequest, res: Response, next: any) => {
    // For now, we'll skip authentication to get the app running
    // In production, implement proper JWT or session-based auth
    next();
  };

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User routes
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, role = 'user' } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = storage.getUserByUsername(username) || storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      const newUser = storage.insertUser({ username, email, password_hash, role });
      const { password_hash: _, ...userResponse } = newUser;
      
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth routes (matching frontend expectations)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password_hash: _, ...userResponse } = user;
      res.json({ 
        token: `token_${user.id}_${Date.now()}`, // Simple token for demo
        user: userResponse, 
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/verify", (req: Request, res: Response) => {
    // Simple token verification for demo
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No valid token" });
    }

    const token = authHeader.split(' ')[1];
    if (token.startsWith('token_')) {
      const userId = token.split('_')[1];
      const user = storage.getUserById(parseInt(userId));
      if (user) {
        const { password_hash: _, ...userResponse } = user;
        return res.json(userResponse);
      }
    }

    res.status(401).json({ message: "Invalid token" });
  });

  app.post("/api/users/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password_hash: _, ...userResponse } = user;
      res.json({ user: userResponse, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users", authenticateToken, (req: Request, res: Response) => {
    try {
      const users = storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Donor routes
  app.get("/api/donors", (req: Request, res: Response) => {
    try {
      const { search, university } = req.query;
      
      let donors;
      if (search) {
        donors = storage.searchDonors(search as string);
      } else if (university) {
        donors = storage.getDonorsByUniversity(university as string);
      } else {
        donors = storage.getAllDonors();
      }
      
      res.json(donors);
    } catch (error) {
      console.error("Get donors error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/donors/stats", (req: Request, res: Response) => {
    try {
      const stats = storage.getDonorStats();
      res.json(stats);
    } catch (error) {
      console.error("Get donor stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/donors/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donor ID" });
      }

      const donor = storage.getDonorById(id);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }

      res.json(donor);
    } catch (error) {
      console.error("Get donor error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/donors", (req: Request, res: Response) => {
    try {
      const donorData = req.body;
      
      if (!donorData.name) {
        return res.status(400).json({ message: "Donor name is required" });
      }

      const newDonor = storage.insertDonor(donorData);
      res.status(201).json(newDonor);
    } catch (error) {
      console.error("Create donor error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/donors/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donor ID" });
      }

      const donorData = req.body;
      if (!donorData.name) {
        return res.status(400).json({ message: "Donor name is required" });
      }

      const existingDonor = storage.getDonorById(id);
      if (!existingDonor) {
        return res.status(404).json({ message: "Donor not found" });
      }

      const updatedDonor = storage.updateDonor(id, donorData);
      res.json(updatedDonor);
    } catch (error) {
      console.error("Update donor error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/donors/:id", (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donor ID" });
      }

      const success = storage.deleteDonor(id);
      if (!success) {
        return res.status(404).json({ message: "Donor not found" });
      }

      res.json({ message: "Donor deleted successfully" });
    } catch (error) {
      console.error("Delete donor error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Batch operations for mass entry
  app.post("/api/donors/batch", (req: Request, res: Response) => {
    try {
      const { donors } = req.body;
      
      if (!Array.isArray(donors)) {
        return res.status(400).json({ message: "Donors must be an array" });
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < donors.length; i++) {
        try {
          if (!donors[i].name) {
            errors.push({ index: i, error: "Name is required" });
            continue;
          }
          const newDonor = storage.insertDonor(donors[i]);
          results.push(newDonor);
        } catch (error) {
          errors.push({ index: i, error: error.message });
        }
      }

      res.json({
        success: results.length,
        errors: errors.length,
        created: results,
        errorDetails: errors
      });
    } catch (error) {
      console.error("Batch create donors error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
