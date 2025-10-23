export interface DriverOnlineData {
    userId: string,
    location: {
        lat: number,
        lon: number
    },
    vehicleType: string,
    vehicleNumber: string,
    vehicleModel: string
    licensePlate: string
}

export interface DriverOfflineData {
    userId: string
}

export interface DriverLocationData {
    userId: string,
    location: {
        lat: number,
        lon: number
    }
}

export interface RiderRequestRideData {
    userId: string
    pickup: {
        lat: number
        lon: number
        address?: string
    }
    dropoff: {
        lat: number
        lng: number
        address?: string
    }
}

export interface OnlineDriver {
    userId: string
    socketId: string
    location: {
        lat: number
        lon: number
    }
    vehicleInfo: {
        type: string
        number: string
        model: string
        licensePlate: string
    }
    status: 'available' | 'busy'
}
export interface NearbyDriver {
    userId: string
    location: {
        lat: number
        lng: number
    }
    distance: number  // Distance from rider in kilometers
    vehicleType: string
}