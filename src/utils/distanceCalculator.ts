export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  coords1: Coordinates,
  coords2: Coordinates
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coords2.latitude - coords1.latitude);
  const dLon = toRadians(coords2.longitude - coords1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coords1.latitude)) *
      Math.cos(toRadians(coords2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return 'Nearby';
  } else if (distance < 1) {
    return `${(distance * 5280).toFixed(0)} ft`;
  } else {
    return `${distance.toFixed(1)} mi`;
  }
}

/**
 * Estimate walking time based on distance
 * Assumes average walking speed of 3 mph
 */
export function estimateWalkingTime(distance: number): string {
  const walkingSpeedMph = 3;
  const timeHours = distance / walkingSpeedMph;
  const timeMinutes = timeHours * 60;

  if (timeMinutes < 1) {
    return '< 1 min';
  } else if (timeMinutes < 60) {
    return `${Math.round(timeMinutes)} min`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = Math.round(timeMinutes % 60);
    return `${hours}h ${minutes}m`;
  }
}