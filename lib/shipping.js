// Edit these any time. Amounts are in PHP.
export const ADMIN_FEE = 200;

export const SHIPPING_RATES = [
  { id: 'metro-manila', label: 'Metro Manila', fee: 100 },
  { id: 'luzon', label: 'Luzon (outside Metro Manila)', fee: 150 },
  { id: 'visayas', label: 'Visayas', fee: 200 },
  { id: 'mindanao', label: 'Mindanao', fee: 220 },
  { id: 'international', label: 'International', fee: 600 },
];

export function getShippingFee(id) {
  const match = SHIPPING_RATES.find((r) => r.id === id);
  return match ? match.fee : 0;
}
