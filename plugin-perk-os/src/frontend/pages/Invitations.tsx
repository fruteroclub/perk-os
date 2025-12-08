/**
 * Invitations Page
 *
 * Web UI for managing community invitations.
 * Features:
 * - View all invitations with status filters
 * - Create new invitations
 * - Copy invitation codes to clipboard
 * - Cancel pending invitations
 */

import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationCard, type Invitation } from '../components/InvitationCard';

const queryClient = new QueryClient();

interface ElizaConfig {
  agentId: string;
  apiBase: string;
}

interface InvitationStats {
  pending: number;
  accepted: number;
  expired: number;
  cancelled: number;
}

type StatusFilter = 'all' | 'pending' | 'accepted' | 'expired' | 'cancelled';

/**
 * Build the plugin API URL for ElizaOS
 * Routes are mounted at: /api/agents/{agentId}/plugins/{pluginName}{path}
 */
function buildPluginApiUrl(apiBase: string, agentId: string, path: string): string {
  const pluginName = 'plugin-perk-os';
  return `${apiBase}/api/agents/${agentId}/plugins/${pluginName}${path}`;
}

/**
 * Invitations management panel
 */
function InvitationsPanel({ apiBase, agentId, userId }: { apiBase: string; agentId: string; userId: string }) {
  const queryClientHook = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch invitations
  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    error: invitationsError,
  } = useQuery({
    queryKey: ['invitations', userId, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ userId });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`${buildPluginApiUrl(apiBase, agentId, '/invitations')}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const json = await response.json();
      return json.data as Invitation[];
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['invitationStats', userId],
    queryFn: async () => {
      const response = await fetch(`${buildPluginApiUrl(apiBase, agentId, '/invitations/stats')}?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const json = await response.json();
      return json.data as InvitationStats;
    },
  });

  // Create invitation mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(buildPluginApiUrl(apiBase, agentId, '/invitations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invitation');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClientHook.invalidateQueries({ queryKey: ['invitations'] });
      queryClientHook.invalidateQueries({ queryKey: ['invitationStats'] });
      showToast(`Created invitation: ${data.data.code}`, 'success');
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  // Cancel invitation mutation
  const cancelMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetch(buildPluginApiUrl(apiBase, agentId, `/invitations/${invitationId}`), {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel invitation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['invitations'] });
      queryClientHook.invalidateQueries({ queryKey: ['invitationStats'] });
      showToast('Invitation cancelled', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  // Copy to clipboard
  const handleCopy = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        showToast('Code copied to clipboard!', 'success');
      } catch {
        showToast('Failed to copy code', 'error');
      }
    },
    [showToast]
  );

  // Cancel invitation
  const handleCancel = useCallback(
    async (id: string) => {
      await cancelMutation.mutateAsync(id);
    },
    [cancelMutation]
  );

  const invitations = invitationsData || [];
  const stats = statsData || { pending: 0, accepted: 0, expired: 0, cancelled: 0 };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
          data-testid="toast"
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invitations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage community invitation codes
          </p>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          data-testid="create-button"
        >
          {createMutation.isPending ? 'Creating...' : '+ New Invitation'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Accepted" value={stats.accepted} color="green" />
        <StatCard label="Expired" value={stats.expired} color="gray" />
        <StatCard label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'accepted', 'expired', 'cancelled'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === filter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            data-testid={`filter-${filter}`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Invitations list */}
      <div className="space-y-3">
        {isLoadingInvitations && (
          <div className="text-center py-8 text-muted-foreground">
            Loading invitations...
          </div>
        )}

        {invitationsError && (
          <div className="text-center py-8 text-red-400">
            Failed to load invitations. Please try again.
          </div>
        )}

        {!isLoadingInvitations && !invitationsError && invitations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {statusFilter === 'all'
              ? 'No invitations yet. Create one to get started!'
              : `No ${statusFilter} invitations.`}
          </div>
        )}

        {invitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            onCancel={handleCancel}
            onCopy={handleCopy}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'yellow' | 'green' | 'gray' | 'red';
}) {
  const colorClasses = {
    yellow: 'border-yellow-500/30 text-yellow-400',
    green: 'border-green-500/30 text-green-400',
    gray: 'border-gray-500/30 text-gray-400',
    red: 'border-red-500/30 text-red-400',
  };

  return (
    <div className={`bg-card border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/**
 * Main Invitations page wrapper
 */
function InvitationsPage() {
  const config = (window as any).ELIZA_CONFIG as ElizaConfig | undefined;
  const agentId = config?.agentId;
  const apiBase = config?.apiBase || 'http://localhost:3000';

  // Apply dark mode
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!agentId) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600 font-medium">Error: Agent ID not found</div>
        <div className="text-sm text-gray-600 mt-2">
          The server should inject the agent ID configuration.
        </div>
      </div>
    );
  }

  // MVP: Use agentId as userId for simplicity
  // Post-MVP: Get actual user ID from auth session
  return (
    <QueryClientProvider client={queryClient}>
      <InvitationsPanel apiBase={apiBase} agentId={agentId} userId={agentId} />
    </QueryClientProvider>
  );
}

/**
 * Panel configuration for ElizaOS agent UI integration
 */
export const InvitationsPanel_Config = {
  name: 'Invitations',
  path: 'invitations',
  component: InvitationsPage,
  icon: 'Mail',
  public: false,
  shortLabel: 'Invites',
};

export default InvitationsPage;
