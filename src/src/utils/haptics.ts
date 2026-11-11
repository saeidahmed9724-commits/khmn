/**
 * Haptic feedback utility using the Vibration API.
 * Falls back silently on devices/browsers that don't support it.
 */

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/** Short tap – card flip, button press */
export function hapticTap() {
  if (canVibrate()) navigator.vibrate(15);
}

/** Medium pulse – card discard / lock */
export function hapticImpact() {
  if (canVibrate()) navigator.vibrate([30, 40, 20]);
}

/** Heavy buzz – wrong guess */
export function hapticError() {
  if (canVibrate()) navigator.vibrate([50, 30, 50, 30, 50]);
}

/** Success pattern – correct guess / victory */
export function hapticSuccess() {
  if (canVibrate()) navigator.vibrate([20, 60, 20, 60, 40]);
}

/** Notification – reaction received */
export function hapticNotification() {
  if (canVibrate()) navigator.vibrate([10, 30, 10]);
}
