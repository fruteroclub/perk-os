/**
 * InvitationCard Component
 *
 * Displays a single invitation with status badge, code, and actions.
 */

import React, { useState } from 'react';

export interface Invitation {
  id: string;
  code: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdBy: string;
  invitedUsername?: string;
  expiresAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvitationCardProps {
  invitation: Invitation;
  onCancel: (id: string) => Promise<void>;
  onCopy: (code: string) => void;
}

const statusColors: Record<Invitation['status'], string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons: Record<Invitation['status'], string> = {
  pending: '⏳',
  accepted: '✅',
  expired: '⏰',
  cancelled: '❌',
};

export const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onCancel,
  onCopy,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    onCopy(invitation.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await onCancel(invitation.id);
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpiringSoon = () => {
    if (invitation.status !== 'pending') return false;
    const expiresAt = new Date(invitation.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24 && hoursUntilExpiry > 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3" data-testid="invitation-card">
      {/* Header with code and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="text-lg font-mono font-semibold text-foreground bg-muted px-2 py-1 rounded">
            {invitation.code}
          </code>
          {isExpiringSoon() && (
            <span className="text-xs text-orange-400 animate-pulse">Expiring soon!</span>
          )}
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[invitation.status]}`}
        >
          {statusIcons[invitation.status]} {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-muted-foreground space-y-1">
        {invitation.invitedUsername && (
          <div>
            <span className="font-medium">Invited:</span> @{invitation.invitedUsername}
          </div>
        )}
        <div>
          <span className="font-medium">Created:</span> {formatDate(invitation.createdAt)}
        </div>
        {invitation.status === 'pending' && (
          <div>
            <span className="font-medium">Expires:</span> {formatDate(invitation.expiresAt)}
          </div>
        )}
        {invitation.status === 'accepted' && invitation.acceptedAt && (
          <div>
            <span className="font-medium">Accepted:</span> {formatDate(invitation.acceptedAt)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {invitation.status === 'pending' && (
          <>
            <button
              onClick={handleCopy}
              className="flex-1 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
              data-testid="copy-button"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="px-3 py-2 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded hover:bg-destructive/20 transition-colors"
                data-testid="cancel-button"
              >
                Cancel
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="px-3 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                  data-testid="confirm-cancel-button"
                >
                  {isCancelling ? '...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-2 text-sm font-medium bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </>
        )}

        {invitation.status !== 'pending' && (
          <span className="text-sm text-muted-foreground italic">
            {invitation.status === 'accepted' && 'This invitation was used'}
            {invitation.status === 'expired' && 'This invitation has expired'}
            {invitation.status === 'cancelled' && 'This invitation was cancelled'}
          </span>
        )}
      </div>
    </div>
  );
};

export default InvitationCard;
