import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Heart, TrendingUp, Building2, Calendar, MapPin, ArrowLeft, User, Trash2, Mail, Lock, Edit2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { authAPI } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast'; // Default axios client with credentials

interface Donation {
  id: number;
  amount: number;
  currency: string;
  created_at: string;
  crisis_title: string;
  crisis_country: string;
  charity_name: string;
}

interface DonationSummary {
  total_amount: number;
  currency: string;
  crisis_count: number;
  charity_count: number;
}

// Custom hook for fetching user donations
const useUserDonations = () => {
  return useQuery({
    queryKey: ['user-donations'],
    queryFn: async () => {
      const response = await api.get('/api/me/donations');
      return response.data as Donation[];
    },
  });
};

// Custom hook for fetching donation summary
const useUserDonationSummary = () => {
  return useQuery({
    queryKey: ['user-donation-summary'],
    queryFn: async () => {
      const response = await api.get('/api/me/donations/summary');
      return response.data as DonationSummary;
    },
  });
};

// Format currency with proper symbol
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Assuming amount is in cents
};

// Format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

interface DashboardProps {
  onLogout?: () => void;
}

// Helper to derive microcopy for stat cards
const getDonationMicrocopy = (summary: DonationSummary | undefined, donations: Donation[] | undefined) => {
  if (!summary || !donations || donations.length === 0 || summary.total_amount === 0) {
    return {
      total: "You haven't donated yet",
      crises: 'Support your first crisis to see impact here',
      charities: 'Back trusted organizations to see this fill in',
    };
  }

  const crisisLabel = summary.crisis_count === 1 ? 'crisis' : 'crises';
  const charityLabel = summary.charity_count === 1 ? 'charity' : 'charities';

  return {
    total: `Across ${summary.crisis_count} ${crisisLabel} this year`,
    crises: `${summary.crisis_count} ${crisisLabel} supported so far`,
    charities: `${summary.charity_count} ${charityLabel} partnered with you`,
  };
};

function Dashboard({ onLogout }: DashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'donations' | 'profile'>('donations');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: donations, isLoading, error, refetch } = useUserDonations();
  const { data: summary } = useUserDonationSummary();

  // Fetch current user info
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const response = await authAPI.me();
      return response;
    },
  });

  // Debug logging
  console.log('Dashboard Debug:', {
    currentUser,
    donations,
    summary,
    isLoading,
    error: error?.message,
    userError: userError?.message,
  });

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.patch('/api/me/email', { email });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setIsEditing(false);
      setNewEmail('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update email',
        variant: 'destructive',
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await api.patch('/api/me/password', { password });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      setIsEditing(false);
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update password',
        variant: 'destructive',
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/api/me/account');
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted',
      });
      setTimeout(() => {
        if (onLogout) onLogout();
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete account',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    updateEmailMutation.mutate(newEmail);
  };

  const handleUpdatePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Don\'t Match',
        description: 'Please make sure both passwords match',
        variant: 'destructive',
      });
      return;
    }
    updatePasswordMutation.mutate(newPassword);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const microcopy = useMemo(() => getDonationMicrocopy(summary, donations), [summary, donations]);

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNavigation>
          {onLogout && (
            <button
              onClick={onLogout}
              className="border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 hover:border-white/20 hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </Header>

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="text-red-400 text-lg">Failed to load donations</div>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNavigation>
        {onLogout && (
          <button
            onClick={onLogout}
            className="border border-white/10 rounded-md px-3 py-1.5 text-sm text-slate-300 hover:border-white/20 hover:bg-white/5 transition-all duration-200 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </Header>

      <main className="pt-28 pb-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 text-sm">
                {currentUser?.email || 'Loading account details...'}
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Map
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === 'donations'
                  ? 'border-white/20 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Donations
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
                activeTab === 'profile'
                  ? 'border-white/20 text-white bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
          </div>

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <>
              {/* Summary Cards */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 mb-4" />
                      <div className="h-6 w-24 bg-white/10 rounded mb-2" />
                      <div className="h-4 w-32 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Total Donated */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Total Donated</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {summary ? formatCurrency(summary.total_amount, summary.currency) : '$0'}
                    </div>
                    <div className="text-xs text-slate-400">{microcopy.total}</div>
                  </div>

                  {/* Crises Supported */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Crises Supported</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {summary?.crisis_count || 0}
                    </div>
                    <div className="text-xs text-slate-400">{microcopy.crises}</div>
                  </div>

                  {/* Charities Supported */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Charities Supported</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {summary?.charity_count || 0}
                    </div>
                    <div className="text-xs text-slate-400">{microcopy.charities}</div>
                  </div>
                </div>
              )}

              {/* Recent Donations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Recent Donations</h2>
                  {!isLoading && donations && donations.length > 0 && (
                    <span className="text-sm text-slate-400">
                      {donations.length} donation{donations.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 animate-pulse"
                      >
                        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                        <div className="h-4 w-48 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                ) : !donations || donations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">No donations yet</h3>
                      <p className="text-slate-400 max-w-md text-sm">
                        You haven't made any donations yet. Explore the map to find a crisis to support.
                      </p>
                    </div>
                    <Link to="/">
                      <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500">
                        <MapPin className="w-4 h-4" />
                        Explore Map
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Responsive table / cards */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Crisis
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                              Country
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                              Charity
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations?.map((donation) => (
                            <tr
                              key={donation.id}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 px-4 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-slate-500" />
                                  {formatDate(donation.created_at)}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-white font-medium">
                                {donation.crisis_title}
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-400 hidden md:table-cell">
                                {donation.crisis_country}
                              </td>
                              <td className="py-4 px-4 text-sm text-slate-400 hidden lg:table-cell">
                                {donation.charity_name}
                              </td>
                              <td className="py-4 px-4 text-sm text-right font-semibold text-cyan-400">
                                {formatCurrency(donation.amount, donation.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-white">{donation.crisis_title}</div>
                            <div className="text-sm font-semibold text-cyan-400">
                              {formatCurrency(donation.amount, donation.currency)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(donation.created_at)}
                            </div>
                            <span>{donation.crisis_country}</span>
                          </div>
                          {donation.charity_name && (
                            <div className="text-xs text-slate-400">
                              Charity: <span className="text-slate-200">{donation.charity_name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Impact sections for users with donations */}
              {donations && donations.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                  <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
                    <h3 className="text-sm font-semibold text-white mb-1">Your impact over time</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      This placeholder chart will evolve into a time-series view of how your support reaches different crises.
                    </p>
                    <div className="h-40 rounded-lg bg-[radial-gradient(circle_at_top,_#22d3ee1a,_transparent_55%),_radial-gradient(circle_at_bottom,_#6366f11a,_transparent_55%)] border border-white/5" />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-white mb-2">Crises you supported</h3>
                      <ul className="space-y-2 max-h-40 overflow-y-auto text-sm">
                        {[...new Map(donations.map((d) => [d.crisis_title, d])).values()].map((d) => (
                          <li key={d.crisis_title} className="flex items-center justify-between">
                            <span className="text-slate-200 truncate mr-2">{d.crisis_title}</span>
                            <span className="text-xs text-slate-500">{d.crisis_country}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-white mb-2">Charity breakdown</h3>
                      <p className="text-xs text-slate-400 mb-3">
                        This static placeholder represents how your giving is distributed across organizations.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 h-20">
                          <div className="absolute inset-0 rounded-full bg-cyan-500/40" />
                          <div className="absolute inset-2 rounded-full bg-emerald-500/40" />
                          <div className="absolute inset-4 rounded-full bg-blue-500/40" />
                        </div>
                        <div className="space-y-1 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Emergency relief partners
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Long-term recovery
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                            Preparedness & resilience
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Info Card */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Email Section */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder={currentUser?.email || 'Enter new email'}
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Button
                          onClick={handleUpdateEmail}
                          disabled={updateEmailMutation.isPending}
                          className="gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Update
                        </Button>
                      </div>
                    ) : (
                      <div className="text-white text-lg">{currentUser?.email || 'Loading...'}</div>
                    )}
                  </div>

                  {/* Password Section */}
                  {isEditing && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <Lock className="w-4 h-4" />
                        Change Password
                      </label>
                      <Input
                        type="password"
                        placeholder="New password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={updatePasswordMutation.isPending}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Update Password
                      </Button>
                    </div>
                  )}

                  {/* Account Created */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-sm text-slate-400">
                      Account created: {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Loading...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your account, donation history, and all associated data.
                </p>

                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-400 font-semibold">Are you absolutely sure?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleteAccountMutation.isPending}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Yes, Delete My Account
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
