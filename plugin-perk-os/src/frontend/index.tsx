import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';

// Import pages
import InvitationsPage, { InvitationsPanel_Config } from './pages/Invitations';

// Initialize the application - renders InvitationsPage for CD-105 testing
const rootElement = document.getElementById('root');
if (rootElement) {
  // Apply dark mode
  document.documentElement.classList.add('dark');
  createRoot(rootElement).render(<InvitationsPage />);
}

// Define types for integration with agent UI system
export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon?: string;
  public?: boolean;
  shortLabel?: string; // Optional short label for mobile
}

interface PanelProps {
  agentId: string;
}

/**
 * Example panel component for the plugin system
 */
const PanelComponent: React.FC<PanelProps> = ({ agentId }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Example Panel</h2>
      <div>Hello {agentId}!</div>
    </div>
  );
};

// Export the panel configuration for integration with the agent UI
export const panels: AgentPanel[] = [
  {
    name: 'Example',
    path: 'example',
    component: PanelComponent,
    icon: 'Book',
    public: false,
    shortLabel: 'Example',
  },
  // Invitations panel (CD-105)
  {
    name: InvitationsPanel_Config.name,
    path: InvitationsPanel_Config.path,
    component: InvitationsPage,
    icon: InvitationsPanel_Config.icon,
    public: InvitationsPanel_Config.public,
    shortLabel: InvitationsPanel_Config.shortLabel,
  },
];

export * from './utils';
