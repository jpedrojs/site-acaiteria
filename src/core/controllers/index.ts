/**
 * Barrel export de todos os Controllers
 */

export * from "./useProductController";
export {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useSearchCustomerByPhone,
} from "./useCustomerController";
export * from "./useOrderController";
export * from "./useSettingsController";
