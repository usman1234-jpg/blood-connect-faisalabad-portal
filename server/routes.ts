
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, insertDonorSchema } from "../shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const user = await storage.insertUser(userData);
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(400).json({ message: 'Invalid input data' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || !(await storage.verifyPassword(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Donor routes (protected)
  app.get('/api/donors', authenticateToken, async (req: Request, res: Response) => {
    try {
      const donors = await storage.getAllDonors();
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donors' });
    }
  });

  app.get('/api/donors/search', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query required' });
      }
      
      const donors = await storage.searchDonors(q);
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: 'Search failed' });
    }
  });

  app.get('/api/donors/blood-type/:type', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const donors = await storage.getDonorsByBloodType(type);
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donors by blood type' });
    }
  });

  app.get('/api/donors/university/:university', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { university } = req.params;
      const donors = await storage.getDonorsByUniversity(university);
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donors by university' });
    }
  });

  app.get('/api/donors/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid donor ID' });
      }
      
      const donor = await storage.getDonorById(id);
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      
      res.json(donor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch donor' });
    }
  });

  app.post('/api/donors', authenticateToken, async (req: Request, res: Response) => {
    try {
      const donorData = insertDonorSchema.parse(req.body);
      const donor = await storage.insertDonor(donorData);
      res.status(201).json(donor);
    } catch (error) {
      res.status(400).json({ message: 'Invalid donor data' });
    }
  });

  app.post('/api/donors/bulk', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { donors: donorsData } = req.body;
      if (!Array.isArray(donorsData)) {
        return res.status(400).json({ message: 'Donors array required' });
      }
      
      const validatedDonors = donorsData.map(donor => insertDonorSchema.parse(donor));
      const createdDonors = await storage.insertMultipleDonors(validatedDonors);
      res.status(201).json(createdDonors);
    } catch (error) {
      res.status(400).json({ message: 'Invalid donor data' });
    }
  });

  app.put('/api/donors/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid donor ID' });
      }
      
      const donorData = insertDonorSchema.partial().parse(req.body);
      const donor = await storage.updateDonor(id, donorData);
      
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      
      res.json(donor);
    } catch (error) {
      res.status(400).json({ message: 'Invalid donor data' });
    }
  });

  app.delete('/api/donors/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid donor ID' });
      }
      
      const deleted = await storage.deleteDonor(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      
      res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete donor' });
    }
  });

  // Dashboard stats
  app.get('/api/stats', authenticateToken, async (req: Request, res: Response) => {
    try {
      const allDonors = await storage.getAllDonors();
      const stats = {
        totalDonors: allDonors.length,
        bloodTypes: allDonors.reduce((acc: any, donor) => {
          if (donor.bloodType) {
            acc[donor.bloodType] = (acc[donor.bloodType] || 0) + 1;
          }
          return acc;
        }, {}),
        universities: allDonors.reduce((acc: any, donor) => {
          if (donor.university) {
            acc[donor.university] = (acc[donor.university] || 0) + 1;
          }
          return acc;
        }, {}),
        recentDonors: allDonors.slice(-10)
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
