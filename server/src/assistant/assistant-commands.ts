// This file defines all supported assistant commands and their metadata

export type AssistantCommand = {
  action: string;
  description: string;
  params?: string[]; // List of parameter names, if any
};

export const ASSISTANT_COMMANDS: AssistantCommand[] = [
  {
    action: 'show_cart',
    description: 'Show the user\'s shopping cart',
  },
  {
    action: 'sort_and_filter',
    description: 'Sort and/or filter products',
    params: ['sortBy', 'order', 'filter'],
  },
  {
    action: 'read_description',
    description: 'Read the description of a product',
    params: ['productId'],
  },
  {
    action: 'unknown',
    description: 'Unknown or unsupported command',
    params: ['query'],
  },
  // Add more commands as needed
];
