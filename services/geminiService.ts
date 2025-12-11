import { AIParseResult, Driver, Ride } from "../types";

export const parseNaturalLanguageRide = async (text: string): Promise<AIParseResult | null> => {
  try {
    const response = await fetch('/api/ride/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data as AIParseResult;
  } catch (error) {
    console.error("Error parsing ride request:", error);
    return null;
  }
};

export const suggestDriverWithAI = async (ride: Ride, drivers: Driver[]): Promise<string | null> => {
  try {
    const response = await fetch('/api/driver/suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ride, drivers }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.driverId || null;
  } catch (error) {
    console.error("Error suggesting driver:", error);
    // Fallback logic handled by frontend if API fails
    const available = drivers.find(d => d.status === 'AVAILABLE');
    return available ? available.id : null;
  }
};