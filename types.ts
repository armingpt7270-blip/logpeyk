export enum RideStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  location?: { lat: number; lng: number }; // Added precise location
}

export interface Store {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
}

export interface Ride {
  id: string;
  customerName: string; // Keep for AI parsed result compatibility
  customerId?: string; // Link to actual customer
  storeId?: string; // Link to actual store
  pickup: Location;
  dropoff: Location;
  status: RideStatus;
  driverId?: string;
  price: number;
  requestedAt: Date;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicleType: string;
  status: DriverStatus;
  location: Location;
  rating: number;
  avatarUrl: string;
  currentRideId?: string;
  phone: string; // Added phone for management
}

export interface AIParseResult {
  customerName: string;
  pickupAddress: string;
  dropoffAddress: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  notes?: string;
}