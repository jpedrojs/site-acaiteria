/**
 * Re-export dos Controllers (camada MVC).
 * Mantido para compatibilidade com imports existentes.
 *
 * @deprecated Preferir importar diretamente de @/core
 */

export {
  useProducts,
  useProductsAll,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/core/controllers/useProductController";

export {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/core/controllers/useCustomerController";

export {
  useOrders,
  useOrder,
  useCreateOrder,
  useUpdateOrderStatus,
} from "@/core/controllers/useOrderController";

export {
  useSettings,
  useUpdateSetting,
} from "@/core/controllers/useSettingsController";
