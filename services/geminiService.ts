import { GoogleGenAI, Type } from "@google/genai";
import { AIParseResult, Driver, Ride } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

export const parseNaturalLanguageRide = async (text: string): Promise<AIParseResult | null> => {
  try {
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
      return JSON.parse(response.text) as AIParseResult;
    }
    return null;
  } catch (error) {
    console.error("Error parsing ride request:", error);
    return null;
  }
};

export const suggestDriverWithAI = async (ride: Ride, drivers: Driver[]): Promise<string | null> => {
  try {
    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');
    
    if (availableDrivers.length === 0) return null;

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
      const result = JSON.parse(response.text);
      return result.driverId;
    }
    return null;
  } catch (error) {
    console.error("Error suggesting driver:", error);
    // Fallback to first available driver
    const available = drivers.find(d => d.status === 'AVAILABLE');
    return available ? available.id : null;
  }
};