// Storage utility functions — used only for expiry alert calculations
// All application/certificate data is now stored in Firebase Firestore.
// localStorage and Django API connections have been removed.

export function getRemainingDays(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getExpiryAlertInfo(expiryDateStr) {
  const days = getRemainingDays(expiryDateStr);
  if (days < 0) {
    return {
      severity: 'expired',
      level: 'EXPIRED',
      daysOverdue: Math.abs(days),
      title: 'Certificate Expired',
      message: `Expired ${Math.abs(days)} days ago. Commercial use without re-verification is prohibited by law.`,
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      bannerBg: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      requiresAction: true,
      actionText: 'Apply for Urgent Re-verification'
    };
  } else if (days <= 7) {
    return {
      severity: 'urgent',
      level: 'URGENT',
      remainingDays: days,
      title: 'Critical Expiry Alert',
      message: `Expires in ${days} ${days === 1 ? 'day' : 'days'}. Schedule inspection immediately to prevent statutory penalties.`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      bannerBg: 'bg-rose-50 border-rose-200 text-rose-900',
      iconColor: 'text-rose-600',
      requiresAction: true,
      actionText: 'Renew Certificate'
    };
  } else if (days <= 15) {
    return {
      severity: 'warning',
      level: 'WARNING',
      remainingDays: days,
      title: 'Expiry Warning',
      message: `Expires in ${days} days. Please initiate re-verification application.`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      bannerBg: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      requiresAction: true,
      actionText: 'Initiate Renewal'
    };
  } else if (days <= 30) {
    return {
      severity: 'reminder',
      level: 'REMINDER',
      remainingDays: days,
      title: 'Upcoming Expiry Reminder',
      message: `Expires in ${days} days. Verification slots for next month are now open.`,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      bannerBg: 'bg-blue-50 border-blue-200 text-blue-900',
      iconColor: 'text-blue-600',
      requiresAction: false,
      actionText: 'View Certificate'
    };
  }
  return {
    severity: 'valid',
    level: 'VALID',
    remainingDays: days,
    title: 'Valid & Certified',
    message: `Valid for ${days} more days.`,
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    iconColor: 'text-emerald-600',
    requiresAction: false,
    actionText: 'View Certificate'
  };
}
