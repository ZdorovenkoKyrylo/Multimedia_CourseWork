export interface AssistantAction {
  action: string; // e.g., 'show_cart', 'sort_and_filter', 'read_description'
  params?: Record<string, any>; // helper object with sorting/filtering info, etc.
}
