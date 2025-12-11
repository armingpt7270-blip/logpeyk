import { Driver, Ride, Customer, Store } from '../types';
import { INITIAL_DRIVERS, INITIAL_RIDES, INITIAL_CUSTOMERS, INITIAL_STORES } from '../constants';

// Keys for our "Database" tables
const KEYS = {
  DRIVERS: 'db_drivers',
  RIDES: 'db_rides',
  CUSTOMERS: 'db_customers',
  STORES: 'db_stores',
  AUTH: 'db_auth_session'
};

export const db = {
  // Drivers
  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(KEYS.DRIVERS);
    return data ? JSON.parse(data) : INITIAL_DRIVERS;
  },
  saveDrivers: (drivers: Driver[]) => {
    localStorage.setItem(KEYS.DRIVERS, JSON.stringify(drivers));
  },

  // Rides
  getRides: (): Ride[] => {
    const data = localStorage.getItem(KEYS.RIDES);
    return data ? JSON.parse(data) : INITIAL_RIDES;
  },
  saveRides: (rides: Ride[]) => {
    localStorage.setItem(KEYS.RIDES, JSON.stringify(rides));
  },

  // Customers
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // Stores
  getStores: (): Store[] => {
    const data = localStorage.getItem(KEYS.STORES);
    return data ? JSON.parse(data) : INITIAL_STORES;
  },
  saveStores: (stores: Store[]) => {
    localStorage.setItem(KEYS.STORES, JSON.stringify(stores));
  },

  // Auth Helper
  saveCredentials: (username: string, role: string) => {
    localStorage.setItem(KEYS.AUTH, JSON.stringify({ username, role, timestamp: Date.now() }));
  },
  getCredentials: () => {
    const data = localStorage.getItem(KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  clearCredentials: () => {
    localStorage.removeItem(KEYS.AUTH);
  }
};
