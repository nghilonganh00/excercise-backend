export type Gender = 'male' | 'female';

export function calculateBodyFatPercentage(
  gender: Gender,
  height: number,
  waist: number,
  neck: number,
): number {
  const log10 = (value: number) => Math.log10(value);

  if (gender === 'male') {
    const denominator =
      1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height);
    const bodyFat = 495 / denominator - 450;
    return +bodyFat.toFixed(2);
  }

  if (gender === 'female') {
    const denominator =
      1.29579 - 0.35004 * log10(waist + neck) + 0.221 * log10(height);
    const bodyFat = 495 / denominator - 450;
    return +bodyFat.toFixed(2);
  }

  throw new Error('Invalid gender. Must be "male" or "female".');
}
