export type Gender = 'male' | 'female';

export function calculateLeanBodyMass(
  weight: number, 
  height: number, 
  age: number, 
  gender: Gender, 
): number {
  if (age < 13) {
    // Trẻ em
    const lbm =
      3.8 * 0.0215 * Math.pow(weight, 0.6469) * Math.pow(height, 0.7236);
    return +lbm.toFixed(2);
  }

  if (gender === 'male') {
    // Người lớn - Nam
    const lbm = 0.407 * weight + 0.267 * height - 19.2;
    return +lbm.toFixed(2);
  } else if (gender === 'female') {
    // Người lớn - Nữ
    const lbm = 0.252 * weight + 0.473 * height - 48.3;
    return +lbm.toFixed(2);
  }

  throw new Error('Invalid gender value. Must be "male" or "female".');
}
