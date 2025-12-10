import httpClient from "./httpClient";

/**
 * SHOP-014 배송 조회
 * GET /deliveries/{orderId}
 *
 * Response: DeliveryDTO
 *  - deliveryId
 *  - orderId
 *  - trackingNumber
 *  - recipient
 *  - recipientPhone
 *  - deliveryAddress
 *  - deliveryStatus (P/S/D/C)
 *  - estimatedDate
 *  - requestMessage
 */
export const getDeliveryByOrderId = async (orderId) => {
  const res = await httpClient.get(`/deliveries/${orderId}`);
  return res.data;
};
