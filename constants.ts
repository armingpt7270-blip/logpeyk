import { Driver, DriverStatus, Ride, RideStatus } from './types';

// Centered around Tehran, Iran
export const MAP_CENTER = { lat: 35.6892, lng: 51.3890 };

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'علی رضایی',
    vehicleType: 'پراید',
    status: DriverStatus.AVAILABLE,
    location: { lat: 35.6992, lng: 51.3890, address: 'خیابان انقلاب' },
    rating: 4.8,
    avatarUrl: 'https://picsum.photos/seed/ali/100/100'
  },
  {
    id: 'd2',
    name: 'سارا محمدی',
    vehicleType: 'پژو ۲۰۶',
    status: DriverStatus.BUSY,
    location: { lat: 35.7050, lng: 51.4050, address: 'میدان ولیعصر' },
    rating: 4.9,
    avatarUrl: 'https://picsum.photos/seed/sara/100/100',
    currentRideId: 'r1'
  },
  {
    id: 'd3',
    name: 'محمد کمالی',
    vehicleType: 'موتور سیکلت',
    status: DriverStatus.AVAILABLE,
    location: { lat: 35.6850, lng: 51.3750, address: 'خیابان آزادی' },
    rating: 4.7,
    avatarUrl: 'https://picsum.photos/seed/reza/100/100'
  },
  {
    id: 'd4',
    name: 'مریم حسینی',
    vehicleType: 'سمند',
    status: DriverStatus.OFFLINE,
    location: { lat: 35.7150, lng: 51.3950, address: 'پارک لاله' },
    rating: 4.9,
    avatarUrl: 'https://picsum.photos/seed/maryam/100/100'
  }
];

export const INITIAL_RIDES: Ride[] = [
  {
    id: 'r1',
    customerName: 'فروشگاه کوروش',
    pickup: { lat: 35.7050, lng: 51.4050, address: 'میدان ولیعصر' },
    dropoff: { lat: 35.7200, lng: 51.4200, address: 'سید خندان' },
    status: RideStatus.IN_PROGRESS,
    driverId: 'd2',
    price: 45000,
    requestedAt: new Date(Date.now() - 1000 * 60 * 15),
    priority: 'NORMAL'
  },
  {
    id: 'r2',
    customerName: 'رستوران نایب',
    pickup: { lat: 35.6992, lng: 51.3890, address: 'بازار بزرگ' },
    dropoff: { lat: 35.7500, lng: 51.4000, address: 'ونک' },
    status: RideStatus.PENDING,
    price: 68000,
    requestedAt: new Date(Date.now() - 1000 * 60 * 5),
    priority: 'HIGH'
  }
];