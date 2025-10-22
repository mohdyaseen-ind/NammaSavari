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
        lng: number
        address?: string
    }
    dropoff: {
        lat: number
        lng: number
        address?: string
    }
}