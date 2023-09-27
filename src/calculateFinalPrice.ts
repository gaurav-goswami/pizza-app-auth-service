export const calculatePrice = (
  productPrice: number,
  tax: number,
  discount: number,
  deliveryCharge: number,
) => {
  return productPrice + tax - discount + deliveryCharge;
};
