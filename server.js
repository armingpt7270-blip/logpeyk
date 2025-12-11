import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Initialize Google GenAI with API Key from environment
// This runs only on the server, so the key is secure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

/**
 * Endpoint: /api/ride/parse
 * Extracts ride details from natural language text.
 */
app.post('/api/ride/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Extract ride details from this Persian (Farsi) text: "${text}". 
      Translate locations to approximate coordinates in Tehran if needed conceptually (though frontend handles mock coords).
      The output must be in English keys but values can be Persian strings for names/addresses.
      If information is missing, infer reasonable defaults or leave empty string. 
      Priority should be NORMAL unless urgency (فوری/اورژانسی) is implied.
      Example: "بسته رو از ونک ببر به آزادی" -> pickup: "ونک", dropoff: "آزادی"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            pickupAddress: { type: Type.STRING },
            dropoffAddress: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["NORMAL", "HIGH", "URGENT"] },
            notes: { type: Type.STRING },
          },
          required: ["customerName", "pickupAddress", "dropoffAddress", "priority"]
        }
      }
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: 'No response from AI' });
    }
  } catch (error) {
    console.error("Backend Error (Parse Ride):", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint: /api/driver/suggest
 * Selects the best driver based on ride and driver data.
 */
app.post('/api/driver/suggest', async (req, res) => {
  try {
    const { ride, drivers } = req.body;

    if (!ride || !drivers) {
      return res.status(400).json({ error: 'Ride and Drivers data required' });
    }

    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');
    
    if (availableDrivers.length === 0) {
      return res.json({ driverId: null });
    }

    const driversJson = JSON.stringify(availableDrivers.map(d => ({
      id: d.id,
      name: d.name,
      vehicle: d.vehicleType,
      rating: d.rating,
      location: d.location.address
    })));

    const rideJson = JSON.stringify({
      pickup: ride.pickup.address,
      dropoff: ride.dropoff.address,
      priority: ride.priority,
      notes: ride.notes
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `
        Task: Select the best driver for this ride in Tehran.
        Ride: ${rideJson}
        Available Drivers: ${driversJson}
        
        Rules:
        1. Consider distance/location (assume standard Tehran layout).
        2. High priority rides need higher rated drivers if possible.
        3. Return ONLY the ID of the selected driver in a simple JSON object.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            driverId: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: 'No response from AI' });
    }
  } catch (error) {
    console.error("Backend Error (Suggest Driver):", error);
    // Fallback: don't fail hard, just return null so frontend can handle it
    res.json({ driverId: null });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});