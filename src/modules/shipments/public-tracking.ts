import { Shipment } from '../../entities/shipment.entity';

// Public view of a shipment: what a tracking page needs to display, nothing more.
// Never names, emails, phone numbers, addresses, contents, declared value or internal notes:
// the route is open to anyone who knows (or guesses) a tracking number.
export function toPublicTracking(s: Shipment) {
  return {
    trackingNumber:    s.trackingNumber,
    status:            s.status,
    transportMode:     s.transportMode,
    category:          s.category,
    weightKg:          s.weightKg != null ? Number(s.weightKg) : null,
    origin:            { city: s.senderCity, country: s.senderCountry },
    destination:       { city: s.receiverCity, country: s.receiverCountry },
    estimatedDelivery: s.estimatedDelivery ?? null,
    createdAt:         s.createdAt,
    updatedAt:         s.updatedAt,
    checkpoints: (s.checkpoints ?? []).map((cp) => ({
      status:      cp.status,
      statusLabel: cp.statusLabel,
      facility:    cp.facility ?? null,
      city:        cp.city,
      country:     cp.country,
      lat:         Number(cp.lat),
      lng:         Number(cp.lng),
      occurredAt:  cp.occurredAt,
    })),
  };
}

export type PublicTracking = ReturnType<typeof toPublicTracking>;
